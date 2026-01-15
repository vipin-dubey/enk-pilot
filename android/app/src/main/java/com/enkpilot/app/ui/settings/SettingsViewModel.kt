package com.enkpilot.app.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.enkpilot.app.data.VaultRepository
import com.enkpilot.app.data.entities.BusinessProfile
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class SettingsViewModel(private val repository: VaultRepository) : ViewModel() {

    // Main Profile State
    val businessProfile = repository.businessProfile.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        BusinessProfile()
    )

    // Form States for ENK Profile Screen
    private val _isMvaRegistered = MutableStateFlow(false)
    val isMvaRegistered = _isMvaRegistered.asStateFlow()

    private val _ytdIncome = MutableStateFlow("")
    val ytdIncome = _ytdIncome.asStateFlow()

    private val _ytdExpenses = MutableStateFlow("")
    val ytdExpenses = _ytdExpenses.asStateFlow()

    private val _externalSalary = MutableStateFlow("")
    val externalSalary = _externalSalary.asStateFlow()

    private val _annualIncomeEstimate = MutableStateFlow("")
    val annualIncomeEstimate = _annualIncomeEstimate.asStateFlow()

    private val _advanceTaxPaid = MutableStateFlow("")
    val advanceTaxPaid = _advanceTaxPaid.asStateFlow()

    private val _isSaving = MutableStateFlow(false)
    val isSaving = _isSaving.asStateFlow()

    private val _saveSuccess = MutableStateFlow(false)
    val saveSuccess = _saveSuccess.asStateFlow()

    init {
        // Initialize form states when profile is loaded
        viewModelScope.launch {
            businessProfile.filterNotNull().collectLatest { profile ->
                _isMvaRegistered.value = profile.isMvaRegistered
                _ytdIncome.value = if (profile.ytdIncomeOverride > 0) profile.ytdIncomeOverride.toInt().toString() else "0"
                _ytdExpenses.value = if (profile.ytdExpenseOverride > 0) profile.ytdExpenseOverride.toInt().toString() else "0"
                _externalSalary.value = if (profile.externalSalary > 0) profile.externalSalary.toInt().toString() else "0"
                _annualIncomeEstimate.value = if (profile.annualIncomeEstimate > 0) profile.annualIncomeEstimate.toInt().toString() else "0"
                _advanceTaxPaid.value = if (profile.advanceTaxPaid > 0) profile.advanceTaxPaid.toInt().toString() else "0"
            }
        }
    }

    fun setMvaRegistered(value: Boolean) { _isMvaRegistered.value = value }
    fun setYtdIncome(value: String) { _ytdIncome.value = value }
    fun setYtdExpenses(value: String) { _ytdExpenses.value = value }
    fun setExternalSalary(value: String) { _externalSalary.value = value }
    fun setAnnualIncomeEstimate(value: String) { _annualIncomeEstimate.value = value }
    fun setAdvanceTaxPaid(value: String) { _advanceTaxPaid.value = value }

    fun saveSettings() {
        viewModelScope.launch {
            _isSaving.value = true
            val currentProfile = businessProfile.value ?: BusinessProfile()
            val updatedProfile = currentProfile.copy(
                isMvaRegistered = _isMvaRegistered.value,
                ytdIncomeOverride = _ytdIncome.value.toDoubleOrNull() ?: 0.0,
                ytdExpenseOverride = _ytdExpenses.value.toDoubleOrNull() ?: 0.0,
                externalSalary = _externalSalary.value.toDoubleOrNull() ?: 0.0,
                annualIncomeEstimate = _annualIncomeEstimate.value.toDoubleOrNull() ?: 0.0,
                advanceTaxPaid = _advanceTaxPaid.value.toDoubleOrNull() ?: 0.0
            )
            repository.saveBusinessProfile(updatedProfile)
            _isSaving.value = false
            _saveSuccess.value = true
            kotlinx.coroutines.delay(3000)
            _saveSuccess.value = false
        }
    }
}
