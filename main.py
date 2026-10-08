"""Root-level entrypoint alias for convenience.

Allows running both:
  uvicorn app.main:app --reload
and
  uvicorn main:app --reload
"""
from app.main import app

__all__ = ["app"]
