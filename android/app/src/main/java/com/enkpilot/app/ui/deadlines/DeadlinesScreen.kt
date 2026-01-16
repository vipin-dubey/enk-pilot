package com.enkpilot.app.ui.deadlines

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.enkpilot.app.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun DeadlinesScreen(viewModel: DeadlinesViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Settings & Filters Section
        Surface(
            color = Color.Transparent,
            tonalElevation = 0.dp
        ) {
            Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                
                // Notification Config Card
                Surface(
                    color = Color.Transparent,
                    shape = RoundedCornerShape(16.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Notifications, null, tint = Blue600, modifier = Modifier.size(20.dp))
                            Spacer(Modifier.width(12.dp))
                            Text("Påminnelser", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                            Spacer(Modifier.weight(1f))
                            Switch(
                                checked = uiState.isNotificationsEnabled,
                                onCheckedChange = { viewModel.updateNotificationSettings(it, uiState.reminderDays) },
                                colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = Blue600)
                            )
                        }
                        
                        if (uiState.isNotificationsEnabled) {
                            Column {
                                Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                    Text("Varsle meg", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text("${uiState.reminderDays} dager før", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = Blue600)
                                }
                                Slider(
                                    value = uiState.reminderDays.toFloat(),
                                    onValueChange = { viewModel.updateNotificationSettings(true, it.toInt()) },
                                    valueRange = 1f..14f,
                                    steps = 13,
                                    colors = SliderDefaults.colors(thumbColor = Blue600, activeTrackColor = Blue600, inactiveTrackColor = MaterialTheme.colorScheme.outlineVariant)
                                )
                            }
                        }
                    }
                }

                // Filter Chips
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    DeadlineFilterChip("Alle", uiState.filter == "All") { viewModel.setFilter("All") }
                    DeadlineFilterChip("MVA", uiState.filter == "mva") { viewModel.setFilter("mva") }
                    DeadlineFilterChip("Skatt", uiState.filter == "forskuddsskatt") { viewModel.setFilter("forskuddsskatt") }
                }
            }
        }

        val grouped = remember(uiState.deadlines) {
            uiState.deadlines.groupBy { 
                val cal = Calendar.getInstance().apply { timeInMillis = it.date }
                val quarter = (cal.get(Calendar.MONTH) / 3) + 1
                "Kvartal $quarter ${cal.get(Calendar.YEAR)}"
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            grouped.forEach { (quarter, quarterDeadlines) ->
                item {
                    Text(
                        quarter.uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                }
                items(quarterDeadlines) { deadline ->
                    DeadlineCard(deadline) { viewModel.togglePaid(deadline) }
                    Spacer(Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
fun DeadlineFilterChip(label: String, selected: Boolean, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        color = if (selected) MaterialTheme.colorScheme.primary else Color.Transparent,
        shape = RoundedCornerShape(12.dp),
        border = if (selected) null else androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
        modifier = Modifier.height(36.dp)
    ) {
        Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(horizontal = 16.dp)) {
            Text(
                label,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = if (selected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun DeadlineCard(deadline: DeadlineUiModel, onToggle: () -> Unit) {
    Surface(
        color = if (deadline.isPaid) Color.Transparent else Color.Transparent,
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, if (deadline.isPaid) MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f) else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = deadline.isPaid,
                onCheckedChange = { onToggle() },
                colors = CheckboxDefaults.colors(checkedColor = Color(0xFF10B981), uncheckedColor = MaterialTheme.colorScheme.outline)
            )
            
            Spacer(Modifier.width(12.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    deadline.label,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    color = if (deadline.isPaid) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface
                )
                Text(
                    formatDate(deadline.date),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            StatusBadge(deadline.status)
        }
    }
}

@Composable
fun StatusBadge(status: DeadlineStatus) {
    val (color, bg, text, icon) = when (status) {
        DeadlineStatus.BETALT -> QuadColor(Color(0xFF10B981), Color(0xFF10B981).copy(alpha = 0.1f), "Betalt", Icons.Default.CheckCircle)
        DeadlineStatus.FORFALT -> QuadColor(Color(0xFFEF4444), Color(0xFFEF4444).copy(alpha = 0.1f), "Forfalt", Icons.Default.Error)
        DeadlineStatus.KOMMENDE -> QuadColor(Color(0xFFF59E0B), Color(0xFFF59E0B).copy(alpha = 0.1f), "Snart", Icons.Default.Timer)
        DeadlineStatus.FREMTIDIG -> QuadColor(MaterialTheme.colorScheme.onSurfaceVariant, Color.Transparent, "Fremtid", Icons.Default.CalendarToday)
    }
    
    Surface(
        color = bg,
        shape = RoundedCornerShape(8.dp),
        border = if (bg == Color.Transparent) androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.5f)) else null,
        modifier = Modifier.height(24.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Icon(icon, null, tint = color, modifier = Modifier.size(12.dp))
            Text(text, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Black, color = color, fontSize = 9.sp)
        }
    }
}

private data class QuadColor(val color: Color, val bg: Color, val text: String, val icon: androidx.compose.ui.graphics.vector.ImageVector)

private fun formatDate(ms: Long): String {
    val date = Date(ms)
    val formatter = SimpleDateFormat("d. MMMM yyyy", Locale("nb", "NO"))
    return formatter.format(date)
}
