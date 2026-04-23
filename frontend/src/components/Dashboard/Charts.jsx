import React from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { fmtINR } from "../../utils/format";

const GREEN = "#25D366";
const GREEN_DARK = "#075E54";
const GREEN_DEEP = "#128C7E";
const RED = "#E84A4A";

function MonthlyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const s = payload.find((p) => p.dataKey === "salesL");
  const p = payload.find((p) => p.dataKey === "purchasesL");
  const gp = payload.find((p) => p.dataKey === "gpL");
  return (
    <div className="chart-tooltip">
      <div className="tt-month">{label}</div>
      {s && <div className="tt-row"><span>Sales</span><span>{fmtINR(s.value * 1e5)}</span></div>}
      {p && <div className="tt-row"><span>Purchases</span><span>{fmtINR(p.value * 1e5)}</span></div>}
      {gp && (
        <div className="tt-row">
          <span>Gross Profit</span>
          <span style={{ color: gp.value < 0 ? RED : GREEN_DEEP }}>{fmtINR(gp.value * 1e5)}</span>
        </div>
      )}
    </div>
  );
}

function GpTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const gp = payload[0];
  return (
    <div className="chart-tooltip">
      <div className="tt-month">{label}</div>
      <div className="tt-row">
        <span>Gross Profit</span>
        <span style={{ color: gp.value < 0 ? RED : GREEN_DEEP }}>{fmtINR(gp.value * 1e5)}</span>
      </div>
    </div>
  );
}

function yAxisFormatter(v) {
  return `₹${v}L`;
}

export function MonthlyBarChart({ monthly }) {
  const data = monthly.map((d) => ({
    m: d.m,
    salesL: +(d.sales / 1e5).toFixed(2),
    purchasesL: +(d.purchases / 1e5).toFixed(2),
    gpL: +(d.gp / 1e5).toFixed(2),
  }));

  return (
    <div className="card">
      <div className="section-title">
        <h2>Monthly Sales vs Purchases <span className="muted-suffix">(₹ Lakhs)</span></h2>
        <p>Sep–Dec 2025 strong run, Mar 2026 review zaroori</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E9EDEF" />
          <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#667781" }} />
          <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 11, fill: "#667781" }} width={48} />
          <Tooltip content={<MonthlyTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="salesL" name="Sales" fill={GREEN} radius={[2, 2, 0, 0]} />
          <Bar dataKey="purchasesL" name="Purchases" fill={GREEN_DARK} radius={[2, 2, 0, 0]} opacity={0.85} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GrossProfitChart({ monthly }) {
  const data = monthly.map((d) => ({
    m: d.m,
    gpL: +(d.gp / 1e5).toFixed(2),
  }));

  return (
    <div className="card">
      <div className="section-title">
        <h2>Monthly Gross Profit <span className="muted-suffix">(₹ Lakhs)</span></h2>
        <p>Pure FY mein sirf March negative — likely timing issue</p>
      </div>
      <ResponsiveContainer width="100%" height={175}>
        <AreaChart data={data} margin={{ top: 14, right: 12, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="gpGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={GREEN} stopOpacity={0.25} />
              <stop offset="95%" stopColor={GREEN} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E9EDEF" />
          <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#667781" }} />
          <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 11, fill: "#667781" }} width={48} />
          <Tooltip content={<GpTooltip />} />
          <ReferenceLine y={0} stroke="#cdd5d8" strokeWidth={1.2} />
          <Area
            type="monotone"
            dataKey="gpL"
            name="Gross Profit"
            stroke={GREEN_DEEP}
            strokeWidth={2.5}
            fill="url(#gpGrad)"
            dot={(props) => {
              const { cx, cy, payload } = props;
              return (
                <circle
                  key={`dot-${payload.m}`}
                  cx={cx}
                  cy={cy}
                  r={3.5}
                  fill={payload.gpL < 0 ? RED : GREEN_DEEP}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
