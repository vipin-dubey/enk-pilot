package com.enkpilot.app.ui.journal

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.enkpilot.app.data.VaultRepository
import com.enkpilot.app.data.entities.TransactionEntry
import com.enkpilot.app.data.entities.TransactionType
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class JournalViewModel(private val repository: VaultRepository) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()

    private val _typeFilter = MutableStateFlow(TransactionTypeFilter.ALL)
    val typeFilter = _typeFilter.asStateFlow()

    private val _showAccountantView = MutableStateFlow(false)
    val showAccountantView = _showAccountantView.asStateFlow()

    val transactions: StateFlow<List<TransactionEntry>> = combine(
        repository.allTransactions,
        _searchQuery,
        _typeFilter
    ) { allTransactions: List<TransactionEntry>, query: String, filter: TransactionTypeFilter ->
        allTransactions.filter { transaction ->
            val matchesQuery = transaction.vendor.contains(query, ignoreCase = true) ||
                    transaction.amount.toString().contains(query) ||
                    transaction.category.contains(query, ignoreCase = true)
            
            val matchesType = when (filter) {
                TransactionTypeFilter.ALL -> true
                TransactionTypeFilter.INCOME -> transaction.type == TransactionType.INCOME
                TransactionTypeFilter.EXPENSE -> transaction.type == TransactionType.EXPENSE
            }
            
            matchesQuery && matchesType
        }.sortedByDescending { it.date }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setTypeFilter(filter: TransactionTypeFilter) {
        _typeFilter.value = filter
    }

    fun toggleAccountantView() {
        _showAccountantView.value = !_showAccountantView.value
    }

    fun deleteTransaction(transaction: TransactionEntry) {
        viewModelScope.launch {
            repository.deleteTransaction(transaction)
        }
    }

    fun updateTransaction(transaction: TransactionEntry) {
        viewModelScope.launch {
            repository.updateTransaction(transaction)
        }
    }

    fun exportTransactions() {
        // Future: Implement CSV/PDF export logic similar to web
    }
}

enum class TransactionTypeFilter {
    ALL, INCOME, EXPENSE
}
