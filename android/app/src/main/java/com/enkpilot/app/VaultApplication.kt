package com.enkpilot.app

import android.app.Application
import com.enkpilot.app.data.VaultDatabase
import com.enkpilot.app.data.VaultRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob

class VaultApplication : Application() {
    // No need for a database instance here, just a lazy repository
    // In a real app, the passphrase should be provided by the user or from Keystore
    // Using a hardcoded placeholder for initial setup
    private val databasePassphrase = "debug-passphrase-placeholder-2026".toByteArray()
    
    val database by lazy { VaultDatabase.getDatabase(this, databasePassphrase) }
    val repository by lazy { VaultRepository(database.vaultDao(), database.deadlineDao()) }
}
