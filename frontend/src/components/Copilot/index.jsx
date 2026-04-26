import React, { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { sendMessage, clearSession } from "../../api/client";
import { UserMessage, BotMessage, TypingIndicator } from "./ChatMessage";
import ChatInput from "./ChatInput";

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const SESSION_ID = uuidv4();

const GREETING = {
  id: "greeting",
  role: "bot",
  text: "Namaste! Main aapka Business Copilot hoon 👋\n\nAapki FY 25-26 sales aur purchase books pe grounded hoon. Hindi, English ya Hinglish mein puchhiye — neeche se shortcuts dabaiye ya khud type kijiye.",
  time: nowTime(),
};

export default function Copilot({ apiOnline = true }) {
  const [messages, setMessages] = useState([GREETING]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text) {
    if (!text || loading) return;

    const userMsg = { id: uuidv4(), role: "user", text, time: nowTime() };
    setMessages((prev) => [...prev, userMsg]);

    if (!apiOnline) {
      const errMsg = {
        id: uuidv4(),
        role: "bot",
        text: "Dashboard UI chal raha hai, but chat ke liye backend API connect nahi hai. Backend start karke page refresh karein.",
        time: nowTime(),
      };
      setMessages((prev) => [...prev, errMsg]);
      return;
    }

    setLoading(true);

    try {
      const response = await sendMessage(text, SESSION_ID);
      const botMsg = { id: uuidv4(), role: "bot", text: response, time: nowTime() };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errMsg = {
        id: uuidv4(),
        role: "bot",
        text: "Backend se response nahi aaya. Server check karein.",
        time: nowTime(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    await clearSession(SESSION_ID).catch(() => {});
    setMessages([GREETING]);
  }

  return (
    <aside className="right-col">
      <div className="copilot-card">
        <div className="copilot-header">
          <div className="copilot-brand">
            <div className="copilot-avatar">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.9 4.7L18.5 9 14 12l1.5 5L12 14l-3.5 3L10 12 5.5 9l4.6-1.3z" />
              </svg>
            </div>
            <div>
              <div className="copilot-title">Business Copilot</div>
              <div className="copilot-sub">
                <span className="online-dot" />
                {!apiOnline ? "UI-only mode" : loading ? "typing..." : "online - grounded in your books"}
              </div>
            </div>
          </div>
          <button className="clear-btn" onClick={handleClear} title="Clear chat" type="button">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
            </svg>
          </button>
        </div>

        <div className="messages">
          {messages.map((m) =>
            m.role === "user" ? (
              <UserMessage key={m.id} text={m.text} time={m.time} />
            ) : (
              <BotMessage key={m.id} text={m.text} time={m.time} />
            )
          )}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </aside>
  );
}
