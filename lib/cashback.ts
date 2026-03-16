// ============================================================
//  Finnlo – Credit Card Cashback Matrix (India)
//  Based on: Flipkart Axis Bank, SBI Cashback, PhonePe SBI Black
//  Data as of March 2026
// ============================================================

export const CREDIT_CARDS = {
  flipkart_axis: "Flipkart Axis Bank",
  sbi_cashback: "SBI Cashback",
  phonepe_sbi_black: "PhonePe SBI Black",
} as const;

export type CreditCard = keyof typeof CREDIT_CARDS;

export const CREDIT_CARD_OPTIONS = Object.entries(CREDIT_CARDS).map(
  ([value, label]) => ({ value, label })
);

// ── Spend categories (for cashback mapping) ─────────────────
export const SPEND_CATEGORIES = {
  flipkart: "Flipkart",
  myntra: "Myntra",
  amazon: "Amazon",
  other_online: "Other Online",
  offline: "Offline / POS",
  swiggy: "Swiggy / Food Delivery",
  uber: "Uber / Cab Rides",
  travel_cleartrip: "Travel – Cleartrip",
  travel_phonepe: "Travel – via PhonePe app",
  travel_other: "Travel – Other Platform",
  fuel: "Fuel",
  movies: "Movies / Entertainment",
  movies_phonepe: "Movies – via PhonePe app",
  health: "Health & Fitness",
  utilities: "Utilities / Bills",
  utilities_phonepe: "Utilities – via PhonePe app",
  mobile_recharge: "Mobile Recharge",
  mobile_phonepe: "Mobile Recharge – via PhonePe app",
  insurance: "Insurance",
  insurance_phonepe: "Insurance – via PhonePe app",
  education_rent: "Education / Rent (excluded)",
  upi: "UPI / Scan & Pay",
} as const;

export type SpendCategory = keyof typeof SPEND_CATEGORIES;

// Categories visible per card (hide irrelevant PhonePe options for non-PhonePe cards)
export const CARD_SPEND_CATEGORIES: Record<CreditCard, SpendCategory[]> = {
  flipkart_axis: [
    "flipkart", "myntra", "amazon", "other_online", "offline",
    "swiggy", "uber", "travel_cleartrip", "travel_other",
    "fuel", "movies", "health", "utilities", "mobile_recharge",
    "insurance", "education_rent",
  ],
  sbi_cashback: [
    "flipkart", "myntra", "amazon", "other_online", "offline",
    "swiggy", "uber", "travel_other",
    "fuel", "movies", "health", "utilities", "mobile_recharge",
    "insurance", "education_rent",
  ],
  phonepe_sbi_black: [
    "flipkart", "myntra", "amazon", "other_online", "offline",
    "swiggy", "uber",
    "travel_phonepe", "travel_other",
    "fuel",
    "movies_phonepe", "movies",
    "health",
    "utilities_phonepe", "utilities",
    "mobile_phonepe", "mobile_recharge",
    "insurance_phonepe", "insurance",
    "education_rent", "upi",
  ],
};

// ── Cashback rates (%) ───────────────────────────────────────
const CASHBACK_RATES: Record<CreditCard, Partial<Record<SpendCategory, number>>> = {
  flipkart_axis: {
    flipkart: 5,
    myntra: 7.5,
    amazon: 1,
    other_online: 1,
    offline: 1,
    swiggy: 4,
    uber: 4,
    travel_cleartrip: 5,
    travel_other: 1,
    fuel: 0,
    movies: 4,
    health: 4,
    utilities: 0,
    mobile_recharge: 0,
    insurance: 0,
    education_rent: 0,
  },
  sbi_cashback: {
    flipkart: 5,
    myntra: 5,
    amazon: 5,
    other_online: 5,
    offline: 1,
    swiggy: 5,
    uber: 5,
    travel_other: 5,
    fuel: 0,
    movies: 5,
    health: 5,
    utilities: 0,
    mobile_recharge: 0,
    insurance: 0,
    education_rent: 0,
  },
  phonepe_sbi_black: {
    flipkart: 5,
    myntra: 5,
    amazon: 5,
    other_online: 5,
    offline: 1,
    swiggy: 5,
    uber: 5,
    travel_phonepe: 10,
    travel_other: 5,
    fuel: 0,
    movies_phonepe: 10,
    movies: 5,
    health: 5,
    utilities_phonepe: 10,
    utilities: 0,
    mobile_phonepe: 10,
    mobile_recharge: 0,
    insurance_phonepe: 10,
    insurance: 0,
    education_rent: 0,
    upi: 1,
  },
};

