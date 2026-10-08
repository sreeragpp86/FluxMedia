from fastapi import FastAPI
from celery.result import AsyncResult

try:
    from app.worker import (
        celery_app,
        process_video_task,
        dummy_task,
        process_media,
    )
except ImportError:
    from worker import (
        celery_app,
        process_video_task,
        dummy_task,
        process_media,
    )

app = FastAPI(
    title="FluxMedia API",
    description="Distributed Media Task Queue with FastAPI, Celery, and Redis",
    version="1.0.0",
)


@app.get("/")
def root():
    """
    Root health and documentation endpoint.
    """
    return {
        "service": "FluxMedia API",
        "status": "running",
        "docs_url": "/docs",
    }


@app.post("/upload/{filename:path}", status_code=202)
def upload_file(filename: str):
    """
    Accepts a filename/filepath string, dispatches an FFmpeg background task
    using Celery's .delay(), and immediately returns the job ID.
    """
    task = process_video_task.delay(filename)
    return {
        "job_id": task.id,
        "task_id": task.id,
        "filename": filename,
        "status": "Task dispatched",
    }


@app.post("/simulate/{filename:path}", status_code=202)
def simulate_file(filename: str):
    """
    Simulates a 10-second processing delay using dummy_task without requiring an actual video file on disk.
    """
    task = dummy_task.delay(filename)
    return {
        "job_id": task.id,
        "task_id": task.id,
        "filename": filename,
        "status": "Simulation task dispatched",
    }


@app.get("/task/{task_id}")
def get_task_status(task_id: str):
    """
    Retrieves the status and result of a Celery background task by its ID.
    """
    try:
        result = AsyncResult(task_id, app=celery_app)
        return {
            "task_id": task_id,
            "status": result.status,
            "result": result.result if result.ready() else None,
        }
    except Exception as exc:
        return {
            "task_id": task_id,
            "status": "UNKNOWN",
            "error": str(exc),
        }


@app.get("/status/{task_id}", include_in_schema=False)
def get_task_status_alias(task_id: str):
    """Alias for /task/{task_id}."""
    return get_task_status(task_id)
