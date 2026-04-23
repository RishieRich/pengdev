import React from "react";
import { fmtINR } from "../../utils/format";

const GREEN = "#25D366";
const GREEN_DEEP = "#128C7E";
const GREEN_DARK = "#075E54";

function RowBar({ rank, name, value, share, color }) {
  const [animated, setAnimated] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 60 * rank);
    return () => clearTimeout(t);
  }, [rank]);

  return (
    <div className="rowbar">
      <div className="rowbar-top">
        <div className="rb-left">
          <span className="rb-rank">{rank}</span>
          <span className="rb-label" title={name}>{name}</span>
        </div>
        <div className="rb-right">
          <span className="rb-value">{fmtINR(value)}</span>
          <span className="rb-share">{share}%</span>
        </div>
      </div>
      <div className="rb-track">
        <div
          className="rb-fill"
          style={{
            width: animated ? `${share}%` : "0%",
            background: color,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

function ListCard({ title, subtitle, items, color }) {
  return (
    <div className="card">
      <div className="section-title">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {items.map((item, i) => (
        <RowBar
          key={item.name}
          rank={i + 1}
          name={item.name}
          value={item.value}
          share={item.share}
          color={color}
        />
      ))}
    </div>
  );
}

export default function TopLists({ topCustomers, topVendors, topProducts, topMaterials }) {
  return (
    <>
      <div className="two-col">
        <ListCard
          title="Top Customers"
          subtitle={`Top 5 = ${topCustomers.slice(0, 5).reduce((a, c) => a + c.share, 0).toFixed(1)}% sales`}
          items={topCustomers.slice(0, 5)}
          color={GREEN}
        />
        <ListCard
          title="Top Vendors"
          subtitle="Top 3 = 72.1% purchases"
          items={topVendors.slice(0, 5)}
          color={GREEN_DEEP}
        />
      </div>
      <div className="two-col">
        <ListCard
          title="Top Products by Sales"
          subtitle="2 SKUs = 55% revenue"
          items={topProducts.slice(0, 5)}
          color={GREEN}
        />
        <ListCard
          title="Top Input Materials"
          subtitle="SS CR Coils alone = 48.4% purchases"
          items={topMaterials}
          color={GREEN_DARK}
        />
      </div>
    </>
  );
}
