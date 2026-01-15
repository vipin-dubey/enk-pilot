package com.enkpilot.app.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.enkpilot.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(onNavigateToEnkProfile: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50.copy(alpha = 0.5f))
    ) {
        // Header
        Surface(
            color = Color.White,
            tonalElevation = 0.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    "Innstillinger",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Black,
                    color = Slate900
                )
                Text(
                    "Administrer din profil og app-innstillinger",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate500
                )
            }
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            SettingsCategory("Bedrift", listOf(
                SettingsItem(Icons.Default.BusinessCenter, "ENK-profil", "Endre MVA-status og inntektstall") { onNavigateToEnkProfile() }
            ))

            SettingsCategory("Konto & Sikkerhet", listOf(
                SettingsItem(Icons.Default.Lock, "Passord", "Endre ditt passord", enabled = false),
                SettingsItem(Icons.Default.Security, "MFA", "To-faktor autentisering", enabled = false)
            ))

            SettingsCategory("Preferanser", listOf(
                SettingsItem(Icons.Default.Notifications, "Varslinger", "Administrer påminnelser", enabled = false),
                SettingsItem(Icons.Default.Language, "Språk", "Norsk (Bokmål)", enabled = false)
            ))
        }
    }
}

@Composable
fun SettingsCategory(title: String, items: List<SettingsItem>) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(
            title.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Black,
            color = Slate400,
            letterSpacing = 1.sp
        )
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = Color.White,
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate100)
        ) {
            Column {
                items.forEachIndexed { index, item ->
                    SettingsRow(item)
                    if (index < items.size - 1) {
                        Divider(color = Slate50, modifier = Modifier.padding(horizontal = 16.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun SettingsRow(item: SettingsItem) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(enabled = item.enabled) { item.onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .background(if (item.enabled) Blue50 else Slate50, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                item.icon, 
                null, 
                tint = if (item.enabled) Blue600 else Slate400, 
                modifier = Modifier.size(18.dp)
            )
        }
        Spacer(Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                item.title, 
                style = MaterialTheme.typography.bodyMedium, 
                fontWeight = FontWeight.Bold,
                color = if (item.enabled) Slate900 else Slate400
            )
            Text(
                item.subtitle, 
                style = MaterialTheme.typography.labelSmall, 
                color = Slate400
            )
        }
        if (item.enabled) {
            Icon(Icons.Default.ChevronRight, null, tint = Slate300, modifier = Modifier.size(20.dp))
        } else {
            Surface(
                color = Slate100,
                shape = RoundedCornerShape(4.dp)
            ) {
                Text(
                    "Snart", 
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                    style = TextStyle(fontSize = 8.sp, fontWeight = FontWeight.Bold, color = Slate400)
                )
            }
        }
    }
}

data class SettingsItem(
    val icon: ImageVector,
    val title: String,
    val subtitle: String,
    val enabled: Boolean = true,
    val onClick: () -> Unit = {}
)
