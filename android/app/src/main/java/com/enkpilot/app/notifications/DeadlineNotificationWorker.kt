package com.enkpilot.app.notifications

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.enkpilot.app.VaultApplication
import com.enkpilot.app.util.DeadlineManager
import kotlinx.coroutines.flow.first
import java.util.*

class DeadlineNotificationWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val app = applicationContext as VaultApplication
        val repository = app.repository
        
        val profile = repository.businessProfile.first() ?: return Result.success()
        
        if (!profile.isDeadlineNotificationsEnabled) return Result.success()

        val leadDays = profile.deadlineReminderDays
        val currentYear = Calendar.getInstance().get(Calendar.YEAR)
        val allGenerated = DeadlineManager.generateDeadlinesForYear(currentYear)
        
        val paidIds = repository.allDeadlines.first().filter { it.isPaid }.map { it.id }.toSet()

        allGenerated.forEach { deadline ->
            if (deadline.id !in paidIds) {
                if (DeadlineManager.isUpcoming(deadline.date.timeInMillis, leadDays)) {
                    // Check if it's EXACTLY leadDays away to avoid duplicate daily spam
                    // (Though simplified logic might just show it if it's within range and not paid)
                    // For a nicer experience, only notify if leadDays == remainingDays
                    
                    val diff = deadline.date.timeInMillis - System.currentTimeMillis()
                    val daysUntil = (diff / (1000 * 60 * 60 * 24)).toInt()
                    
                    if (daysUntil == leadDays) {
                        NotificationHelper.showDeadlineNotification(
                            applicationContext,
                            "Frist nærmer seg!",
                            "${deadline.label} forfaller om $leadDays dager.",
                            deadline.id.hashCode()
                        )
                    }
                }
            }
        }

        return Result.success()
    }
}
