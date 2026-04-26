import React from "react";
import { fmtINR } from "../../utils/format";

export default function KPICards({ headline }) {
  const cards = [
    {
      label: "Total Sales (FY)",
      value: fmtINR(headline.sales),
      sub: `${headline.salesCount} invoices`,
      tone: "sales",
    },
    {
      label: "Total Purchases (FY)",
      value: fmtINR(headline.purchases),
      sub: `${headline.purchaseCount} POs`,
      tone: "purchase",
    },
    {
      label: "Gross Profit (trading)",
      value: fmtINR(headline.grossProfit),
      sub: `${headline.grossMarginPct}% margin · before overheads`,
      accent: true,
      tone: "profit",
    },
    {
      label: "Customers · Vendors",
      value: `${headline.customers} · ${headline.vendors}`,
      sub: `${headline.products} active products`,
      tone: "network",
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((c) => (
        <div key={c.label} className={`kpi kpi-${c.tone}${c.accent ? " kpi-accent" : ""}`}>
          <div className="kpi-topline">
            <div className="kpi-label">{c.label}</div>
            <div className="kpi-spark" />
          </div>
          <div className="kpi-value">{c.value}</div>
          <div className={`kpi-sub${c.accent ? " accent" : ""}`}>{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
