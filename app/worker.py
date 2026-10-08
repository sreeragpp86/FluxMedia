import os
import platform
import subprocess
import time
from celery import Celery

# Redis connection URL (broker and result backend)
REDIS_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")

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
    Asynchronous Celery task that compresses video using FFmpeg with H.264 codec.
    """
    print(f"[WORKER] Picked up task: Starting FFmpeg compression for {input_filename}")

    # Safely compute output filename preserving directory paths
    dir_name, base_name = os.path.split(input_filename)
    output_filename = (
        os.path.join(dir_name, f"compressed_{base_name}")
        if dir_name
        else f"compressed_{base_name}"
    )

    # Check whether input file exists on disk
    if not os.path.exists(input_filename):
        err_msg = f"Input file not found on disk: '{input_filename}'"
        print(f"[WORKER] Error: {err_msg}")
        return {"status": "error", "message": err_msg}

    # The FFmpeg command: compress video using the H.264 codec
    command = [
        "ffmpeg",
        "-y",                 # Automatically overwrite existing output files
        "-i", input_filename, # Input file path
        "-vcodec", "libx264", # H.264 video codec
        "-crf", "28",         # Compression rate (higher = smaller file size)
        output_filename,      # Output file path
    ]

    try:
        # Execute the FFmpeg command synchronously within this background worker
        subprocess.run(command, check=True, capture_output=True)
        print(f"[WORKER] Finished compression. Saved as {output_filename}")
        return {"status": "success", "file": output_filename}

    except FileNotFoundError:
        err_msg = "ffmpeg executable not found in system PATH. Please ensure FFmpeg is installed."
        print(f"[WORKER] Error: {err_msg}")
        return {"status": "error", "message": err_msg}

    except subprocess.CalledProcessError as e:
        err_stderr = (
            e.stderr.decode("utf-8", errors="replace").strip()
            if e.stderr
            else "Unknown FFmpeg error"
        )
        print(f"[WORKER] Error processing {input_filename}: {err_stderr}")
        return {
            "status": "error",
            "message": "FFmpeg compression failed",
            "details": err_stderr,
        }

    except Exception as exc:
        print(f"[WORKER] Unexpected error processing {input_filename}: {exc}")
        return {"status": "error", "message": str(exc)}


@celery_app.task(name="dummy_task")
def dummy_task(filename: str) -> dict:
    """
    Simulates asynchronous media processing with a 10-second delay for testing.
    """
    print(f"[WORKER] Starting dummy task for file: {filename}")
    time.sleep(10)
    print(f"[WORKER] Finished dummy task for file: {filename}")
    return {
        "status": "success",
        "file": f"compressed_{filename}",
        "message": f"Successfully simulated processing for {filename}",
    }


# Backward-compatibility alias
process_media = process_video_task