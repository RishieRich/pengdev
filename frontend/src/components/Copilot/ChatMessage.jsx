import React from "react";

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function UserMessage({ text, time }) {
  return (
    <div className="msg-user">
      <div className="msg-text">{text}</div>
      <div className="msg-meta">
        {time}
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="checks-icon">
          <polyline points="18 6 8 16 4 12" /><polyline points="22 8 13 17" />
        </svg>
      </div>
    </div>
  );
}

export function BotMessage({ text, time }) {
  return (
    <div className="msg-bot">
      <div className="msg-head">HELIQx CT Copilot</div>
      <div className="msg-text">{text}</div>
      <div className="msg-meta">{time}</div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="typing">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}
