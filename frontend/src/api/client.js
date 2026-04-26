/**
 * client.js
 * Axios-based API client for the HELIQx CT backend.
 */

import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, "");

const api = axios.create({
  baseURL: configuredBaseUrl || "/api",
  timeout: 60000, // 60s — LLM calls can be slow
  headers: { "Content-Type": "application/json" },
});

export async function fetchDashboard(filters = {}) {
  const { data } = await api.get("/dashboard", { params: filters });
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
