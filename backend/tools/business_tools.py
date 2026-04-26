"""
business_tools.py
LangChain tools the copilot agent can call to fetch grounded business data.
Each tool returns a clean text summary the LLM can reason over.
"""

import json
from langchain_core.tools import tool

try:
    from ..data.business_data import PE_DATA
except ImportError:
    from data.business_data import PE_DATA


def _fmt_inr(n: float) -> str:
    """Format number as Indian currency string."""
    if n is None:
        return "—"
    abs_n = abs(n)
    sign = "-" if n < 0 else ""
    if abs_n >= 1e7:
        return f"{sign}₹{abs_n / 1e7:.2f} Cr"
    if abs_n >= 1e5:
        return f"{sign}₹{abs_n / 1e5:.2f} L"
    if abs_n >= 1e3:
        return f"{sign}₹{abs_n / 1e3:.1f} K"
    return f"{sign}₹{round(abs_n)}"


@tool
def get_business_summary() -> str:
    """
    Returns the overall FY 2025-26 headline KPIs for Pawan Engineering:
    total sales, purchases, gross profit, margin %, customer and vendor counts.
    Call this first for any general financial overview question.
    """
    h = PE_DATA["headline"]
    return (
        f"FY 2025-26 Business Summary — Pawan Engineering\n"
        f"Total Sales: {_fmt_inr(h['sales'])} ({h['salesCount']} invoices)\n"
        f"Total Purchases: {_fmt_inr(h['purchases'])} ({h['purchaseCount']} POs)\n"
        f"Gross Profit: {_fmt_inr(h['grossProfit'])} ({h['grossMarginPct']}% margin)\n"
        f"Note: Gross profit is trading-level only — excludes salaries, rent, electricity, transport, finance, tax.\n"
        f"Customers: {h['customers']} | Vendors: {h['vendors']} | Products: {h['products']}\n"
        f"Top 5 customers = {h['top5CustShare']}% revenue | Top 3 vendors = {h['top3VendShare']}% purchases"
    )


@tool
def get_monthly_data() -> str:
    """
    Returns month-by-month sales, purchases, and gross profit for FY 2025-26 (Apr to Mar).
    Call this for questions about specific months, trends, best/worst month, seasonal patterns.
    """
    rows = []
    for d in PE_DATA["monthly"]:
        gp_flag = " ⚠️ LOSS" if d["gp"] < 0 else ""
        rows.append(
            f"{d['m']}: Sales {_fmt_inr(d['sales'])} | Purchases {_fmt_inr(d['purchases'])} | GP {_fmt_inr(d['gp'])}{gp_flag}"
        )
    return "Monthly P&L (FY 2025-26):\n" + "\n".join(rows)


@tool
def get_top_customers() -> str:
    """
    Returns the top customers by sales value for FY 2025-26, with their share of total revenue.
    Call this for questions about customers, accounts, revenue concentration, or specific customer names.
    """
    lines = ["Top Customers (FY 2025-26):"]
    for i, c in enumerate(PE_DATA["topCustomers"], 1):
        lines.append(
            f"{i}. {c['name']}: {_fmt_inr(c['value'])} ({c['share']}% of total sales, {c['lines']} invoices)"
        )
    return "\n".join(lines)


@tool
def get_top_vendors() -> str:
    """
    Returns the top vendors/suppliers by purchase value for FY 2025-26.
    Call this for questions about vendors, suppliers, purchase concentration, or specific vendor names.
    """
    lines = ["Top Vendors (FY 2025-26):"]
    for i, v in enumerate(PE_DATA["topVendors"], 1):
        lines.append(
            f"{i}. {v['name']}: {_fmt_inr(v['value'])} ({v['share']}% of total purchases, {v['lines']} POs)"
        )
    return "\n".join(lines)


@tool
def get_top_products() -> str:
    """
    Returns the top products by sales revenue for FY 2025-26.
    Call this for questions about products, SKUs, what is sold, or product concentration.
    """
    lines = ["Top Products by Sales (FY 2025-26):"]
    for i, p in enumerate(PE_DATA["topProducts"], 1):
        lines.append(f"{i}. {p['name']}: {_fmt_inr(p['value'])} ({p['share']}% of total sales)")
    return "\n".join(lines)


@tool
def get_top_materials() -> str:
    """
    Returns the top input raw materials by purchase value for FY 2025-26.
    Call this for questions about raw materials, inputs, SS coils, steel, or material dependency.
    """
    lines = ["Top Input Materials (FY 2025-26):"]
    for i, m in enumerate(PE_DATA["topMaterials"], 1):
        lines.append(f"{i}. {m['name']}: {_fmt_inr(m['value'])} ({m['share']}% of total purchases)")
    return "\n".join(lines)


@tool
def get_alerts() -> str:
    """
    Returns auto-flagged business alerts and risks from the FY 2025-26 books.
    Call this for questions about risks, alerts, what to check, warnings, or action items.
    """
    sev_map = {"high": "🔴 HIGH", "medium": "🟠 MEDIUM", "low": "🟡 LOW"}
    lines = ["Business Alerts — Auto-flagged from FY 2025-26 books:"]
    for a in PE_DATA["alerts"]:
        lines.append(f"\n{sev_map.get(a['sev'], a['sev'])} — {a['title']}")
        lines.append(f"   {a['detail']}")
    return "\n".join(lines)


@tool
def get_data_notes() -> str:
    """
    Returns data quality notes and caveats about the FY 2025-26 books.
    Call this for questions about data accuracy, discrepancies, or limitations.
    """
    lines = ["Data Quality Notes:"]
    for n in PE_DATA["dataNotes"]:
        lines.append(f"• {n}")
    return "\n".join(lines)


# All tools exported for agent registration
ALL_TOOLS = [
    get_business_summary,
    get_monthly_data,
    get_top_customers,
    get_top_vendors,
    get_top_products,
    get_top_materials,
    get_alerts,
    get_data_notes,
]
