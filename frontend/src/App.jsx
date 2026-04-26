import React, { useEffect, useState } from "react";
import { fetchDashboard } from "./api/client";
import { fmtINR } from "./utils/format";
import Dashboard from "./components/Dashboard/index";
import Copilot from "./components/Copilot/index";

export default function App() {
  const [data, setData] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    let mounted = true;

    fetchDashboard()
      .then((dashboard) => {
        if (!mounted) return;
        setData(dashboard);
        setApiStatus("online");
      })
      .catch(() => {
        if (!mounted) return;
        setData({
          available: false,
          message: "Backend is not reachable. Please start the Python API and check the input folder.",
          missingFiles: [],
        });
        setApiStatus("offline");
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!data) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading business data…</p>
      </div>
    );
  }

  if (data.available === false) {
    return (
      <div className="missing-screen">
        <div className="missing-box">
          <div className="missing-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7h5l2 2h11v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <path d="M12 13v3" />
              <path d="M12 10h.01" />
            </svg>
          </div>
          <h1>No KPIs to show</h1>
          <p>{data.message || "Please check the input folder. The data is missing."}</p>
          {data.missingFiles?.length > 0 && (
            <div className="missing-files">
              Required files: {data.missingFiles.join(", ")}
            </div>
          )}
          <code>{String.raw`d:\AI_Projects\ARQ\pengpro1\input`}</code>
        </div>
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
        {apiStatus === "offline" && (
          <div className="banner">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
            <div>
              <strong>Dashboard is running in UI-only mode.</strong> Static FY data is loaded,
              but chat needs the Python API on port 8000.
            </div>
          </div>
        )}

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

        <div className="hero-panel">
          <div className="hero-copy">
            <p className="hero-eyebrow">Instant FY snapshot</p>
            <h1>
              Pawan Engineering performance, clear and modern.
            </h1>
            <p>One screen view of sales, purchases, margins and risk alerts — grounded in your FY 25-26 books.</p>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-label">Sales captured</div>
              <div className="hero-stat-value">{fmtINR(data.headline.sales)}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-label">Purchases captured</div>
              <div className="hero-stat-value">{fmtINR(data.headline.purchases)}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-label">Gross profit</div>
              <div className="hero-stat-value">{fmtINR(data.headline.grossProfit)}</div>
            </div>
          </div>
        </div>

        <div className="main-grid">
          <Dashboard data={data} />
          <Copilot apiOnline={apiStatus === "online"} />
        </div>

        <footer className="footer">
          <div>Demo · figures grounded in FY 25-26 books · overheads not modelled</div>
          <div className="footer-arq">ARQ ONE AI Labs</div>
        </footer>
      </main>
    </div>
  );
}
