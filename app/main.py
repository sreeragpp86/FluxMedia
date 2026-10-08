import os
import shutil
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from celery.result import AsyncResult

try:
    from app.worker import (
        celery_app,
        process_video_task,
        dummy_task,
        process_media,
        UPLOAD_DIR,
    )
except ImportError:
    from worker import (
        celery_app,
        process_video_task,
        dummy_task,
        process_media,
        UPLOAD_DIR,
    )

app = FastAPI(
    title="FluxMedia API",
    description="Distributed Media Task Queue with FastAPI, Celery, and Redis",
    version="1.0.0",
)

# CORS Configuration allowing Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/")
def root():
    """Root health and documentation endpoint."""
    return {
        "service": "FluxMedia API",
        "status": "running",
        "docs_url": "/docs",
    }


@app.post("/upload", status_code=202)
async def upload_file(file: UploadFile = File(...)):
    """
    Accepts multipart/form-data video upload, saves it to the /uploads directory,
    and dispatches a Celery task to transcode/compress the video.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    # Generate a clean, unique filename to prevent collisions in /uploads
    original_name = os.path.basename(file.filename)
    unique_prefix = uuid.uuid4().hex[:8]
    saved_filename = f"{unique_prefix}_{original_name}"
    saved_filepath = os.path.join(UPLOAD_DIR, saved_filename)

    try:
        # Save uploaded stream to disk
        with open(saved_filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save upload: {exc}")
    finally:
        await file.close()

    # Dispatch Celery background task with the saved file path
    task = process_video_task.delay(saved_filepath)

    return {
        "job_id": task.id,
        "task_id": task.id,
        "filename": original_name,
        "saved_filename": saved_filename,
        "status": "Task dispatched",
    }


# Backward compatibility for direct string filename path
@app.post("/upload/{filename:path}", status_code=202)
def upload_filename_string(filename: str):
    """Fallback endpoint accepting path parameter for testing."""
    task = process_video_task.delay(filename)
    return {
        "job_id": task.id,
        "task_id": task.id,
        "filename": filename,
        "status": "Task dispatched",
    }


@app.get("/download/{filename}")
def download_file(filename: str):
    """
    Serves compressed video files from the /uploads directory.
    """
    clean_name = os.path.basename(filename)
    file_path = os.path.join(UPLOAD_DIR, clean_name)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Requested file not found")

    return FileResponse(
        path=file_path,
        filename=clean_name,
        media_type="application/octet-stream",
    )


@app.get("/status/{task_id}")
@app.get("/task/{task_id}")
def get_task_status(task_id: str):
    """
    Retrieves the status and result of a Celery background task by its ID.
    Returns status as PENDING, PROCESSING, COMPLETED, or ERROR.
    """
    try:
        result = AsyncResult(task_id, app=celery_app)
        raw_status = result.status
        task_data = result.result if result.ready() else None

        # Normalize status to user-friendly states (PENDING, PROCESSING, COMPLETED, ERROR)
        if raw_status == "SUCCESS":
            if isinstance(task_data, dict) and task_data.get("status") == "ERROR":
                status = "ERROR"
            else:
                status = "COMPLETED"
        elif raw_status == "FAILURE":
            status = "ERROR"
        elif raw_status == "STARTED":
            status = "PROCESSING"
        else:
            status = raw_status  # typically PENDING or RETRY

        return {
            "task_id": task_id,
            "status": status,
            "result": task_data,
        }
    except Exception as exc:
        return {
            "task_id": task_id,
            "status": "ERROR",
            "error": str(exc),
        }
