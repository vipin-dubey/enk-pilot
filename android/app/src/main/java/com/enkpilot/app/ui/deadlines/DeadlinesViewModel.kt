package com.enkpilot.app.ui.deadlines

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.enkpilot.app.data.VaultRepository
import com.enkpilot.app.data.entities.BusinessProfile
import com.enkpilot.app.data.entities.DeadlineEntry
import com.enkpilot.app.util.DeadlineManager
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.*

data class DeadlineUiModel(
    val id: String,
    val type: String,
    val date: Long,
    val label: String,
    val isPaid: Boolean,
    val status: DeadlineStatus
)

enum class DeadlineStatus {
    BETALT, FORFALT, KOMMENDE, FREMTIDIG
}

data class DeadlinesUiState(
    val deadlines: List<DeadlineUiModel> = emptyList(),
    val filter: String = "All",
    val isNotificationsEnabled: Boolean = true,
    val reminderDays: Int = 7
)

class DeadlinesViewModel(private val repository: VaultRepository) : ViewModel() {

    private val _filter = MutableStateFlow("All")
    val filter = _filter.asStateFlow()

    val uiState: StateFlow<DeadlinesUiState> = combine(
        repository.allDeadlines,
        repository.businessProfile,
        _filter
    ) { recorded, profile, currentFilter ->
        val safeProfile = profile ?: BusinessProfile()
        val currentYear = Calendar.getInstance().get(Calendar.YEAR)
        val generated = DeadlineManager.generateDeadlinesForYear(currentYear)
        
        val recordedMap = recorded.associateBy { it.id }
        
        val models = generated.map { gen ->
            val rec = recordedMap[gen.id]
            val isPaid = rec?.isPaid ?: false
            val dateMs = gen.date.timeInMillis
            
            val status = when {
                isPaid -> DeadlineStatus.BETALT
                DeadlineManager.isOverdue(dateMs) -> DeadlineStatus.FORFALT
                DeadlineManager.isUpcoming(dateMs, 14) -> DeadlineStatus.KOMMENDE
                else -> DeadlineStatus.FREMTIDIG
            }
            
            DeadlineUiModel(gen.id, gen.type, dateMs, gen.label, isPaid, status)
        }.filter { 
            currentFilter == "All" || it.type.equals(currentFilter, ignoreCase = true)
        }

        DeadlinesUiState(
            deadlines = models,
            filter = currentFilter,
            isNotificationsEnabled = safeProfile.isDeadlineNotificationsEnabled,
            reminderDays = safeProfile.deadlineReminderDays
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), DeadlinesUiState())

    fun setFilter(filter: String) {
        _filter.value = filter
    }

    fun togglePaid(deadline: DeadlineUiModel) {
        viewModelScope.launch {
            repository.upsertDeadline(
                DeadlineEntry(
                    id = deadline.id,
                    type = deadline.type,
                    date = deadline.date,
                    isPaid = !deadline.isPaid
                )
            )
        }
    }

    fun updateNotificationSettings(enabled: Boolean, days: Int) {
        viewModelScope.launch {
            val current = repository.businessProfile.first() ?: BusinessProfile()
            repository.saveBusinessProfile(
                current.copy(
                    isDeadlineNotificationsEnabled = enabled,
                    deadlineReminderDays = days
                )
            )
        }
    }
}
