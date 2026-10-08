import os
import platform
import subprocess
import time
from celery import Celery

# Redis connection URL (broker and result backend)
REDIS_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")

# Uploads directory anchored to project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.getenv("FLUXMEDIA_UPLOAD_DIR", os.path.join(BASE_DIR, "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize Celery
celery_app = Celery(
    "media_worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

# Standard Celery configurations
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_pool="solo" if platform.system() in ("Darwin", "Windows") else "prefork",
)

# Aliases for flexible Celery CLI discovery (celery -A app.worker worker)
app = celery_app
celery = celery_app


@celery_app.task(name="process_video_task")
def process_video_task(input_filename: str) -> dict:
    """
    Asynchronous Celery task that reads an input video from /uploads,
    compresses it using FFmpeg with H.264 codec, and writes the output
    compressed file back to /uploads.
    """
    print(f"[WORKER] Picked up task for: {input_filename}")

    # Anchor input path to UPLOAD_DIR if not absolute
    if not os.path.isabs(input_filename):
        input_filepath = os.path.join(UPLOAD_DIR, input_filename)
    else:
        input_filepath = input_filename

    base_name = os.path.basename(input_filepath)
    output_filename = f"compressed_{base_name}"
    output_filepath = os.path.join(UPLOAD_DIR, output_filename)

    # Check whether input file exists on disk
    if not os.path.exists(input_filepath):
        err_msg = f"Input file not found on disk: '{input_filepath}'"
        print(f"[WORKER] Error: {err_msg}")
        return {"status": "ERROR", "message": err_msg}

    # The FFmpeg command: compress video using the H.264 codec
    command = [
        "ffmpeg",
        "-y",                 # Automatically overwrite existing output files
        "-i", input_filepath, # Input file path in /uploads
        "-vcodec", "libx264", # H.264 video codec
        "-crf", "28",         # Compression rate (higher = smaller file size)
        output_filepath,      # Output file path in /uploads
    ]

    try:
        # Execute the FFmpeg command synchronously within this background worker
        subprocess.run(command, check=True, capture_output=True)
        print(f"[WORKER] Finished compression. Saved as {output_filepath}")
        return {
            "status": "COMPLETED",
            "file": output_filename,
            "filename": output_filename,
            "download_url": f"/download/{output_filename}",
        }

    except FileNotFoundError:
        err_msg = "ffmpeg executable not found in system PATH. Please ensure FFmpeg is installed."
        print(f"[WORKER] Error: {err_msg}")
        return {"status": "ERROR", "message": err_msg}

    except subprocess.CalledProcessError as e:
        err_stderr = (
            e.stderr.decode("utf-8", errors="replace").strip()
            if e.stderr
            else "Unknown FFmpeg error"
        )
        print(f"[WORKER] Error processing {input_filepath}: {err_stderr}")
        return {
            "status": "ERROR",
            "message": "FFmpeg compression failed",
            "details": err_stderr,
        }

    except Exception as exc:
        print(f"[WORKER] Unexpected error processing {input_filepath}: {exc}")
        return {"status": "ERROR", "message": str(exc)}


@celery_app.task(name="dummy_task")
def dummy_task(filename: str) -> dict:
    """
    Simulates asynchronous media processing with a 10-second delay for testing.
    """
    print(f"[WORKER] Starting dummy task for file: {filename}")
    time.sleep(10)
    print(f"[WORKER] Finished dummy task for file: {filename}")
    base_name = os.path.basename(filename)
    output_filename = f"compressed_{base_name}"
    return {
        "status": "COMPLETED",
        "file": output_filename,
        "filename": output_filename,
        "download_url": f"/download/{output_filename}",
        "message": f"Successfully simulated processing for {filename}",
    }


# Backward-compatibility alias
process_media = process_video_task