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
def process_video_task(input_filename: str, crf: int = 28) -> dict:
    """
    Asynchronous Celery task that reads an input video from /uploads,
    compresses it using FFmpeg with H.264 codec, calculates compression stats,
    and writes the output compressed file back to /uploads.
    """
    print(f"[WORKER] Picked up task for: {input_filename} (CRF: {crf})")

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

    original_size = os.path.getsize(input_filepath)

    # Clamp CRF to valid safe range (18 to 35)
    safe_crf = max(18, min(int(crf or 28), 35))

    # The FFmpeg command: compress video using the H.264 codec
    command = [
        "ffmpeg",
        "-y",                 # Automatically overwrite existing output files
        "-i", input_filepath, # Input file path in /uploads
        "-vcodec", "libx264", # H.264 video codec
        "-crf", str(safe_crf),# Compression rate (higher = smaller file size)
        "-preset", "medium",  # Standard balanced encoding preset
        output_filepath,      # Output file path in /uploads
    ]

    try:
        # Execute the FFmpeg command synchronously within this background worker
        subprocess.run(command, check=True, capture_output=True)
        print(f"[WORKER] Finished compression. Saved as {output_filepath}")

        output_size = os.path.getsize(output_filepath) if os.path.exists(output_filepath) else 0
        savings_pct = (
            round(((original_size - output_size) / original_size * 100), 1)
            if original_size > output_size
            else 0.0
        )

        return {
            "status": "COMPLETED",
            "file": output_filename,
            "filename": output_filename,
            "download_url": f"/download/{output_filename}",
            "original_size": original_size,
            "output_size": output_size,
            "savings_pct": savings_pct,
            "crf": safe_crf,
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
def dummy_task(filename: str, crf: int = 28) -> dict:
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
        "original_size": 25000000,
        "output_size": 13500000,
        "savings_pct": 46.0,
        "crf": crf,
        "message": f"Successfully simulated processing for {filename}",
    }


# Backward-compatibility alias
process_media = process_video_task