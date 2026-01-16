package com.enkpilot.app.data.dao

import androidx.room.*
import com.enkpilot.app.data.entities.DeadlineEntry
import kotlinx.coroutines.flow.Flow

@Dao
interface DeadlineDao {
    @Query("SELECT * FROM deadlines")
    fun getAllDeadlines(): Flow<List<DeadlineEntry>>

    @Query("SELECT * FROM deadlines WHERE id = :id")
    suspend fun getDeadlineById(id: String): DeadlineEntry?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertDeadline(deadline: DeadlineEntry)

    @Query("DELETE FROM deadlines WHERE id = :id")
    suspend fun deleteDeadline(id: String)
}
