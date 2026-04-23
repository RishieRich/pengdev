import React from "react";
import KPICards from "./KPICards";
import { MonthlyBarChart, GrossProfitChart } from "./Charts";
import TopLists from "./TopLists";
import Alerts from "./Alerts";

export default function Dashboard({ data }) {
  return (
    <div className="left-col">
      <KPICards headline={data.headline} />
      <MonthlyBarChart monthly={data.monthly} />
      <GrossProfitChart monthly={data.monthly} />
      <TopLists
        topCustomers={data.topCustomers}
        topVendors={data.topVendors}
        topProducts={data.topProducts}
        topMaterials={data.topMaterials}
      />
      <Alerts alerts={data.alerts} dataNotes={data.dataNotes} />
    </div>
  );
}
