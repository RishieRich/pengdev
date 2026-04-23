import React, { useRef } from "react";

const SUGGESTIONS = [
  "Total sales kitna tha?",
  "Top 5 customers batao",
  "March mein kya hua?",
  "Top vendors kaun hain?",
  "Material dependency kya hai?",
  "Is hafte kya check karein?",
];

export default function ChatInput({ onSend, disabled }) {
  const inputRef = useRef(null);

  function handleSend() {
    const val = inputRef.current?.value.trim();
    if (!val || disabled) return;
    onSend(val);
    inputRef.current.value = "";
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSuggestion(s) {
    if (disabled) return;
    onSend(s);
  }

  return (
    <div className="copilot-input-area">
      <div className="suggestions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            className="suggestion"
            type="button"
            onClick={() => handleSuggestion(s)}
            disabled={disabled}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="input-row">
        <input
          ref={inputRef}
          id="ask-input"
          type="text"
          placeholder="Type a message…"
          autoComplete="off"
          onKeyDown={handleKey}
          disabled={disabled}
        />
        <button
          id="ask-btn"
          type="button"
          onClick={handleSend}
          disabled={disabled}
          aria-label="Send"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
