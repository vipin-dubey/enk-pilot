package com.enkpilot.app.ui.receipts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.enkpilot.app.data.VaultRepository
import com.enkpilot.app.data.entities.TransactionEntry
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class ReceiptsViewModel(private val repository: VaultRepository) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()

    private val _categoryFilter = MutableStateFlow("All")
    val categoryFilter = _categoryFilter.asStateFlow()

    val transactions: StateFlow<List<TransactionEntry>> = combine(
        repository.allTransactions,
        _searchQuery,
        _categoryFilter
    ) { allTransactions: List<TransactionEntry>, query: String, category: String ->
        allTransactions.filter { transaction ->
            val matchesQuery = transaction.vendor.contains(query, ignoreCase = true) ||
                    transaction.amount.toString().contains(query)
            val matchesCategory = category == "All" || transaction.category == category
            matchesQuery && matchesCategory
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setCategoryFilter(category: String) {
        _categoryFilter.value = category
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
}