/**
 * Calculate cashback for a transaction.
 * Amount is in miliunits (negative = expense).
 * Returns cashback in miliunits (always positive).
 */
export function calculateCashback(
  card: CreditCard,
  spendCategory: SpendCategory,
  amountInMiliunits: number,
): number {
  // Only expenses earn cashback
  if (amountInMiliunits >= 0) return 0;

  const rate = (CASHBACK_RATES[card][spendCategory] ?? 0) / 100;
  if (rate === 0) return 0;

  const absAmount = Math.abs(amountInMiliunits);
  return Math.round(absAmount * rate);
}

/**
 * Get the cashback rate percentage for display.
 */
export function getCashbackRate(
  card: CreditCard,
  spendCategory: SpendCategory,
): number {
  return CASHBACK_RATES[card][spendCategory] ?? 0;
}

// ── Auto-detection ───────────────────────────────────────────

/**
 * Guess the spend category from a payee / merchant name.
 */
export function autoDetectSpendCategory(payee: string): SpendCategory {
  const p = payee.toLowerCase();

  if (p.includes("flipkart")) return "flipkart";
  if (p.includes("myntra")) return "myntra";
  if (p.includes("amazon")) return "amazon";

  if (p.includes("swiggy") || p.includes("zomato") || p.includes("dunzo") || p.includes("eatsure"))
    return "swiggy";
  if (p.includes("uber") || p.includes("ola ") || p.includes("rapido") || p.includes("blusmart"))
    return "uber";

  if (p.includes("cleartrip")) return "travel_cleartrip";
  if (
    p.includes("makemytrip") || p.includes("goibibo") || p.includes("irctc") ||
    p.includes("yatra") || p.includes("easemytrip") || p.includes("ixigo")
  )
    return "travel_other";

  if (
    p.includes("pvr") || p.includes("inox") || p.includes("cinepolis") ||
    p.includes("bookmyshow") || p.includes("district") || p.includes("paytm movies")
  )
    return "movies";

  if (
    p.includes("bpcl") || p.includes("hpcl") || p.includes("iocl") ||
    p.includes("petrol") || p.includes("fuel") || p.includes(" cng")
  )
    return "fuel";

  if (
    p.includes("jio") || p.includes("airtel") || p.includes(" vi ") ||
    p.includes("bsnl") || p.includes("recharge") || p.includes("mobile prepaid")
  )
    return "mobile_recharge";

  if (
    p.includes("cult") || p.includes("gym") || p.includes("fitness") ||
    p.includes("healthify") || p.includes("cure.fit")
  )
    return "health";

  if (
    p.includes("electricity") || p.includes("bescom") || p.includes("tata power") ||
    p.includes("adani electric") || p.includes("torrent") || p.includes("water board") ||
    p.includes("bwssb") || p.includes("mahadiscom") || p.includes("tneb")
  )
    return "utilities";

  if (
    p.includes("lic ") || p.includes("insurance") || p.includes("policybazaar") ||
    p.includes("hdfc life") || p.includes("icici pru") || p.includes("bajaj allianz")
  )
    return "insurance";

  if (
    p.includes("rent") || p.includes("school") || p.includes("college") ||
    p.includes("university") || p.includes("tuition") || p.includes("jewel")
  )
    return "education_rent";

  if (p.includes("upi") || p.includes("@") || p.includes("scan & pay") || p.includes("bhim"))
    return "upi";

  // Default: treat as general online purchase
  return "other_online";
}

/**
 * Try to detect which credit card a file belongs to from its filename.
 */
export function autoDetectCardFromFilename(filename: string): CreditCard | null {
  const f = filename.toLowerCase();
  if (f.includes("phonepe") || f.includes("phone_pe") || f.includes("black")) return "phonepe_sbi_black";
  if (f.includes("flipkart") || f.includes("axis")) return "flipkart_axis";
  if (f.includes("sbi") || f.includes("cashback")) return "sbi_cashback";
  return null;
}

/**
 * Format cashback amount from miliunits to readable rupees string.
 */
export function formatCashback(miliunits: number): string {
  const rupees = miliunits / 1000;
  return `₹${rupees.toFixed(2)}`;
}
