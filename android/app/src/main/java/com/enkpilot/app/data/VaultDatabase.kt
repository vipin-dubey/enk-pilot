package com.enkpilot.app.data

import android.content.Context
import androidx.room.*
import androidx.sqlite.db.SupportSQLiteDatabase
import com.enkpilot.app.data.dao.VaultDao
import com.enkpilot.app.data.entities.BusinessProfile
import com.enkpilot.app.data.entities.TransactionEntry
import net.zetetic.database.sqlcipher.SQLiteDatabase
import net.zetetic.database.sqlcipher.SupportOpenHelperFactory

@Database(entities = [TransactionEntry::class, BusinessProfile::class], version = 2, exportSchema = true)
abstract class VaultDatabase : RoomDatabase() {

    abstract fun vaultDao(): VaultDao

    companion object {
        @Volatile
        private var INSTANCE: VaultDatabase? = null

        fun getDatabase(context: Context, passphrase: ByteArray): VaultDatabase {
            return INSTANCE ?: synchronized(this) {
                // Initialize SQLCipher native libraries
                System.loadLibrary("sqlcipher")
                
                val factory = SupportOpenHelperFactory(passphrase)
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    VaultDatabase::class.java,
                    "the_vault.db"
                )
                .openHelperFactory(factory)
                .fallbackToDestructiveMigration() // Use with caution in production
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
