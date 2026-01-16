package com.enkpilot.app.ui.analysis

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.enkpilot.app.ui.theme.*

data class BarData(
    val label: String,
    val value1: Float, // Income
    val value2: Float  // Expense
)

@Composable
fun SimpleBarChart(
    data: List<BarData>,
    modifier: Modifier = Modifier
) {
    val maxVal = (data.flatMap { listOf(it.value1, it.value2) }.maxOrNull() ?: 1f).coerceAtLeast(1f)
    
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.Bottom
    ) {
        data.forEach { item ->
            Column(
                modifier = Modifier.weight(1f),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Bottom
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .weight(1f),
                    contentAlignment = Alignment.BottomCenter
                ) {
                    // Two bars side by side for each month
                    Row(
                        modifier = Modifier.fillMaxHeight(),
                        verticalAlignment = Alignment.Bottom,
                        horizontalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
                        // Income Bar
                        Box(
                            modifier = Modifier
                                .fillMaxHeight(item.value1 / maxVal)
                                .width(8.dp)
                                .background(Blue600, RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp))
                        )
                        // Expense Bar
                        Box(
                            modifier = Modifier
                                .fillMaxHeight(item.value2 / maxVal)
                                .width(8.dp)
                                .background(MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp))
                        )
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = item.label,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 8.sp
                )
            }
        }
    }
}

@Composable
fun CategoryDistributionRow(
    category: String,
    amount: Double,
    percentage: Float,
    color: Color
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = category,
                style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = String.format("%.0f kr", amount),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .background(MaterialTheme.colorScheme.background, CircleShape)
                .border(0.5.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f), CircleShape)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(percentage)
                    .fillMaxHeight()
                    .background(color, CircleShape)
            )
        }
    }
}

private val CircleShape = RoundedCornerShape(50)
