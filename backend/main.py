"""
main.py
FastAPI application entry point.
Run: uvicorn main:app --reload --port 8000
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

try:
    from .api.routes import router
except ImportError:
    from api.routes import router

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(BACKEND_DIR / ".env")

app = FastAPI(
    title="Pawan Engineering · Business Copilot API",
    description="Agentic AI backend — ARQ ONE AI Labs",
    version="1.0.0",
)

# CORS — allow the Vite dev server and any production origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"
FRONTEND_INDEX = FRONTEND_DIST / "index.html"

if (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")


@app.get("/")
def root():
    if FRONTEND_INDEX.exists():
        return FileResponse(FRONTEND_INDEX)

    groq_configured = bool(os.getenv("GROQ_API_KEY"))
    return {
        "service": "Pawan Engineering Copilot API",
        "built_by": "ARQ ONE AI Labs",
        "llm_configured": groq_configured,
        "docs": "/docs",
    }


@app.get("/{full_path:path}", include_in_schema=False)
def frontend(full_path: str):
    requested = FRONTEND_DIST / full_path
    if requested.is_file():
        return FileResponse(requested)
    if FRONTEND_INDEX.exists():
        return FileResponse(FRONTEND_INDEX)
    return root()
