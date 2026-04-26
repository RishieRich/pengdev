import React, { useEffect, useState } from "react";
import { fetchDashboard } from "./api/client";
import { fmtINR } from "./utils/format";
import Dashboard from "./components/Dashboard/index";
import Copilot from "./components/Copilot/index";

const PERIODS = [
  { value: "fy", label: "FY" },
  { value: "q1", label: "Q1" },
  { value: "q2", label: "Q2" },
  { value: "q3", label: "Q3" },
  { value: "q4", label: "Q4" },
  { value: "h1", label: "H1" },
  { value: "h2", label: "H2" },
  { value: "last90", label: "90D" },
];

const OWNER_PIN = "0317";

function Logo() {
  return (
    <div className="brand-mark" aria-label="Pawan Engineering">
      <svg viewBox="0 0 48 48" role="img" aria-hidden="true">
        <path d="M8 34V14h16c6.2 0 10 3.5 10 9s-3.8 9-10 9h-7v2h23v6H8v-6Zm9-8h7c2.5 0 4-1.1 4-3s-1.5-3-4-3h-7v6Z" />
        <path d="M36 12h4v16h-4z" />
      </svg>
    </div>
  );
}

function SignIn({ onSuccess }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (pin === OWNER_PIN) {
      sessionStorage.setItem("pe_owner_session", "active");
      onSuccess();
      return;
    }
    setError("PIN galat hai. Please try again.");
    setPin("");
  }

  return (
    <div className="signin-screen">
      <div className="signin-shell">
        <div className="signin-orbit">
          <div className="signin-logo">
            <Logo />
          </div>
          <span className="orbit-dot dot-one" />
          <span className="orbit-dot dot-two" />
          <span className="orbit-dot dot-three" />
        </div>

        <div className="signin-copy">
          <p className="hero-eyebrow">Owner access</p>
          <h1>Welcome Pawan Seth</h1>
          <p>Secure dashboard ready hai. PIN enter karke live business cockpit open karein.</p>
        </div>

        <form className="pin-card" onSubmit={submit}>
          <label htmlFor="owner-pin">Owner PIN</label>
          <div className="pin-row">
            <input
              id="owner-pin"
              value={pin}
              onChange={(event) => {
                setError("");
                setPin(event.target.value.replace(/\D/g, "").slice(0, 4));
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              type="password"
              placeholder="••••"
              autoFocus
            />
            <button type="submit">Unlock</button>
          </div>
          <div className="pin-dots" aria-hidden="true">
            {[0, 1, 2, 3].map((index) => (
              <span key={index} className={pin.length > index ? "filled" : ""} />
            ))}
          </div>
          {error && <div className="pin-error">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("pe_owner_session") === "active");
  const [data, setData] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");
  const [filters, setFilters] = useState({ period: "fy", q: "" });
  const [queryDraft, setQueryDraft] = useState("");

  useEffect(() => {
    if (!authed) return;

    let mounted = true;
    setData(null);

    fetchDashboard(filters)
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
  }, [authed, filters]);

  function setPeriod(period) {
    setFilters((current) => ({ ...current, period }));
  }

  function applySearch(event) {
    event.preventDefault();
    setFilters((current) => ({ ...current, q: queryDraft.trim() }));
  }

  if (!authed) {
    return <SignIn onSuccess={() => setAuthed(true)} />;
  }

  if (!data) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading business data...</p>
      </div>
    );
  }

  if (data.available === false || !data.headline) {
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
            <Logo />
            <div>
              <div className="brand-name">{data.company.label}</div>
              <div className="brand-sub">{data.company.period}</div>
            </div>
          </div>
          <div className="built-by">
            <button
              className="signout-btn"
              type="button"
              onClick={() => {
                sessionStorage.removeItem("pe_owner_session");
                setAuthed(false);
              }}
            >
              Sign out
            </button>
            <span>Built by <span className="built-by-name">ARQ ONE AI Labs</span></span>
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
              <strong>Backend is offline.</strong> Start the Python API on port 8000 to load live workbook data and enable chat.
            </div>
          </div>
        )}

        {data.message && (
          <div className="banner banner-neutral">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
            <div>{data.message}</div>
          </div>
        )}

        <div className="hero-panel">
          <div className="hero-copy">
            <p className="hero-eyebrow">Live workbook snapshot</p>
            <h1>Pawan Engineering performance cockpit.</h1>
            <p>Sales, purchases, margins and risk alerts sourced from the files in your input folder.</p>

            <div className="filter-panel">
              <div className="period-tabs" aria-label="Select tenure">
                {PERIODS.map((period) => (
                  <button
                    key={period.value}
                    type="button"
                    className={filters.period === period.value ? "active" : ""}
                    onClick={() => setPeriod(period.value)}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
              <form className="filter-search" onSubmit={applySearch}>
                <input
                  value={queryDraft}
                  onChange={(event) => setQueryDraft(event.target.value)}
                  placeholder="Filter customer, vendor, product"
                />
                <button type="submit">Apply</button>
                {filters.q && (
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => {
                      setQueryDraft("");
                      setFilters((current) => ({ ...current, q: "" }));
                    }}
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>
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
          <div>Live workbook KPIs - overheads not modelled</div>
          <div className="footer-arq">ARQ ONE AI Labs</div>
        </footer>
      </main>
    </div>
  );
}
