import React, { useEffect, useState } from "react";
import { fetchDashboard } from "./api/client";
import Dashboard from "./components/Dashboard/index";
import Copilot from "./components/Copilot/index";

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch(() =>
        setError("Backend se data nahi aaya. Make sure the Python server is running on port 8000.")
      );
  }, []);

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-box">
          <strong>Connection Error</strong>
          <p>{error}</p>
          <code>cd backend &amp;&amp; uvicorn main:app --reload</code>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading business data…</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <div className="brand-mark">PE</div>
            <div>
              <div className="brand-name">{data.company.label}</div>
              <div className="brand-sub">{data.company.period}</div>
            </div>
          </div>
          <div className="built-by">
            Built by <span className="built-by-name">ARQ ONE AI Labs</span>
          </div>
        </div>
      </header>

      <main className="container main">
        <div className="banner banner-amber">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
          </svg>
          <div>
            <strong>Identity check:</strong> source workbooks par naam{" "}
            <strong>Infinity Die Tools</strong> (UDYAM-DD-01-0002992, Daman) likha hai.
            Dashboard label aapke request ke hisaab se "Pawan Engineering" rakha hai — please
            confirm karein dono ek hi entity hain.
          </div>
        </div>

        <div className="main-grid">
          <Dashboard data={data} />
          <Copilot />
        </div>

        <footer className="footer">
          <div>Demo · figures grounded in FY 25-26 books · overheads not modelled</div>
          <div className="footer-arq">ARQ ONE AI Labs</div>
        </footer>
      </main>
    </div>
  );
}
