package com.enkpilot.app.data.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "business_profile")
data class BusinessProfile(
    @PrimaryKey val id: Int = 1, // Singleton profile
    val name: String = "ENK-profil",
    val organizationNumber: String? = null,
    val isMvaRegistered: Boolean = false,
    val ytdIncomeOverride: Double = 0.0,
    val ytdExpenseOverride: Double = 0.0,
    val annualIncomeEstimate: Double = 0.0,
    val externalSalary: Double = 0.0,
    val advanceTaxPaid: Double = 0.0,
    val baseTaxRate: Double = 0.35,
    val taxBuffer: Double = 0.05
)
