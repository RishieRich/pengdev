"""
Load dashboard data from the root-level input folder.
The dashboard should only show KPIs when the required workbooks exist.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime
from pathlib import Path
from typing import Any

import openpyxl


PROJECT_ROOT = Path(__file__).resolve().parents[2]
INPUT_DIR = PROJECT_ROOT / "input"
FY_START = date(2025, 4, 1)
FY_END = date(2026, 3, 31)
MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]


def _empty_data(message: str, missing_files: list[str] | None = None) -> dict[str, Any]:
    return {
        "available": False,
        "message": message,
        "missingFiles": missing_files or [],
        "inputDir": str(INPUT_DIR),
        "company": {
            "label": "Pawan Engineering",
            "workbookName": "",
            "address": "",
            "udyam": "",
            "period": "FY 2025-26 - Apr 2025 to Mar 2026",
        },
        "headline": None,
        "monthly": [],
        "topCustomers": [],
        "topVendors": [],
        "topProducts": [],
        "topMaterials": [],
        "alerts": [],
        "dataNotes": [],
    }


def _find_required_files() -> tuple[Path | None, Path | None, list[str]]:
    if not INPUT_DIR.exists():
        return None, None, ["input folder"]

    xlsx_files = [p for p in INPUT_DIR.glob("*.xlsx") if not p.name.startswith("~$")]
    sale_file = next((p for p in xlsx_files if "sale" in p.name.lower()), None)
    purchase_file = next((p for p in xlsx_files if "purchase" in p.name.lower()), None)

    missing = []
    if sale_file is None:
        missing.append("Sale 25-26.xlsx")
    if purchase_file is None:
        missing.append("Purchase 25-26.xlsx")
    return sale_file, purchase_file, missing


def _is_fy_date(value: Any) -> bool:
    if isinstance(value, datetime):
        value = value.date()
    return isinstance(value, date) and FY_START <= value <= FY_END


def _clean_name(value: Any) -> str:
    return " ".join(str(value or "").replace("\n", " ").split())


def _pct(value: float, total: float) -> float:
    return round((value / total * 100), 1) if total else 0


def _top_rows(values: dict[str, float], counts: dict[str, int] | None, total: float, limit: int) -> list[dict[str, Any]]:
    rows = []
    for name, value in sorted(values.items(), key=lambda item: item[1], reverse=True)[:limit]:
        row = {"name": name, "value": round(value, 2), "share": _pct(value, total)}
        if counts is not None:
            row["lines"] = counts.get(name, 0)
        rows.append(row)
    return rows


def _read_company_meta(workbook: openpyxl.Workbook) -> dict[str, str]:
    sheet = workbook.worksheets[0]
    rows = list(sheet.iter_rows(min_row=1, max_row=7, values_only=True))
    company = _clean_name(rows[0][0]) if rows else "Pawan Engineering"
    address_1 = _clean_name(rows[1][0]) if len(rows) > 1 else ""
    address_2 = _clean_name(rows[2][0]) if len(rows) > 2 else ""
    udyam = _clean_name(rows[3][0]).replace("UDYAM :", "").strip() if len(rows) > 3 else ""
    return {
        "label": "Pawan Engineering",
        "workbookName": company,
        "address": _clean_name(f"{address_1} {address_2}"),
        "udyam": udyam,
        "period": "FY 2025-26 - Apr 2025 to Mar 2026",
    }


def _read_register(workbook: openpyxl.Workbook, sheet_name: str, value_col: int) -> tuple[list[dict[str, Any]], dict[str, float], dict[str, int]]:
    sheet = workbook[sheet_name]
    records = []
    by_party: dict[str, float] = defaultdict(float)
    counts: dict[str, int] = defaultdict(int)

    for row in sheet.iter_rows(min_row=9, values_only=True):
        row_date = row[0]
        value = row[value_col] if len(row) > value_col else None
        if not _is_fy_date(row_date) or not isinstance(value, (int, float)):
            continue

        party = _clean_name(row[1])
        records.append({"date": row_date.date(), "party": party, "value": float(value)})
        by_party[party] += float(value)
        counts[party] += 1

    return records, by_party, counts


def _read_sales_products(sale_file: Path, sales_total: float) -> tuple[dict[str, float], dict[str, float], int]:
    workbook = openpyxl.load_workbook(sale_file, read_only=True, data_only=True)
    try:
        sheet = workbook["Sheet1"] if "Sheet1" in workbook.sheetnames else workbook.worksheets[-1]
        by_customer: dict[str, float] = defaultdict(float)
        by_product: dict[str, float] = defaultdict(float)

        for row in sheet.iter_rows(min_row=2, values_only=True):
            customer = _clean_name(row[1] if len(row) > 1 else "")
            product = _clean_name(row[2] if len(row) > 2 else "")
            amount = row[5] if len(row) > 5 else None
            if not customer or not product or not isinstance(amount, (int, float)):
                continue
            by_customer[customer] += float(amount)
            by_product[product] += float(amount)

        # Sheet1 carries line-level detail and may include the workbook total row.
        # The dated Sales Register remains the source of truth for headline totals.
        if not by_customer and sales_total:
            return {}, {}, 0
        return by_customer, by_product, len(by_product)
    finally:
        workbook.close()


def _read_purchase_materials(workbook: openpyxl.Workbook, purchases_total: float) -> dict[str, float]:
    sheet = workbook["Purchase Register"]
    by_material: dict[str, float] = defaultdict(float)

    for row in sheet.iter_rows(min_row=9, values_only=True):
        if row[0] is not None:
            continue
        material = _clean_name(row[1] if len(row) > 1 else "")
        value = row[4] if len(row) > 4 else None
        if not material or material.lower() == "grand total" or not isinstance(value, (int, float)):
            continue
        by_material[material] += float(value)

    return by_material


def _build_alerts(headline: dict[str, Any], top_customers: list[dict[str, Any]], top_vendors: list[dict[str, Any]], monthly: list[dict[str, Any]]) -> list[dict[str, str]]:
    alerts = []
    if top_customers and top_customers[0]["share"] >= 30:
        alerts.append({
            "sev": "high",
            "title": "Customer concentration zyada hai",
            "detail": f"{top_customers[0]['name']} akele {top_customers[0]['share']}% sales dete hain. Top 5 customers milke {headline['top5CustShare']}%.",
        })
    if headline["top3VendShare"] >= 60:
        alerts.append({
            "sev": "high",
            "title": "Vendor dependency check karein",
            "detail": f"Top 3 vendors milke {headline['top3VendShare']}% purchases karte hain. Backup suppliers validate karein.",
        })
    march = next((m for m in monthly if m["m"] == "Mar"), None)
    if march and march["gp"] < 0:
        alerts.append({
            "sev": "high",
            "title": "March 2026 mein gross loss",
            "detail": "March gross profit negative hai. Procurement timing ya billing cutoff accounts se confirm karein.",
        })
    return alerts


def load_business_data() -> dict[str, Any]:
    sale_file, purchase_file, missing = _find_required_files()
    if missing:
        return _empty_data(
            "Please check the input folder. Required data files are missing, so there are no KPIs to show.",
            missing,
        )

    try:
        purchase_workbook = openpyxl.load_workbook(purchase_file, read_only=True, data_only=True)
        try:
            company = _read_company_meta(purchase_workbook)
            sales_records, sales_by_customer_register, sales_counts = _read_register(purchase_workbook, "Sales Register", 7)
            purchase_records, purchase_by_vendor, purchase_counts = _read_register(purchase_workbook, "Purchase Register", 4)
            sales_by_customer_detail, sales_by_product, product_count = _read_sales_products(sale_file, sum(r["value"] for r in sales_records))
            purchase_by_material = _read_purchase_materials(purchase_workbook, sum(r["value"] for r in purchase_records))
        finally:
            purchase_workbook.close()
    except Exception as exc:
        return _empty_data(f"Input files could not be read: {exc}", [])

    sales_total = round(sum(r["value"] for r in sales_records), 2)
    purchases_total = round(sum(r["value"] for r in purchase_records), 2)
    if sales_total <= 0 or purchases_total <= 0:
        return _empty_data("Input files are present, but usable FY data was not found. No KPIs to show.", [])

    sales_by_customer = sales_by_customer_detail or sales_by_customer_register
    customers = len(sales_by_customer_register)
    vendors = len(purchase_by_vendor)

    monthly_sales: dict[str, float] = defaultdict(float)
    monthly_purchases: dict[str, float] = defaultdict(float)
    for row in sales_records:
        monthly_sales[row["date"].strftime("%b")] += row["value"]
    for row in purchase_records:
        monthly_purchases[row["date"].strftime("%b")] += row["value"]

    monthly = []
    for month in MONTHS:
        sales = round(monthly_sales[month], 2)
        purchases = round(monthly_purchases[month], 2)
        monthly.append({"m": month, "sales": sales, "purchases": purchases, "gp": round(sales - purchases, 2)})

    gross_profit = round(sales_total - purchases_total, 2)
    top_customers = _top_rows(sales_by_customer, sales_counts, sales_total, 6)
    top_vendors = _top_rows(purchase_by_vendor, purchase_counts, purchases_total, 5)
    top_products = _top_rows(sales_by_product, None, sales_total, 5)
    top_materials = _top_rows(purchase_by_material, None, purchases_total, 5)

    headline = {
        "sales": sales_total,
        "purchases": purchases_total,
        "grossProfit": gross_profit,
        "grossMarginPct": round((gross_profit / sales_total * 100), 2) if sales_total else 0,
        "salesCount": len(sales_records),
        "purchaseCount": len(purchase_records),
        "customers": customers,
        "vendors": vendors,
        "products": product_count,
        "top5CustShare": round(sum(c["share"] for c in top_customers[:5]), 1),
        "top3VendShare": round(sum(v["share"] for v in top_vendors[:3]), 1),
    }

    return {
        "available": True,
        "message": "",
        "missingFiles": [],
        "inputDir": str(INPUT_DIR),
        "sourceFiles": [sale_file.name, purchase_file.name],
        "company": company,
        "headline": headline,
        "monthly": monthly,
        "topCustomers": top_customers,
        "topVendors": top_vendors,
        "topProducts": top_products,
        "topMaterials": top_materials,
        "alerts": _build_alerts(headline, top_customers, top_vendors, monthly),
        "dataNotes": [
            "KPIs are loaded from the root input folder at request time.",
            "Headline sales and purchases use dated FY rows from the registers and exclude grand totals.",
            "Purchase rows after 31-Mar-2026 are excluded from FY 2025-26 KPIs.",
            "Gross profit is trading-level only and excludes overheads, tax, finance cost, and payroll.",
        ],
    }


PE_DATA = load_business_data()
