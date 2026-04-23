"""
copilot_agent.py
LangGraph ReAct agent — Pawan Engineering Business Copilot.
Uses Groq LLM + business data tools to answer questions in Hinglish.
"""

import os
from typing import Optional
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.prebuilt import create_react_agent
from tools.business_tools import ALL_TOOLS

SYSTEM_PROMPT = """You are the Business Copilot for Pawan Engineering (entity: Infinity Die Tools), \
built by ARQ ONE AI Labs. You are grounded exclusively in the FY 2025-26 sales and purchase data.

LANGUAGE: Respond in Hinglish — a natural mix of Hindi and English, the way a friendly Indian \
business advisor would speak. Use Hindi for warmth and relationship, English for numbers and technical terms. \
Never use pure formal Hindi. Never use pure English. Mix it naturally.

BEHAVIOR:
- Always use tools to fetch data before answering. Never guess numbers.
- Be specific: quote actual figures, percentages, and names from the tools.
- Be actionable: after facts, give a short concrete recommendation.
- Keep responses concise — 3 to 6 lines for simple questions, up to 10 for complex ones.
- If the question is outside your data scope, say so clearly and suggest what you can answer.

IMPORTANT: You only have FY 2025-26 data. You cannot answer about future projections, \
personal advice, or topics unrelated to this business data."""


def build_agent():
    """Build and return the LangGraph ReAct agent. Returns None if LLM not configured."""
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        return None

    model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    llm = ChatGroq(
        api_key=api_key,
        model=model_name,
        temperature=0.1,
        max_tokens=1024,
    )

    agent = create_react_agent(
        model=llm,
        tools=ALL_TOOLS,
        prompt=SYSTEM_PROMPT,
    )
    return agent


# Session memory: session_id -> list of (human, assistant) message pairs
_session_history: dict[str, list] = {}

_agent = None


def get_agent():
    global _agent
    if _agent is None:
        _agent = build_agent()
    return _agent


def chat(message: str, session_id: str = "default") -> str:
    """
    Send a message to the copilot agent and return its response.
    Maintains conversation history per session_id.
    """
    agent = get_agent()

    if agent is None:
        return (
            "⚙️ LLM abhi configure nahi hua hai. "
            "Backend ke .env file mein GROQ_API_KEY set karein aur server restart karein. "
            "Iske baad main aapke sawalon ka jawab de sakta hoon!"
        )

    # Build message history
    history = _session_history.get(session_id, [])
    messages = []
    for h_msg, a_msg in history:
        messages.append(HumanMessage(content=h_msg))
        from langchain_core.messages import AIMessage
        messages.append(AIMessage(content=a_msg))
    messages.append(HumanMessage(content=message))

    try:
        result = agent.invoke({"messages": messages})
        response = result["messages"][-1].content

        # Store in history (keep last 10 turns)
        history.append((message, response))
        _session_history[session_id] = history[-10:]

        return response
    except Exception as e:
        return f"Ek technical issue aa gaya: {str(e)}. Please try again."


def clear_session(session_id: str) -> None:
    """Clear conversation history for a session."""
    _session_history.pop(session_id, None)
