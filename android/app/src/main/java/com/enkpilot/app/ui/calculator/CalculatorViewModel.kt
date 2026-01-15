package com.enkpilot.app.ui.calculator

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.enkpilot.app.data.VaultRepository
import com.enkpilot.app.data.entities.TransactionType
import com.enkpilot.app.util.TaxCalculator
import com.enkpilot.app.util.TaxCalculationResult
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class CalculatorViewModel(private val repository: VaultRepository) : ViewModel() {

    private val _grossInput = MutableStateFlow("")
    val grossInput = _grossInput.asStateFlow()

    private val _showSuccess = MutableStateFlow(false)
    val showSuccess = _showSuccess.asStateFlow()

    private val _isManualMode = MutableStateFlow(false)
    val isManualMode = _isManualMode.asStateFlow()

    private val _manualRate = MutableStateFlow("35")
    val manualRate = _manualRate.asStateFlow()

    private val _selectedDate = MutableStateFlow(System.currentTimeMillis())
    val selectedDate = _selectedDate.asStateFlow()

    // Aggregate YTD data from repository
    val ytdData = repository.allTransactions.map { transactions ->
        val income = transactions.filter { it.type == TransactionType.INCOME }.sumOf { it.amount }
        val expenses = transactions.filter { it.type == TransactionType.EXPENSE }.sumOf { it.amount }
        Pair(income, expenses)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), Pair(0.0, 0.0))

    val businessProfile = repository.businessProfile.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        null
    )

    val calculationResult = combine(
        _grossInput,
        ytdData,
        businessProfile,
        _isManualMode,
        _manualRate
    ) { input, ytd, profile, isManual, manualRateStr ->
        val amount = input.toDoubleOrNull() ?: 0.0
        val (ytdIncome, ytdExpenses) = ytd
        val isMvaRegistered = profile?.isMvaRegistered ?: false
        val manualRate = if (isManual) manualRateStr.toDoubleOrNull() else null
        
        TaxCalculator.calculateNorwegianTax(
            amount = amount,
            ytdGrossIncome = ytdIncome,
            ytdExpenses = ytdExpenses,
            externalSalary = 0.0, // Future: Add to profile
            isMvaRegistered = isMvaRegistered,
            manualTaxRate = manualRate
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    fun setGrossInput(input: String) {
        _grossInput.value = input
    }

    fun toggleManualMode() {
        _isManualMode.value = !_isManualMode.value
    }

    fun setManualRate(rate: String) {
        _manualRate.value = rate
    }

    fun setSelectedDate(timestamp: Long) {
        _selectedDate.value = timestamp
    }

    fun markAsMvaRegistered() {
        viewModelScope.launch {
            businessProfile.value?.let { 
                repository.saveBusinessProfile(it.copy(isMvaRegistered = true))
            }
        }
    }

    fun recordAllocation() {
        val res = calculationResult.value ?: return
        if (res.grossAmount <= 0) return

        viewModelScope.launch {
            val transaction = com.enkpilot.app.data.entities.TransactionEntry(
                date = _selectedDate.value,
                vendor = "Salg",
                amount = res.grossAmount,
                category = "Omsetning",
                type = TransactionType.INCOME,
                mvaAmount = res.mvaPart,
                mvaCode = if (res.mvaPart > 0) "3" else null,
                account = "3000"
            )
            repository.insertTransaction(transaction)
            
            _grossInput.value = ""
            _showSuccess.value = true
            kotlinx.coroutines.delay(3000)
            _showSuccess.value = false
        }
    }
}
