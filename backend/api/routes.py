"""
routes.py
FastAPI route definitions.
  GET  /api/dashboard  — full business data for the frontend dashboard
  POST /api/chat       — copilot chat (LangGraph agent)
  POST /api/chat/clear — clear session history
  GET  /api/health     — health check
"""

from fastapi import APIRouter
from pydantic import BaseModel
from data.business_data import PE_DATA
from agents.copilot_agent import chat, clear_session

router = APIRouter(prefix="/api")


# ── Health ────────────────────────────────────────────────────────────────────

@router.get("/health")
def health():
    return {"status": "ok", "service": "Pawan Engineering Copilot"}


# ── Dashboard data ────────────────────────────────────────────────────────────

@router.get("/dashboard")
def dashboard():
    """Return all business data for the frontend to render the dashboard."""
    return PE_DATA


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"


class ChatResponse(BaseModel):
    response: str
    session_id: str


@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    """Send a message to the LangGraph copilot agent."""
    response = chat(req.message, req.session_id)
    return ChatResponse(response=response, session_id=req.session_id)


class ClearRequest(BaseModel):
    session_id: str = "default"


@router.post("/chat/clear")
def clear_chat(req: ClearRequest):
    """Clear conversation history for a session."""
    clear_session(req.session_id)
    return {"cleared": True, "session_id": req.session_id}
