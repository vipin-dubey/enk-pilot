package com.enkpilot.app.data.entities

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "transactions")
data class TransactionEntry(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val date: Long, // Unix timestamp
    val vendor: String,
    val amount: Double,
    val category: String,
    val description: String? = null,
    val type: TransactionType,
    val mvaCode: String? = null,
    val mvaAmount: Double? = null,
    val account: String? = null,
    val receiptPath: String? = null,
    val currency: String = "NOK",
    val originalAmount: Double = amount,
    val createdAt: Long = System.currentTimeMillis()
)

enum class TransactionType {
    INCOME, EXPENSE
}
