package com.enkpilot.app.data.dao

import androidx.room.*
import com.enkpilot.app.data.entities.BusinessProfile
import com.enkpilot.app.data.entities.TransactionEntry
import kotlinx.coroutines.flow.Flow

@Dao
interface VaultDao {

    // Transactions
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: TransactionEntry)

    @Update
    suspend fun updateTransaction(transaction: TransactionEntry)

    @Delete
    suspend fun deleteTransaction(transaction: TransactionEntry)

    @Query("SELECT * FROM transactions ORDER BY date DESC")
    fun getAllTransactions(): Flow<List<TransactionEntry>>

    @Query("SELECT * FROM transactions WHERE date >= :startTime AND date <= :endTime ORDER BY date DESC")
    fun getTransactionsInRange(startTime: Long, endTime: Long): Flow<List<TransactionEntry>>

    @Query("SELECT SUM(amount) FROM transactions WHERE type = 'INCOME' AND date >= :startTime AND date <= :endTime")
    suspend fun getTotalIncome(startTime: Long, endTime: Long): Double?

    @Query("SELECT SUM(amount) FROM transactions WHERE type = 'EXPENSE' AND date >= :startTime AND date <= :endTime")
    suspend fun getTotalExpense(startTime: Long, endTime: Long): Double?

    // Business Profile
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveBusinessProfile(profile: BusinessProfile)

    @Query("SELECT * FROM business_profile WHERE id = 1")
    fun getBusinessProfile(): Flow<BusinessProfile?>
}
