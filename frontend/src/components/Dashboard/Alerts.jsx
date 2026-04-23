import React from "react";

const SEV_LABEL = { high: "Urgent", medium: "Watch", low: "FYI" };

export default function Alerts({ alerts, dataNotes }) {
  return (
    <>
      <div className="card">
        <div className="section-title">
          <h2>Alerts — yeh cheezein dekhna chahiye</h2>
          <p>Aapki books se auto-flagged</p>
        </div>
        {alerts.map((a, i) => (
          <div key={i} className="alert">
            <div className={`dot ${a.sev}`} />
            <div className="alert-body">
              <div className="alert-title-row">
                <div className="alert-title">{a.title}</div>
                <span className={`chip ${a.sev}`}>{SEV_LABEL[a.sev]}</span>
              </div>
              <div className="alert-detail">{a.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title">
          <h2>Data Notes</h2>
          <p>Honest read of your books — flagged before any decision</p>
        </div>
        <ul className="notes">
          {dataNotes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
