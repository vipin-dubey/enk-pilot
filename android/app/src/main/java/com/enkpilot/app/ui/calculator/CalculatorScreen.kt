package com.enkpilot.app.ui.calculator

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.enkpilot.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalculatorScreen(viewModel: CalculatorViewModel) {
    val grossInput by viewModel.grossInput.collectAsState()
    val isManualMode by viewModel.isManualMode.collectAsState()
    val manualRate by viewModel.manualRate.collectAsState()
    val ytdData by viewModel.ytdData.collectAsState()
    val result by viewModel.calculationResult.collectAsState()
    val profile by viewModel.businessProfile.collectAsState()
    val selectedDate by viewModel.selectedDate.collectAsState()

    var showDatePicker by remember { mutableStateOf(false) }
    val dateDisplay = java.text.SimpleDateFormat("dd.MM.yyyy", java.util.Locale("nb", "NO")).format(java.util.Date(selectedDate))

    if (showDatePicker) {
        val datePickerState = rememberDatePickerState(initialSelectedDateMillis = selectedDate)
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    datePickerState.selectedDateMillis?.let { viewModel.setSelectedDate(it) }
                    showDatePicker = false
                }) { Text("OK") }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) { Text("Avbryt") }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // MVA Warning if crossing threshold
        if (result?.crossesMvaThreshold == true) {
            MvaWarningCard(onMarkRegistered = { viewModel.markAsMvaRegistered() })
        }

        // Input Card
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = Color.Transparent,
            tonalElevation = 0.dp,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // Date Selection Row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showDatePicker = true }
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.CalendarToday, null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(16.dp))
                        Text("Dato for inntekt", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.Bold)
                    }
                    Text(dateDisplay, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.2f))

                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("BRUTTO BELØP", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        
                        // Manual Tax Toggle
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("Manuell skatt", style = MaterialTheme.typography.labelSmall, color = if (isManualMode) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant)
                            Switch(
                                checked = isManualMode,
                                onCheckedChange = { viewModel.toggleManualMode() },
                                modifier = Modifier.scale(0.7f),
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = MaterialTheme.colorScheme.primary
                                )
                            )
                        }
                    }
                    OutlinedTextField(
                        value = grossInput,
                        onValueChange = { viewModel.setGrossInput(it) },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("0", fontSize = 24.sp, color = MaterialTheme.colorScheme.outlineVariant) },
                        suffix = { Text("NOK", fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 14.sp) },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        shape = RoundedCornerShape(12.dp),
                        textStyle = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Black),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = MaterialTheme.colorScheme.primary,
                            unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant,
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent
                        )
                    )
                }

                if (isManualMode) {
                    Column(
                        modifier = Modifier
                            .background(Color.Transparent, RoundedCornerShape(12.dp))
                            .border(BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)), RoundedCornerShape(12.dp))
                            .padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text("Egendefinert skattesats", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = manualRate,
                                onValueChange = { viewModel.setManualRate(it) },
                                modifier = Modifier.width(100.dp),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                shape = RoundedCornerShape(8.dp),
                                textStyle = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Black),
                                suffix = { Text("%", fontWeight = FontWeight.Bold, color = Blue600) },
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                                    unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                                    focusedContainerColor = MaterialTheme.colorScheme.surface,
                                    unfocusedContainerColor = MaterialTheme.colorScheme.surface
                                )
                            )
                            Text("Denne satsen overstyrer smart-motoren.", style = MaterialTheme.typography.labelSmall, color = Blue700.copy(alpha = 0.7f), modifier = Modifier.weight(1f))
                        }
                    }
                }
            }
        }

        // Safe to Spend Result (Now very prominent and high up)
        result?.let { res ->
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color(0xFF10B981).copy(alpha = 0.1f),
                border = BoxBorder(1.dp, Color(0xFF10B981).copy(alpha = 0.2f))
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("TRYGT Å BRUKE", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Black, color = Color(0xFF10B981))
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text("${"%.0f".format(res.safeToSpend)}", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Black, color = Color(0xFF10B981))
                        Spacer(Modifier.width(8.dp))
                        Text("NOK", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Color(0xFF10B981).copy(alpha = 0.6f), modifier = Modifier.padding(bottom = 6.dp))
                    }
                }
            }

            // Breakdown (Side-by-side to save space)
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                CompactResultCard("MVA", res.mvaPart, Amber500, modifier = Modifier.weight(1f))
                CompactResultCard("Skatt", res.taxBuffer, MaterialTheme.colorScheme.primary, modifier = Modifier.weight(1f))
            }
        }

        // Context Summary (Moved to bottom)
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BoxBorder(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
        ) {
            Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Icon(Icons.Default.Info, null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(20.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text("Din skattekontekst", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.Bold)
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("YTD: ${"%.0f".format(ytdData.first - ytdData.second)} kr", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface)
                        Text("Sats: ${"%.1f".format((result?.marginalRate ?: 0.0) * 100)}%", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface)
                    }
                }
            }
        }

        // Record Button
        val showSuccess by viewModel.showSuccess.collectAsState()
        
        if (showSuccess) {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFF10B981).copy(alpha = 0.1f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(Icons.Default.CheckCircle, null, tint = Color(0xFF10B981), modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Inntekt lagret i journalen!", style = MaterialTheme.typography.labelMedium, color = Color(0xFF10B981), fontWeight = FontWeight.Bold)
                }
            }
        } else if (result != null && result!!.grossAmount > 0) {
            Button(
                onClick = { viewModel.recordAllocation() },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                Icon(Icons.Default.Save, null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("LAGRE INNTEKT", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun CompactResultCard(title: String, amount: Double, accent: Color, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BoxBorder(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
    ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(Modifier.size(3.dp, 12.dp).background(accent, RoundedCornerShape(2.dp)))
                Text(title, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.Bold)
            }
            Text("${"%.0f".format(amount)} kr", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Black)
        }
    }
}

@Composable
fun MvaWarningCard(onMarkRegistered: () -> Unit) {
    Surface(
        shape = RoundedCornerShape(24.dp),
        color = Color(0xFFF59E0B).copy(alpha = 0.1f),
        border = BoxBorder(1.dp, Color(0xFFF59E0B).copy(alpha = 0.2f))
    ) {
        Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Icon(Icons.Default.Warning, null, tint = Color(0xFFF59E0B))
                Text("Du har passert MVA-grensen!", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B))
            }
            Text(
                "Inntekten din har passert 50 000 NOK. Du må nå registrere deg i MVA-registeret og begynne å kreve inn MVA.",
                style = MaterialTheme.typography.bodyMedium,
                color = Color(0xFFF59E0B).copy(alpha = 0.8f)
            )
            Button(
                onClick = onMarkRegistered,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Marker som MVA-registrert", color = Color.White)
            }
        }
    }
}

private fun BoxBorder(width: androidx.compose.ui.unit.Dp, color: Color) = androidx.compose.foundation.BorderStroke(width, color)
