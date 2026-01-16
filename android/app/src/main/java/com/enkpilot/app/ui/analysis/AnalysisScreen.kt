package com.enkpilot.app.ui.analysis

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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

@Composable
fun AnalysisScreen(viewModel: AnalysisViewModel) {
    val uiState by viewModel.uiState.collectAsState()

    if (uiState.isLoading) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
        }
        return
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Monthly Performance Card
        item {
            AnalysisCard(
                title = "Månedlig resultat",
                subtitle = "Inntekt vs Kostnad 2026",
                icon = Icons.Default.TrendingUp,
                iconColor = MaterialTheme.colorScheme.primary
            ) {
                SimpleBarChart(
                    data = uiState.monthlyInsights.map { 
                        BarData(it.month, it.income.toFloat(), it.expense.toFloat()) 
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .padding(top = 16.dp)
                )
            }
        }

        // Expense Distribution Card
        item {
            AnalysisCard(
                title = "Kostnadsfordeling",
                subtitle = "Topp 5 kategorier",
                icon = Icons.Default.PieChart,
                iconColor = Color(0xFF8B5CF6) // Purple
            ) {
                Column(
                    modifier = Modifier.padding(top = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    if (uiState.categoryInsights.isEmpty()) {
                        Text(
                            "Ingen kostnader registrert ennå.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(vertical = 16.dp)
                        )
                    } else {
                        uiState.categoryInsights.forEachIndexed { index, insight ->
                            val color = when(index) {
                                0 -> MaterialTheme.colorScheme.primary
                                1 -> Color(0xFF10B981) // Green
                                2 -> Color(0xFFF59E0B) // Amber
                                3 -> Color(0xFF8B5CF6) // Purple
                                else -> MaterialTheme.colorScheme.outline
                            }
                            CategoryDistributionRow(
                                category = insight.category,
                                amount = insight.amount,
                                percentage = insight.percentage,
                                color = color
                            )
                        }
                    }
                }
            }
        }

        // Tax Return (Selvangivelse) Card
        item {
            Surface(
                color = Color.Transparent,
                shape = RoundedCornerShape(24.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(24.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            color = Color.White.copy(alpha = 0.1f),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                Icons.Default.Receipt,
                                null,
                                tint = Blue400,
                                modifier = Modifier.padding(6.dp)
                            )
                        }
                        Spacer(Modifier.width(12.dp))
                        Column {
                            Text(
                                "Selvangivelse-sjekk",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                "Foreløpig oversikt over poster",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                    
                    Spacer(Modifier.height(24.dp))
                    
                    val profit = uiState.bizGross - uiState.bizExpenses
                    
                    Row(modifier = Modifier.fillMaxWidth()) {
                        TaxBox(Modifier.weight(1f), "Post 101", "Driftsinntekt", uiState.bizGross)
                        Spacer(Modifier.width(12.dp))
                        TaxBox(Modifier.weight(1f), "Post 401", "Driftskostnad", uiState.bizExpenses)
                    }
                    Spacer(Modifier.height(12.dp))
                    Row(modifier = Modifier.fillMaxWidth()) {
                        TaxBox(Modifier.weight(1f), "Post 440", "Overskudd", profit, isResult = true)
                        Spacer(Modifier.weight(1f))
                    }
                }
            }
        }

        item {
            Spacer(Modifier.height(80.dp)) // Padding for FAB
        }
    }
}

@Composable
fun AnalysisCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconColor: Color,
    content: @Composable () -> Unit
) {
    Surface(
        color = Color.Transparent,
        shape = RoundedCornerShape(24.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column {
                    Text(
                        title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        subtitle,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Icon(icon, null, tint = iconColor, modifier = Modifier.size(20.dp))
            }
            content()
        }
    }
}

@Composable
fun TaxBox(modifier: Modifier, code: String, label: String, amount: Double, isResult: Boolean = false) {
    Surface(
        modifier = modifier,
        color = Color.White.copy(alpha = 0.05f),
        shape = RoundedCornerShape(12.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                code,
                style = MaterialTheme.typography.labelSmall,
                fontSize = 8.sp,
                fontWeight = FontWeight.Black,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                letterSpacing = 1.sp
            )
            Text(
                label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 9.sp
            )
            Spacer(Modifier.height(4.dp))
            Text(
                text = String.format("%,.0f", amount).replace(',', ' '),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = if (isResult) Color(0xFF10B981) else Color.White
            )
        }
    }
}
