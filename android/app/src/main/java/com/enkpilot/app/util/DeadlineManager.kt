package com.enkpilot.app.util

import com.enkpilot.app.data.entities.DeadlineEntry
import java.util.*

object DeadlineManager {

    data class GeneratedDeadline(
        val id: String,
        val type: String,
        val date: Calendar,
        val label: String
    )

    fun generateDeadlinesForYear(year: Int): List<GeneratedDeadline> {
        val deadlines = mutableListOf<GeneratedDeadline>()

        // MVA deadlines: bi-monthly on the 10th
        // January, March, May, July, September, November
        listOf(1, 3, 5, 7, 9, 11).forEach { month ->
            val cal = Calendar.getInstance().apply {
                set(year, month - 1, 10, 9, 0, 0)
                set(Calendar.MILLISECOND, 0)
            }
            val monthName = cal.getDisplayName(Calendar.MONTH, Calendar.LONG, Locale("nb", "NO"))
            deadlines.add(
                GeneratedDeadline(
                    id = "mva-$year-$month",
                    type = "mva",
                    date = cal,
                    label = "MVA - $monthName $year"
                )
            )
        }

        // Forskuddsskatt deadlines: quarterly on the 15th
        // March, May, September, November
        listOf(3, 5, 9, 11).forEach { month ->
            val cal = Calendar.getInstance().apply {
                set(year, month - 1, 15, 9, 0, 0)
                set(Calendar.MILLISECOND, 0)
            }
            val monthName = cal.getDisplayName(Calendar.MONTH, Calendar.LONG, Locale("nb", "NO"))
            deadlines.add(
                GeneratedDeadline(
                    id = "tax-$year-$month",
                    type = "forskuddsskatt",
                    date = cal,
                    label = "Forskuddsskatt - $monthName $year"
                )
            )
        }

        return deadlines.sortedBy { it.date.timeInMillis }
    }

    fun isOverdue(date: Long): Boolean {
        val today = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        return date < today.timeInMillis
    }

    fun isUpcoming(date: Long, daysBefore: Int = 14): Boolean {
        val today = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        
        val futureThreshold = Calendar.getInstance().apply {
            timeInMillis = today.timeInMillis
            add(Calendar.DAY_OF_YEAR, daysBefore)
        }

        return date >= today.timeInMillis && date <= futureThreshold.timeInMillis
    }
}
