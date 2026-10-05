/**
 * Shared Money & Financial Utility for Labcore ELIS OS Frontend
 * Enforces Indian digit grouping, rounding half up to 2 decimal places, and money formatting.
 */

export function roundHalfUp(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function rupeesToPaise(rupees: number | string): number {
  const val = typeof rupees === "string" ? parseFloat(rupees) : rupees;
  if (isNaN(val)) return 0;
  return Math.round(val * 100);
}

export function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

/**
 * Formats amount in Rupees with Indian digit grouping (e.g. ₹1,24,200.00).
 */
export function formatIndianRupees(amountInRupees: number): string {
  const rounded = roundHalfUp(amountInRupees);
  const isNegative = rounded < 0;
  const absVal = Math.abs(rounded);

  const parts = absVal.toFixed(2).split(".");
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian digit grouping: last 3 digits, then groups of 2
  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherDigits = integerPart.substring(0, integerPart.length - 3);
    const formattedOther = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    integerPart = `${formattedOther},${lastThree}`;
  }

  const formattedStr = `₹${integerPart}.${decimalPart}`;
  return isNegative ? `-${formattedStr}` : formattedStr;
}

/**
 * Mask Phone Number according to DPDP Act 2023 guidelines (e.g. +91 98xxx xx210).
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return "—";
  const cleaned = phone.trim();
  if (cleaned.length < 10) return "xxxxxx";
  
  // Format +91 98980 12345 -> +91 98xxx xx345
  if (cleaned.startsWith("+91")) {
    const digits = cleaned.replace(/\D/g, "");
    if (digits.length >= 12) {
      const last3 = digits.slice(-3);
      const first2 = digits.slice(2, 4);
      return `+91 ${first2}xxx xx${last3}`;
    }
  }

  const digits = cleaned.replace(/\D/g, "");
  if (digits.length >= 10) {
    const first2 = digits.slice(0, 2);
    const last3 = digits.slice(-3);
    return `+91 ${first2}xxx xx${last3}`;
  }

  return "xxxxxx";
}

/**
 * Converts a number into Indian English words (for official GST/A4 Receipts).
 */
export function numberToIndianWords(amount: number): string {
  const paise = Math.round((amount % 1) * 100);
  const rupees = Math.floor(amount);

  if (rupees === 0 && paise === 0) return "Rupees Zero Only";

  const singleDigits = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertChunk(n: number): string {
    let str = "";
    if (n >= 100) {
      str += `${singleDigits[Math.floor(n / 100)]} Hundred `;
      n %= 100;
    }
    if (n >= 10 && n <= 19) {
      str += `${teens[n - 10]} `;
    } else if (n >= 20) {
      str += `${tens[Math.floor(n / 10)]} `;
      if (n % 10 > 0) str += `${singleDigits[n % 10]} `;
    } else if (n > 0) {
      str += `${singleDigits[n]} `;
    }
    return str.trim();
  }

  let words = "";
  let tempRupees = rupees;

  const crore = Math.floor(tempRupees / 10000000);
  tempRupees %= 10000000;
  const lakh = Math.floor(tempRupees / 100000);
  tempRupees %= 100000;
  const thousand = Math.floor(tempRupees / 1000);
  tempRupees %= 1000;

  if (crore > 0) words += `${convertChunk(crore)} Crore `;
  if (lakh > 0) words += `${convertChunk(lakh)} Lakh `;
  if (thousand > 0) words += `${convertChunk(thousand)} Thousand `;
  if (tempRupees > 0) words += `${convertChunk(tempRupees)} `;

  let result = `Rupees ${words.trim()}`;
  if (paise > 0) {
    result += ` and ${convertChunk(paise)} Paise`;
  }
  return `${result} Only`;
}
