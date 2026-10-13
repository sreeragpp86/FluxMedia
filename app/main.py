import os
import re
import shutil
import uuid
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
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
    version="1.1.0",
)

# CORS Configuration allowing frontend origin
ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Maximum upload size: 500MB
MAX_UPLOAD_SIZE_BYTES = 500 * 1024 * 1024
CHUNK_SIZE_BYTES = 1024 * 1024  # 1MB buffer

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".mkv", ".webm", ".avi", ".flv", ".m4v"}


def sanitize_filename(name: str) -> str:
    """
    Sanitize filename to prevent directory traversal and code injection attacks.
    """
    # Extract only the base name (strip any leading directory separators)
    clean = os.path.basename(name).strip()
    # Replace anything other than alphanumeric, hyphens, underscores, dots
    clean = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", clean)
    # Ensure there is an extension
    if not clean or clean.startswith("."):
        clean = f"media_{uuid.uuid4().hex[:6]}.mp4"
    return clean


@app.get("/")
def root():
    """Root health and documentation endpoint."""
    return {
        "service": "FluxMedia API",
        "version": "1.1.0",
        "status": "healthy",
        "docs_url": "/docs",
        "theme": "Ivory & Gold",
    }


@app.get("/health")
def health_check():
    """
    Detailed system health inspection (broker & storage).
    """
    storage_accessible = os.path.isdir(UPLOAD_DIR) and os.access(UPLOAD_DIR, os.W_OK)
    
    redis_status = "unknown"
    try:
        # Check celery broker ping
        with celery_app.connection_for_read() as conn:
            conn.ensure_connection(max_retries=1)
            redis_status = "connected"
    except Exception:
        redis_status = "unreachable"

    return {
        "status": "operational" if storage_accessible and redis_status == "connected" else "degraded",
        "storage": "writable" if storage_accessible else "error",
        "broker": redis_status,
        "max_upload_size_mb": 500,
    }


@app.post("/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_file(
    file: UploadFile = File(...),
    crf: Optional[int] = Form(28),
):
    """
    Accepts multipart/form-data video upload, validates size and extension,
    saves it to /uploads with security sanitization, and dispatches a Celery task.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload payload.",
        )

    clean_original = sanitize_filename(file.filename)
    ext = os.path.splitext(clean_original)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported media container '{ext}'. Supported: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # Unique prefix preventing collision
    unique_prefix = uuid.uuid4().hex[:8]
    saved_filename = f"{unique_prefix}_{clean_original}"
    saved_filepath = os.path.join(UPLOAD_DIR, saved_filename)

    total_bytes = 0
    try:
        with open(saved_filepath, "wb") as buffer:
            while chunk := await file.read(CHUNK_SIZE_BYTES):
                total_bytes += len(chunk)
                if total_bytes > MAX_UPLOAD_SIZE_BYTES:
                    # Exceeded maximum allowed size
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="File exceeds maximum allowed upload size of 500MB.",
                    )
                buffer.write(chunk)
    except HTTPException:
        # Clean up partial upload if size exceeded
        if os.path.exists(saved_filepath):
            try:
                os.remove(saved_filepath)
            except OSError:
                pass
        raise
    except Exception as exc:
        if os.path.exists(saved_filepath):
            try:
                os.remove(saved_filepath)
            except OSError:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to stream and store upload: {str(exc)}",
        )
    finally:
        await file.close()

    # Dispatch Celery background task with CRF parameter
    task_crf = max(18, min(int(crf or 28), 35))
    task = process_video_task.delay(saved_filepath, task_crf)

    return {
        "job_id": task.id,
        "task_id": task.id,
        "filename": clean_original,
        "saved_filename": saved_filename,
        "size_bytes": total_bytes,
        "crf": task_crf,
        "status": "Task dispatched",
    }


@app.get("/download/{filename}")
def download_file(filename: str):
    """
    Serves compressed video files safely from /uploads with directory traversal protection.
    """
    clean_name = os.path.basename(filename)
    # Extra security check: do not allow path components
    if clean_name != filename or ".." in filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid filename format.")

    file_path = os.path.join(UPLOAD_DIR, clean_name)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requested file not found.")

    return FileResponse(
        path=file_path,
        filename=clean_name,
        media_type="application/octet-stream",
        headers={
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
            "Content-Disposition": f'attachment; filename="{clean_name}"',
        },
    )


@app.get("/status/{task_id}")
@app.get("/task/{task_id}")
def get_task_status(task_id: str):
    """
    Retrieves the status and result of a Celery background task by its ID.
    Returns status as PENDING, PROCESSING, COMPLETED, or ERROR.
    """
    # Sanitize task_id UUID format
    if not re.match(r"^[a-zA-Z0-9_\-]+$", task_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid task identifier format.")

    try:
        result = AsyncResult(task_id, app=celery_app)
        raw_status = result.status
        task_data = result.result if result.ready() else None

        # Normalize status to user-friendly states (PENDING, PROCESSING, COMPLETED, ERROR)
        if raw_status == "SUCCESS":
            if isinstance(task_data, dict) and task_data.get("status") == "ERROR":
                status_str = "ERROR"
            else:
                status_str = "COMPLETED"
        elif raw_status == "FAILURE":
            status_str = "ERROR"
        elif raw_status == "STARTED":
            status_str = "PROCESSING"
        else:
            status_str = raw_status  # PENDING or RETRY

        return {
            "task_id": task_id,
            "status": status_str,
            "result": task_data,
        }
    except Exception as exc:
        return {
            "task_id": task_id,
            "status": "ERROR",
            "error": str(exc),
        }
