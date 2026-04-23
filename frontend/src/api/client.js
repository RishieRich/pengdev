/**
 * client.js
 * Axios-based API client for the Pawan Engineering Copilot backend.
 */

import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 60000, // 60s — LLM calls can be slow
  headers: { "Content-Type": "application/json" },
});

export async function fetchDashboard() {
  const { data } = await api.get("/dashboard");
  return data;
}

export async function sendMessage(message, sessionId) {
  const { data } = await api.post("/chat", {
    message,
    session_id: sessionId,
  });
  return data.response;
}

export async function clearSession(sessionId) {
  await api.post("/chat/clear", { session_id: sessionId });
}
