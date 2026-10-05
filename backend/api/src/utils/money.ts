/**
 * Precision Money & Financial Accounting Utility for Labcore ELIS OS
 * Compliant with Indian GST, NABL / ISO 15189, and IT Act 2000.
 *
 * Rules:
 * 1. Amounts are handled as exact integer paise (1 INR = 100 paise) internally to prevent floating point inaccuracies.
 * 2. Rounding uses Round Half Up to 2 decimal places.
 * 3. Dates are stored in UTC and bucketed by Indian Standard Time (IST, UTC+5:30).
 * 4. Financial Year is calculated according to the Indian April-March FY cycle (e.g., April 2026 - March 2027 is "2026-27").
 */

/**
 * Converts Rupees (number or string) to exact integer Paise.
 */
export function rupeesToPaise(rupees: number | string): number {
  const val = typeof rupees === "string" ? parseFloat(rupees) : rupees;
  if (isNaN(val)) return 0;
  return Math.round(val * 100);
}

/**
 * Converts integer Paise to Rupees with 2 decimal places precision.
 */
export function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

/**
 * Round Half Up to 2 decimal places (standard Indian commercial rounding).
 */
export function roundHalfUp(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
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
 * Calculates Indian Financial Year string for any given date.
 * E.g., 15 May 2026 -> "2026-27", 10 Feb 2027 -> "2026-27"
 */
export function getIndianFinancialYear(date: Date = new Date()): string {
  const istDate = getISTDate(date);
  const year = istDate.getFullYear();
  const month = istDate.getMonth() + 1; // 1-12

  if (month >= 4) {
    const nextYearShort = String(year + 1).slice(-2);
    return `${year}-${nextYearShort}`;
  } else {
    const prevYear = year - 1;
    const currentYearShort = String(year).slice(-2);
    return `${prevYear}-${currentYearShort}`;
  }
}

/**
 * Returns a Date object shifted to Indian Standard Time (UTC+5:30).
 */
export function getISTDate(date: Date = new Date()): Date {
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
  // IST is UTC + 5.5 hours = +330 minutes
  return new Date(utcTime + 330 * 60000);
}

/**
 * Returns start and end UTC Date objects corresponding to 00:00:00.000 to 23:59:59.999 in IST for a target date.
 */
export function getISTDayBounds(targetDate: Date = new Date()): { startUTC: Date; endUTC: Date } {
  // Compute start of day in IST
  const ist = getISTDate(targetDate);
  const year = ist.getFullYear();
  const month = ist.getMonth();
  const day = ist.getDate();

  // 00:00:00.000 IST in UTC is previous day 18:30:00.000 UTC
  const startISTInUTC = new Date(Date.UTC(year, month, day, 0, 0, 0, 0) - 330 * 60000);
  const endISTInUTC = new Date(Date.UTC(year, month, day, 23, 59, 59, 999) - 330 * 60000);

  return {
    startUTC: startISTInUTC,
    endUTC: endISTInUTC,
  };
}

/**
 * Converts a number into Indian English words (for official GST/A4 Receipts).
 * E.g., 1250.50 -> "Rupees One Thousand Two Hundred Fifty and Fifty Paise Only"
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
