package com.enkpilot.app.ui.analysis

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.enkpilot.app.data.VaultRepository
import com.enkpilot.app.data.entities.TransactionEntry
import com.enkpilot.app.data.entities.TransactionType
import kotlinx.coroutines.flow.*
import java.util.*

data class MonthlyInsight(
    val month: String,
    val income: Double,
    val expense: Double
)

data class CategoryInsight(
    val category: String,
    val amount: Double,
    val percentage: Float
)

data class AnalysisUiState(
    val monthlyInsights: List<MonthlyInsight> = emptyList(),
    val categoryInsights: List<CategoryInsight> = emptyList(),
    val bizGross: Double = 0.0,
    val bizExpenses: Double = 0.0,
    val isLoading: Boolean = true
)

class AnalysisViewModel(private val repository: VaultRepository) : ViewModel() {

    private val currentYear = Calendar.getInstance().get(Calendar.YEAR)

    val uiState: StateFlow<AnalysisUiState> = repository.allTransactions.map { transactions ->
        val yearTransactions = transactions.filter { tr ->
            val cal = Calendar.getInstance().apply { timeInMillis = tr.date }
            cal.get(Calendar.YEAR) == currentYear
        }

        // Monthly aggregation
        val monthlyMap = mutableMapOf<Int, Pair<Double, Double>>()
        yearTransactions.forEach { tr ->
            val cal = Calendar.getInstance().apply { timeInMillis = tr.date }
            val month = cal.get(Calendar.MONTH)
            val current = monthlyMap.getOrDefault(month, 0.0 to 0.0)
            if (tr.type == TransactionType.INCOME) {
                monthlyMap[month] = (current.first + tr.amount) to current.second
            } else {
                monthlyMap[month] = current.first to (current.second + tr.amount)
            }
        }

        val months = (0..11).map { m ->
            val cal = Calendar.getInstance().apply { set(Calendar.MONTH, m) }
            val label = cal.getDisplayName(Calendar.MONTH, Calendar.SHORT, Locale("nb", "NO")) ?: ""
            val valPair = monthlyMap.getOrDefault(m, 0.0 to 0.0)
            MonthlyInsight(label, valPair.first, valPair.second)
        }

        // Category aggregation
        val categoryMap = mutableMapOf<String, Double>()
        var totalBizExpenses = 0.0
        yearTransactions.filter { it.type == TransactionType.EXPENSE }.forEach { tr ->
            val cat = tr.category ?: "Uspesifisert"
            categoryMap[cat] = categoryMap.getOrDefault(cat, 0.0) + tr.amount
            totalBizExpenses += tr.amount
        }

        val categoryInsights = categoryMap.entries
            .map { (cat, amt) -> 
                CategoryInsight(cat, amt, if (totalBizExpenses > 0) (amt / totalBizExpenses).toFloat() else 0f)
            }
            .sortedByDescending { it.amount }
            .take(5)

        val bizGross = yearTransactions.filter { it.type == TransactionType.INCOME }.sumOf { it.amount }

        AnalysisUiState(
            monthlyInsights = months,
            categoryInsights = categoryInsights,
            bizGross = bizGross,
            bizExpenses = totalBizExpenses,
            isLoading = false
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), AnalysisUiState())
}
