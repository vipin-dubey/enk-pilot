package com.enkpilot.app.ui.pulse

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.enkpilot.app.data.VaultRepository
import com.enkpilot.app.data.entities.BusinessProfile
import com.enkpilot.app.data.entities.TransactionType
import com.enkpilot.app.util.TaxCalculator
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class PulseUiState(
    val safeToSpend: Double = 0.0,
    val ytdIncome: Double = 0.0,
    val ytdExpenses: Double = 0.0,
    val taxReserved: Double = 0.0,
    val mvaReserved: Double = 0.0,
    val isLoading: Boolean = true
)

class PulseViewModel(private val repository: VaultRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(PulseUiState())
    val uiState = _uiState.asStateFlow()

    init {
        // Combine profile overrides and journal transactions
        combine(
            repository.businessProfile,
            repository.allTransactions
        ) { profile, transactions ->
            calculateState(profile ?: BusinessProfile(), transactions)
        }.onEach { newState ->
            _uiState.value = newState.copy(isLoading = false)
        }.launchIn(viewModelScope)
    }

    private fun calculateState(profile: BusinessProfile, transactions: List<com.enkpilot.app.data.entities.TransactionEntry>): PulseUiState {
        // 1. Aggregate YTD Income (Overrides + Journal)
        val journalIncome = transactions.filter { it.type == TransactionType.INCOME }.sumOf { it.amount }
        val totalYtdIncome = profile.ytdIncomeOverride + journalIncome

        // 2. Aggregate YTD Expenses (Overrides + Journal)
        val journalExpenses = transactions.filter { it.type == TransactionType.EXPENSE }.sumOf { it.amount }
        val totalYtdExpenses = profile.ytdExpenseOverride + journalExpenses

        // 3. Calculate Net Profit (for Tax)
        val netProfit = (totalYtdIncome + profile.externalSalary) - totalYtdExpenses

        // 4. Calculate MVA Reserved (20% of Gross Revenue if MVA registered)
        // Norwegian logic: 25% MVA means it's 20% of the gross amount paid by customer.
        val mvaReserved = if (profile.isMvaRegistered) {
            totalYtdIncome * (0.25 / 1.25)
        } else {
            0.0
        }

        // 5. Calculate Tax Reserved (Using engine's annual logic)
        val taxReserved = TaxCalculator.calculateAnnualTax(netProfit)

        // 6. Calculate Safe to Spend
        // Formula: Gross Income - MVA - Expenses - Tax
        val safeToSpend = (totalYtdIncome - mvaReserved) - totalYtdExpenses - taxReserved

        return PulseUiState(
            safeToSpend = maxOf(0.0, safeToSpend),
            ytdIncome = totalYtdIncome,
            ytdExpenses = totalYtdExpenses,
            taxReserved = taxReserved,
            mvaReserved = mvaReserved
        )
    }
}
