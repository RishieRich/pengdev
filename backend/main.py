"""
main.py
FastAPI application entry point.
Run: uvicorn main:app --reload --port 8000
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

load_dotenv()

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


@app.get("/")
def root():
    groq_configured = bool(os.getenv("GROQ_API_KEY"))
    return {
        "service": "Pawan Engineering Copilot API",
        "built_by": "ARQ ONE AI Labs",
        "llm_configured": groq_configured,
        "docs": "/docs",
    }
