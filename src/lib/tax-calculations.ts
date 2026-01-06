/**
 * 2026 Norwegian Tax Constants & Brackets
 */
export const TAX_CONSTANTS_2026 = {
  ORDINARY_INCOME_TAX: 0.22,
  NATIONAL_INSURANCE_ENK: 0.108,
  STANDARD_MVA: 0.25,
  PERSONAL_ALLOWANCE: 114210,
  MVA_THRESHOLD: 50000,
};

export interface TaxBracket {
  limit: number;
  rate: number;
}

export const TRINNSKATT_BRACKETS_2026: TaxBracket[] = [
  { limit: 226100, rate: 0.0 },
  { limit: 318300, rate: 0.017 },
  { limit: 725050, rate: 0.040 },
  { limit: 980100, rate: 0.137 },
  { limit: 1467200, rate: 0.168 },
  { limit: Infinity, rate: 0.178 },
];

export interface TaxCalculationResult {
  grossAmount: number;
  netRevenue: number;
  mvaPart: number;
  taxBuffer: number;
  safeToSpend: number;
  marginalRate: number;
  crossesMvaThreshold: boolean;
}

/**
 * Calculates the tax buffer for a given transaction based on YTD profit and 2026 rules.
 */
export function calculateNorwegianTax(
  amount: number,
  ytdGrossIncome: number,
  ytdExpenses: number,
  externalSalary: number,
  isMvaRegistered: boolean,
  manualTaxRate?: number
): TaxCalculationResult {
  // Step 1: MVA Separation
  let mvaPart = 0;
  let netRevenue = amount;

  if (isMvaRegistered) {
    mvaPart = amount - amount / (1 + TAX_CONSTANTS_2026.STANDARD_MVA);
    netRevenue = amount / (1 + TAX_CONSTANTS_2026.STANDARD_MVA);
  }

  // Check MVA threshold scenario
  const crossesMvaThreshold = !isMvaRegistered && (ytdGrossIncome + netRevenue > TAX_CONSTANTS_2026.MVA_THRESHOLD);

  // Step 2: Calculate Current Profit Context
  const currentProfitYTD = (ytdGrossIncome + externalSalary) - ytdExpenses;

  // Step 3: Tax Calculation
  let totalTaxBuffer = 0;
  let marginalRate = 0;
  const trygdeavgiftRate = TAX_CONSTANTS_2026.NATIONAL_INSURANCE_ENK;
  const ordinaryRate = TAX_CONSTANTS_2026.ORDINARY_INCOME_TAX;

  if (manualTaxRate !== undefined && manualTaxRate > 0) {
    // Manual Mode: Flat rate as requested by user
    totalTaxBuffer = netRevenue * (manualTaxRate / 100);
    marginalRate = manualTaxRate / 100;
  } else {
    // Engine Mode: Sophisticated Norwegian Logic

    // 1. National Insurance (Trygdeavgift) - Applied to all income
    const trygdeavgiftAmount = netRevenue * trygdeavgiftRate;

    // 2. Ordinary Tax (22%) - Accounts for Personal Allowance (Personfradrag)
    const ordinaryTaxAmount = calculateIncrementalOrdinaryTax(currentProfitYTD, netRevenue);

    // 3. Trinnskatt - Accounts for tiered brackets
    const trinnskattAmount = calculateIncrementalTrinnskatt(currentProfitYTD, netRevenue);

    totalTaxBuffer = trygdeavgiftAmount + ordinaryTaxAmount + trinnskattAmount;

    // Marginal rate for the next NOK
    const currentTrinnskattRate = TRINNSKATT_BRACKETS_2026.find(b => currentProfitYTD <= b.limit)?.rate ?? 0.178;
    const currentOrdinaryRate = currentProfitYTD >= TAX_CONSTANTS_2026.PERSONAL_ALLOWANCE ? ordinaryRate : 0;
    marginalRate = trygdeavgiftRate + currentOrdinaryRate + currentTrinnskattRate;
  }

  return {
    grossAmount: amount,
    netRevenue,
    mvaPart,
    taxBuffer: totalTaxBuffer,
    safeToSpend: amount - mvaPart - totalTaxBuffer,
    marginalRate,
    crossesMvaThreshold,
  };
}

/**
 * Calculates the 22% ordinary tax while respecting the Personal Allowance (Personfradrag).
 */
function calculateIncrementalOrdinaryTax(currentProfit: number, incrementalRevenue: number): number {
  const allowance = TAX_CONSTANTS_2026.PERSONAL_ALLOWANCE;
  const rate = TAX_CONSTANTS_2026.ORDINARY_INCOME_TAX;

  // Case 1: Already above allowance
  if (currentProfit >= allowance) {
    return incrementalRevenue * rate;
  }

  // Case 2: Entirely below allowance even after this transaction
  if (currentProfit + incrementalRevenue <= allowance) {
    return 0;
  }

  // Case 3: Crossing the threshold
  const amountAboveThreshold = (currentProfit + incrementalRevenue) - allowance;
  return amountAboveThreshold * rate;
}

/**
 * Calculates trinnskatt across multiple brackets if necessary
 */
function calculateIncrementalTrinnskatt(currentProfit: number, incrementalRevenue: number): number {
  let remainingRevenue = incrementalRevenue;
  let totalTrinnskatt = 0;
  let currentPos = currentProfit;

  for (let i = 0; i < TRINNSKATT_BRACKETS_2026.length; i++) {
    const bracket = TRINNSKATT_BRACKETS_2026[i];
    const prevLimit = i === 0 ? 0 : TRINNSKATT_BRACKETS_2026[i - 1].limit;

    // If our current position is already beyond this bracket limit, skip
    if (currentPos >= bracket.limit) continue;

    // How much space is left in this bracket?
    const capacityInBracket = bracket.limit - currentPos;
    const revenueInThisBracket = Math.min(remainingRevenue, capacityInBracket);

    if (revenueInThisBracket > 0) {
      totalTrinnskatt += revenueInThisBracket * bracket.rate;
      remainingRevenue -= revenueInThisBracket;
      currentPos += revenueInThisBracket;
    }

    if (remainingRevenue <= 0) break;
  }

  return totalTrinnskatt;
}
