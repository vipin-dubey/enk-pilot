/**
 * Standard Norwegian Accounting Codes & MVA Codes
 * Based on NS 4102 (Chart of Accounts) and SAF-T MVA Codes
 */

export interface AccountingEntry {
  account: string;
  mvaCode: string;
  mvaRate: number;
}

export const ACCOUNTING_MAPPINGS: Record<string, Record<'income' | 'expense', AccountingEntry>> = {
  Food: {
    income: { account: '3100', mvaCode: '32', mvaRate: 0.15 }, // Salg mat/drikke
    expense: { account: '5900', mvaCode: '1', mvaRate: 0.25 }  // Representasjon/Sosial (Often 25% or non-deductible)
  },
  Travel: {
    income: { account: '3000', mvaCode: '3', mvaRate: 0.12 }, // Persontransport
    expense: { account: '7100', mvaCode: '13', mvaRate: 0.12 } // Reiseutgifter
  },
  Office: {
    income: { account: '3000', mvaCode: '3', mvaRate: 0.25 },
    expense: { account: '6800', mvaCode: '1', mvaRate: 0.25 }
  },
  Equipment: {
    income: { account: '3000', mvaCode: '3', mvaRate: 0.25 },
    expense: { account: '6500', mvaCode: '1', mvaRate: 0.25 }
  },
  IT: {
    income: { account: '3000', mvaCode: '3', mvaRate: 0.25 },
    expense: { account: '6540', mvaCode: '1', mvaRate: 0.25 }
  },
  Software: {
    income: { account: '3000', mvaCode: '3', mvaRate: 0.25 },
    expense: { account: '6540', mvaCode: '1', mvaRate: 0.25 }
  },
  Marketing: {
    income: { account: '3000', mvaCode: '3', mvaRate: 0.25 },
    expense: { account: '7320', mvaCode: '1', mvaRate: 0.25 }
  },
  Other: {
    income: { account: '3000', mvaCode: '3', mvaRate: 0.25 },
    expense: { account: '7790', mvaCode: '1', mvaRate: 0.25 }
  },
  Revenue: {
    income: { account: '3000', mvaCode: '3', mvaRate: 0.25 },
    expense: { account: '7790', mvaCode: '1', mvaRate: 0.25 }
  }
}

/**
 * Escapes a string for CSV
 */
export function escapeCSV(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = val.toString();
  if (str.includes(';') || str.includes('\"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Calculate the Norwegian MVA Period (Termin)
 * 1: Jan-Feb, 2: Mar-Apr, etc.
 */
export function getMvaPeriod(date: Date): number {
  const month = date.getMonth(); // 0-indexed
  return Math.floor(month / 2) + 1;
}
