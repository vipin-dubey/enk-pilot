package com.enkpilot.app.ui.pulse

import androidx.compose.foundation.background
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
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
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

@Composable
fun PulseScreen(viewModel: PulseViewModel) {
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        // Welcome Header
        Column(modifier = Modifier.padding(top = 8.dp)) {
            Text(
                "The Pulse",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onBackground
            )
            Text(
                "Velkommen tilbake",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.secondary
            )
        }

        // Safe to Spend Card (Primary Call to Action)
        SafeToSpendCard(uiState.safeToSpend)

        // Yearly Overview Card
        OverviewCard(uiState.ytdIncome, uiState.ytdExpenses)

        // Quick Insights
        InsightRow(uiState.taxReserved)
    }
}

private fun formatCurrency(amount: Double): String {
    val formatter = NumberFormat.getCurrencyInstance(Locale("nb", "NO"))
    formatter.maximumFractionDigits = 0
    return formatter.format(amount).replace("NOK", "kr")
}

@Composable
fun SafeToSpendCard(amount: Double) {
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
                        color = Color.White.copy(alpha = 0.7f),
                        style = MaterialTheme.typography.labelSmall
                    )
                }

                Button(
                    onClick = { /* TODO */ },
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
                "Oversikt 2024",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onSurface
            )

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                OverviewItem("Inntekt (YTD)", formatCurrency(income), Color(0xFF10B981))
                OverviewItem("Utgifter (YTD)", formatCurrency(expenses), Color(0xFFEF4444))
            }

            Divider(color = MaterialTheme.colorScheme.surfaceVariant, thickness = 1.dp)

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
fun OverviewItem(label: String, value: String, color: Color) {
    Column {
        Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.secondary)
        Text(value, style = MaterialTheme.typography.titleLarge.copy(fontSize = 20.sp), color = color, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun InsightRow(taxAmount: Double) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        InsightCard(
            modifier = Modifier.weight(1f),
            icon = Icons.Default.TrendingUp,
            label = "Sparing",
            value = "kr 0", // Future logic
            color = Color(0xFF8B5CF6)
        )
        InsightCard(
            modifier = Modifier.weight(1f),
            icon = Icons.Default.Info,
            label = "Beregnet Skatt",
            value = formatCurrency(taxAmount),
            color = Color(0xFFF59E0B)
        )
    }
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
