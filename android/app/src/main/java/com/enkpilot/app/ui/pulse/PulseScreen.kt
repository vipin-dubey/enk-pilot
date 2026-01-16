package com.enkpilot.app.ui.pulse

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.NumberFormat
import java.util.Locale
import com.enkpilot.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PulseScreen(viewModel: PulseViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    var showDetails by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        // Safe to Spend Card (Primary Call to Action)
        SafeToSpendCard(uiState.safeToSpend, onSeeDetailsClick = { showDetails = true })

        // Yearly Overview Card
        OverviewCard(uiState.ytdIncome, uiState.ytdExpenses)

        // Tax & MVA Reservations
        ReservationSection(uiState.taxReserved, uiState.mvaReserved)
        
        // Quick Insights
        InsightRow(0.0) // Sparing
    }

    if (showDetails) {
        SafeToSpendDetailsSheet(
            uiState = uiState,
            onDismiss = { showDetails = false },
            sheetState = sheetState
        )
    }
}

private fun formatCurrency(amount: Double): String {
    val formatter = NumberFormat.getCurrencyInstance(Locale("nb", "NO"))
    formatter.maximumFractionDigits = 0
    return formatter.format(amount).replace("NOK", "kr")
}

@Composable
fun SafeToSpendCard(amount: Double, onSeeDetailsClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.linearGradient(
                        colors = listOf(
                            Color(0xFF2563EB),
                            Color(0xFF1D4ED8)
                        )
                    )
                )
                .padding(24.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .background(Color.White.copy(alpha = 0.2f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.AutoAwesome, "", tint = Color.White, modifier = Modifier.size(16.dp))
                    }
                    Text(
                        "Safe to Spend",
                        color = Color.White.copy(alpha = 0.9f),
                        style = MaterialTheme.typography.labelLarge
                    )
                }

                Column {
                    Text(
                        formatCurrency(amount),
                        color = Color.White,
                        style = MaterialTheme.typography.headlineMedium.copy(fontSize = 36.sp),
                        fontWeight = FontWeight.Black
                    )
                    Text(
                        "Tilgjengelig etter skatt og faste utgifter",
                        color = Color.White.copy(alpha = 0.8f),
                        style = MaterialTheme.typography.labelSmall
                    )
                }

                Button(
                    onClick = onSeeDetailsClick,
                    colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Text("Se detaljer", color = Color(0xFF1D4ED8), style = MaterialTheme.typography.labelLarge)
                }
            }
        }
    }
}

@Composable
fun OverviewCard(income: Double, expenses: Double) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
            Text(
                "Oversikt 2026",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                OverviewItem("ÅRETS OVERSKUDD (HITTIL)", formatCurrency(income), Color(0xFF10B981), Icons.Default.TrendingUp)
                OverviewItem("ÅRETS KOSTNADER", formatCurrency(expenses), Color(0xFFEF4444))
            }

            Divider(color = MaterialTheme.colorScheme.outlineVariant, thickness = 1.dp)

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Neste frist", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.secondary)
                    Text("MVA Melding", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold)
                }
                Text("10. Feb", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun OverviewItem(label: String, value: String, color: Color, icon: ImageVector? = null) {
    Column {
        Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.Bold)
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(value, style = MaterialTheme.typography.titleLarge.copy(fontSize = 22.sp), color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Black)
            icon?.let { Icon(it, "", tint = color, modifier = Modifier.size(16.dp)) }
        }
    }
}

@Composable
fun ReservationSection(tax: Double, mva: Double) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        ReservationItem(modifier = Modifier.weight(1f), label = "RESERVERT SKATT", value = formatCurrency(tax))
        ReservationItem(modifier = Modifier.weight(1f), label = "RESERVERT MVA", value = formatCurrency(mva))
    }
}

@Composable
fun ReservationItem(modifier: Modifier, label: String, value: String) {
    Column(modifier = modifier) {
        Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.Bold)
        Text(value, style = MaterialTheme.typography.titleLarge.copy(fontSize = 22.sp), color = Blue600, fontWeight = FontWeight.Black)
    }
}

@Composable
fun InsightRow(savings: Double) {
    InsightCard(
        modifier = Modifier.fillMaxWidth(),
        icon = Icons.Default.TrendingUp,
        label = "SPARING",
        value = formatCurrency(savings),
        color = Color(0xFF8B5CF6)
    )
}

@Composable
fun InsightCard(modifier: Modifier, icon: ImageVector, label: String, value: String, color: Color) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Icon(icon, "", tint = color, modifier = Modifier.size(20.dp))
            Column {
                Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.secondary)
                Text(value, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SafeToSpendDetailsSheet(
    uiState: PulseUiState,
    onDismiss: () -> Unit,
    sheetState: SheetState
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        dragHandle = { BottomSheetDefaults.DragHandle() },
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp)
                .padding(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            Text(
                "Slik er beregningen gjort",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Black,
                color = MaterialTheme.colorScheme.onSurface
            )

            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                DetailRow("Bruttoinntekt (YTD)", formatCurrency(uiState.ytdIncome), isBold = true)
                if (uiState.mvaReserved > 0) {
                    DetailRow("Minus MVA-reservasjon (25%)", "- " + formatCurrency(uiState.mvaReserved), color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                DetailRow("Minus Årets kostnader", "- " + formatCurrency(uiState.ytdExpenses), color = MaterialTheme.colorScheme.onSurfaceVariant)
                
                Divider(modifier = Modifier.padding(vertical = 4.dp), color = MaterialTheme.colorScheme.outlineVariant)
                
                DetailRow("Skattemessig resultat", formatCurrency(uiState.ytdIncome - uiState.mvaReserved - uiState.ytdExpenses), color = Blue600, isBold = true)
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.Transparent, RoundedCornerShape(16.dp))
                    .border(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f), RoundedCornerShape(16.dp))
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("SKATTEBEREGNING", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.Bold)
                
                DetailRow("Trygdeavgift (10,8%)", formatCurrency(uiState.taxBreakdown.nationalInsurance))
                DetailRow("Inntektsskatt (22%)", formatCurrency(uiState.taxBreakdown.ordinaryTax))
                if (uiState.taxBreakdown.trinnskatt > 0) {
                    DetailRow("Trinnskatt (eget trinn)", formatCurrency(uiState.taxBreakdown.trinnskatt))
                }
                
                Divider(modifier = Modifier.padding(vertical = 4.dp), color = MaterialTheme.colorScheme.outlineVariant)
                DetailRow("Sum beregnet skatt", formatCurrency(uiState.taxReserved), isBold = true)
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Blue100, RoundedCornerShape(16.dp))
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text("DIN MARGINALSKATT", style = MaterialTheme.typography.labelSmall, color = Blue600, fontWeight = FontWeight.Bold)
                Text(
                    "${(uiState.taxBreakdown.marginalRate * 100).toInt()}%",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Black,
                    color = Blue600
                )
                Text(
                    "Dette er skatten du betaler på din neste tjente krone.",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Blue600),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Safe to Spend", color = Color.White, fontWeight = FontWeight.Bold)
                    Text(formatCurrency(uiState.safeToSpend), color = Color.White, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black)
                }
            }
        }
    }
}

@Composable
fun DetailRow(label: String, value: String, color: Color = MaterialTheme.colorScheme.onSurface, isBold: Boolean = false) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = if (isBold) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = if (isBold) FontWeight.Bold else FontWeight.Normal)
        Text(value, style = MaterialTheme.typography.bodyMedium, color = color, fontWeight = if (isBold) FontWeight.Black else FontWeight.Bold)
    }
}
