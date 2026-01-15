package com.enkpilot.app.data

import com.enkpilot.app.data.dao.VaultDao
import com.enkpilot.app.data.entities.BusinessProfile
import com.enkpilot.app.data.entities.TransactionEntry
import kotlinx.coroutines.flow.Flow

class VaultRepository(private val vaultDao: VaultDao) {

    val allTransactions: Flow<List<TransactionEntry>> = vaultDao.getAllTransactions()
    val businessProfile: Flow<BusinessProfile?> = vaultDao.getBusinessProfile()

    suspend fun insertTransaction(transaction: TransactionEntry) {
        vaultDao.insertTransaction(transaction)
    }

    suspend fun updateTransaction(transaction: TransactionEntry) {
        vaultDao.updateTransaction(transaction)
    }

    suspend fun deleteTransaction(transaction: TransactionEntry) {
        vaultDao.deleteTransaction(transaction)
    }

    fun getTransactionsInRange(startTime: Long, endTime: Long): Flow<List<TransactionEntry>> {
        return vaultDao.getTransactionsInRange(startTime, endTime)
    }

    suspend fun saveBusinessProfile(profile: BusinessProfile) {
        vaultDao.saveBusinessProfile(profile)
    }
}
