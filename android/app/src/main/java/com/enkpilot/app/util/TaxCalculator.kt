package com.enkpilot.app.util

import kotlin.math.max
import kotlin.math.min

/**
 * 2026 Norwegian Tax Constants & Brackets
 */
object TaxConstants2026 {
    const val ORDINARY_INCOME_TAX = 0.22
    const val NATIONAL_INSURANCE_ENK = 0.108
    const val STANDARD_MVA = 0.25
    const val PERSONAL_ALLOWANCE = 114210.0
    const val MVA_THRESHOLD = 50000.0
}

data class TaxBracket(
    val limit: Double,
    val rate: Double
)

val TRINNSKATT_BRACKETS_2026 = listOf(
    TaxBracket(226100.0, 0.0),
    TaxBracket(318300.0, 0.017),
    TaxBracket(725050.0, 0.040),
    TaxBracket(980100.0, 0.137),
    TaxBracket(1467200.0, 0.168),
    TaxBracket(Double.POSITIVE_INFINITY, 0.178)
)

data class TaxCalculationResult(
    val grossAmount: Double,
    val netRevenue: Double,
    val mvaPart: Double,
    val taxBuffer: Double,
    val safeToSpend: Double,
    val marginalRate: Double,
    val crossesMvaThreshold: Boolean
)

object TaxCalculator {

    /**
     * Calculates the tax buffer for a given transaction based on YTD profit and 2026 rules.
     */
    fun calculateNorwegianTax(
        amount: Double,
        ytdGrossIncome: Double,
        ytdExpenses: Double,
        externalSalary: Double,
        isMvaRegistered: Boolean,
        manualTaxRate: Double? = null
    ): TaxCalculationResult {
        // Step 1: MVA Separation
        var mvaPart = 0.0
        var netRevenue = amount

        if (isMvaRegistered) {
            mvaPart = amount - amount / (1 + TaxConstants2026.STANDARD_MVA)
            netRevenue = amount / (1 + TaxConstants2026.STANDARD_MVA)
        }

        // Check MVA threshold scenario
        val crossesMvaThreshold = !isMvaRegistered && (ytdGrossIncome + netRevenue > TaxConstants2026.MVA_THRESHOLD)

        // Step 2: Calculate Current Profit Context
        val currentProfitYTD = (ytdGrossIncome + externalSalary) - ytdExpenses

        // Step 3: Tax Calculation
        var totalTaxBuffer = 0.0
        var marginalRate = 0.0
        val trygdeavgiftRate = TaxConstants2026.NATIONAL_INSURANCE_ENK
        val ordinaryRate = TaxConstants2026.ORDINARY_INCOME_TAX

        if (manualTaxRate != null && manualTaxRate > 0) {
            // Manual Mode: Flat rate as requested by user
            totalTaxBuffer = netRevenue * (manualTaxRate / 100)
            marginalRate = manualTaxRate / 100
        } else {
            // Engine Mode: Sophisticated Norwegian Logic

            // 1. National Insurance (Trygdeavgift) - Applied to all income
            val trygdeavgiftAmount = netRevenue * trygdeavgiftRate

            // 2. Ordinary Tax (22%) - Accounts for Personal Allowance (Personfradrag)
            val ordinaryTaxAmount = calculateIncrementalOrdinaryTax(currentProfitYTD, netRevenue)

            // 3. Trinnskatt - Accounts for tiered brackets
            val trinnskattAmount = calculateIncrementalTrinnskatt(currentProfitYTD, netRevenue)

            totalTaxBuffer = trygdeavgiftAmount + ordinaryTaxAmount + trinnskattAmount

            // Marginal rate for the next NOK
            val currentTrinnskattRate = TRINNSKATT_BRACKETS_2026.find { currentProfitYTD <= it.limit }?.rate ?: 0.178
            val currentOrdinaryRate = if (currentProfitYTD >= TaxConstants2026.PERSONAL_ALLOWANCE) ordinaryRate else 0.0
            marginalRate = trygdeavgiftRate + currentOrdinaryRate + currentTrinnskattRate
        }

        return TaxCalculationResult(
            grossAmount = amount,
            netRevenue = netRevenue,
            mvaPart = mvaPart,
            taxBuffer = totalTaxBuffer,
            safeToSpend = amount - mvaPart - totalTaxBuffer,
            marginalRate = marginalRate,
            crossesMvaThreshold = crossesMvaThreshold
        )
    }

    /**
     * Calculates the 22% ordinary tax while respecting the Personal Allowance (Personfradrag).
     */
    private fun calculateIncrementalOrdinaryTax(currentProfit: Double, incrementalRevenue: Double): Double {
        val allowance = TaxConstants2026.PERSONAL_ALLOWANCE
        val rate = TaxConstants2026.ORDINARY_INCOME_TAX

        // Case 1: Already above allowance
        if (currentProfit >= allowance) {
            return incrementalRevenue * rate
        }

        // Case 2: Entirely below allowance even after this transaction
        if (currentProfit + incrementalRevenue <= allowance) {
            return 0.0
        }

        // Case 3: Crossing the threshold
        val amountAboveThreshold = (currentProfit + incrementalRevenue) - allowance
        return amountAboveThreshold * rate
    }

    /**
     * Calculates trinnskatt across multiple brackets if necessary
     */
    private fun calculateIncrementalTrinnskatt(currentProfit: Double, incrementalRevenue: Double): Double {
        var remainingRevenue = incrementalRevenue
        var totalTrinnskatt = 0.0
        var currentPos = currentProfit

        for (i in TRINNSKATT_BRACKETS_2026.indices) {
            val bracket = TRINNSKATT_BRACKETS_2026[i]

            // If our current position is already beyond this bracket limit, skip
            if (currentPos >= bracket.limit) continue

            // How much space is left in this bracket?
            val capacityInBracket = bracket.limit - currentPos
            val revenueInThisBracket = min(remainingRevenue, capacityInBracket)

            if (revenueInThisBracket > 0) {
                totalTrinnskatt += revenueInThisBracket * bracket.rate
                remainingRevenue -= revenueInThisBracket
                currentPos += revenueInThisBracket
            }

            if (remainingRevenue <= 0) break
        }

        return totalTrinnskatt
    }

    /**
     * Calculates total annual tax for a given net profit (gross - expenses + external salary).
     * Uses the 2026 tax rules.
     */
    fun calculateAnnualTax(totalProfit: Double): Double {
        if (totalProfit <= 0) return 0.0

        // Ordinary Tax (22%) respecting Personal Allowance
        val ordinaryTax = calculateIncrementalOrdinaryTax(0.0, totalProfit)

        // National Insurance (10.8% for ENK)
        val nationalInsurance = totalProfit * TaxConstants2026.NATIONAL_INSURANCE_ENK

        // Trinnskatt
        val trinnskatt = calculateIncrementalTrinnskatt(0.0, totalProfit)

        return ordinaryTax + nationalInsurance + trinnskatt
    }
}
