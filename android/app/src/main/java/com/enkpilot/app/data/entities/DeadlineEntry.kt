package com.enkpilot.app.data.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "deadlines")
data class DeadlineEntry(
    @PrimaryKey val id: String, // format: type-year-month-day (e.g., mva-2024-01-10)
    val type: String, // "mva" or "forskuddsskatt"
    val date: Long,
    val isPaid: Boolean = false
)
