export const STATIC_DASHBOARD_DATA = {
  company: {
    label: "Pawan Engineering",
    workbookName: "Infinity Die Tools",
    address: "G-9 & 10, Chirag Industrial Complex, Daman 396210",
    udyam: "UDYAM-DD-01-0002992 (Micro)",
    period: "FY 2025-26 - Apr 2025 to Mar 2026",
  },
  headline: {
    sales: 16828599.87,
    purchases: 9276268.92,
    grossProfit: 7552330.95,
    grossMarginPct: 44.88,
    salesCount: 337,
    purchaseCount: 56,
    customers: 28,
    vendors: 13,
    products: 23,
    top5CustShare: 70.36,
    top3VendShare: 72.1,
  },
  monthly: [
    { m: "Apr", sales: 633743, purchases: 629849, gp: 3894 },
    { m: "May", sales: 380171, purchases: 83878, gp: 296293 },
    { m: "Jun", sales: 337460, purchases: 134590, gp: 202870 },
    { m: "Jul", sales: 952710, purchases: 748177, gp: 204533 },
    { m: "Aug", sales: 1266062, purchases: 564986, gp: 701076 },
    { m: "Sep", sales: 1749119, purchases: 506477, gp: 1242642 },
    { m: "Oct", sales: 2126880, purchases: 1540374, gp: 586506 },
    { m: "Nov", sales: 2787039, purchases: 1620767, gp: 1166271 },
    { m: "Dec", sales: 3661259, purchases: 1397923, gp: 2263337 },
    { m: "Jan", sales: 887638, purchases: 536056, gp: 351583 },
    { m: "Feb", sales: 1667964, purchases: 1025615, gp: 642349 },
    { m: "Mar", sales: 378555, purchases: 487577, gp: -109022 },
  ],
  topCustomers: [
    { name: "Yash Seals Pvt. Ltd.", value: 6119100, share: 36.4, lines: 58 },
    { name: "Unisto Corporation Pvt Ltd", value: 1878250, share: 11.2, lines: 27 },
    { name: "Effectronic Technology Pvt Ltd", value: 1528844, share: 9.1, lines: 7 },
    { name: "Sepio Products Pvt Ltd", value: 1300000, share: 7.7, lines: 15 },
    { name: "Premier Electronic Ind.", value: 1025900, share: 6.1, lines: 19 },
    { name: "Ekta Container Seals Pvt. Ltd", value: 800800, share: 4.8, lines: 23 },
  ],
  topVendors: [
    { name: "Ratan Steel Corporation", value: 2797248, share: 30.2, lines: 17 },
    { name: "Golden Metal Private Limited", value: 2289128, share: 24.7, lines: 7 },
    { name: "Jindal Metals & Alloys Limited", value: 1600727, share: 17.3, lines: 3 },
    { name: "Omshree Alloys", value: 1168933, share: 12.6, lines: 6 },
    { name: "Neminath Impex", value: 558875, share: 6, lines: 4 },
  ],
  topProducts: [
    { name: "Seal - Spring - HIFI CROC", value: 5773300, share: 34.3 },
    { name: "Hi-Tech Seal Lock", value: 3482150, share: 20.7 },
    { name: "6 WATT DOWNLIGHT HEATSINK", value: 1606877, share: 9.5 },
    { name: "Strap Seal Logi Metal Insert", value: 1300000, share: 7.7 },
    { name: "MS Connector Regular", value: 1025900, share: 6.1 },
  ],
  topMaterials: [
    { name: "SS CR COILS", value: 4490514, share: 48.4 },
    { name: "SS 202 0.28 x 45 MM", value: 902632, share: 9.7 },
    { name: "SS Coils 0.30 X 45 mm", value: 867224, share: 9.3 },
    { name: "SS 304 0.50 x 52 mm", value: 558875, share: 6 },
  ],
  alerts: [
    {
      sev: "high",
      title: "Customer concentration zyada hai",
      detail:
        "Yash Seals akele 36.4% sales dete hain. Top 5 customers milke 70.4%. Ek bhi bada account chhoot gaya toh seedha asar padega.",
    },
    {
      sev: "high",
      title: "March 2026 mein gross loss",
      detail:
        "Sales Rs. 3.78L vs purchases Rs. 4.87L. Rs. 1.09L ka gross loss. Accounts se procurement ya billing timing confirm karwa lijiye.",
    },
    {
      sev: "high",
      title: "Vendor dependency check karein",
      detail:
        "Top 3 vendors milke 72.1% supply karte hain. SS coil ke liye backup supplier ki zarurat hai.",
    },
    {
      sev: "medium",
      title: "SS CR Coils par bahut depend",
      detail:
        "SS CR COILS akele 48.4% purchases. Stainless steel sheet ka rate badle toh margin pe seedha asar.",
    },
    {
      sev: "medium",
      title: "Dec ke baad sharp drop",
      detail:
        "Dec 2025 best month tha. Jan 2026 mein sharp drop aaya. Check karein seasonal hai ya capacity issue.",
    },
  ],
  dataNotes: [
    "Workbook header par naam 'Infinity Die Tools' likha hai, 'Pawan Engineering' nahi. Identity confirm karein.",
    "Purchase Register visible total aur parsed line items ke beech approx Rs. 1.55L ka gap hai.",
    "Destination spellings normalized nahi hain.",
    "Gross profit mein salaries, rent, electricity, transport, finance, tax shamil nahi.",
    "Sale workbook Sheet7 product pivot total dated register se exactly match nahi karta.",
  ],
};
