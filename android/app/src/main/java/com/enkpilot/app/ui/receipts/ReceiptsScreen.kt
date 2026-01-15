package com.enkpilot.app.ui.receipts

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.enkpilot.app.data.entities.TransactionEntry
import com.enkpilot.app.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReceiptsScreen(viewModel: ReceiptsViewModel) {
    val transactions by viewModel.transactions.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val categoryFilter by viewModel.categoryFilter.collectAsState()
    
    val categories = listOf("All", "Office", "Travel", "Food", "Equipment", "Marketing", "IT", "Software", "Other")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Search & Filter Header
        Surface(
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 0.dp
        ) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Text(
                    "Kvitteringer",
                    style = MaterialTheme.typography.headlineMedium,
                    color = MaterialTheme.colorScheme.onBackground
                )

                TextField(
                    value = searchQuery,
                    onValueChange = { viewModel.setSearchQuery(it) },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("Søk på butikk eller beløp...", color = Slate500) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Slate500) },
                    singleLine = true,
                    shape = RoundedCornerShape(16.dp),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Slate100,
                        unfocusedContainerColor = Slate100,
                        disabledContainerColor = Slate100,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent,
                    )
                )
                
                ScrollableTabRow(
                    selectedTabIndex = categories.indexOf(categoryFilter),
                    edgePadding = 0.dp,
                    divider = {},
                    containerColor = Color.Transparent,
                    indicator = {}
                ) {
                    categories.forEach { category ->
                        FilterChip(
                            selected = categoryFilter == category,
                            onClick = { viewModel.setCategoryFilter(category) },
                            label = { Text(category, style = MaterialTheme.typography.labelLarge) },
                            modifier = Modifier.padding(end = 8.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Blue600,
                                selectedLabelColor = Color.White,
                                containerColor = Slate50,
                                labelColor = Slate500
                            ),
                            border = null
                        )
                    }
                }
            }
        }

        if (transactions.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Icon(Icons.Default.Receipt, "", modifier = Modifier.size(48.dp), tint = Slate200)
                    Text("Ingen kvitteringer funnet", color = Slate500, style = MaterialTheme.typography.bodyLarge)
                }
            }
        } else {
            val grouped = remember<Map<Int, Map<String, List<TransactionEntry>>>>(transactions) {
                groupTransactions(transactions)
            }

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = 24.dp)
            ) {
                grouped.forEach { (year, months) ->
                    item {
                        YearHeader(year = year)
                    }
                    months.forEach { (month, monthTransactions) ->
                        item {
                            MonthHeader(month = month)
                        }
                        items(monthTransactions) { transaction ->
                            ReceiptItem(transaction = transaction)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun YearHeader(year: Int) {
    Text(
        text = year.toString(),
        style = MaterialTheme.typography.titleLarge,
        fontWeight = FontWeight.Black,
        color = Slate900,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 12.dp)
            .padding(top = 8.dp)
    )
}

@Composable
fun MonthHeader(month: String) {
    Text(
        text = month,
        style = MaterialTheme.typography.labelLarge,
        color = Blue600,
        fontWeight = FontWeight.Bold,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 8.dp)
    )
}

@Composable
fun ReceiptItem(transaction: TransactionEntry) {
    Surface(
        onClick = { /* Detail view? */ },
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 4.dp),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(Blue50, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Receipt, "", tint = Blue600, modifier = Modifier.size(22.dp))
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    transaction.vendor, 
                    style = MaterialTheme.typography.bodyLarge, 
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        formatUnixDate(transaction.date), 
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate500
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Box(
                        modifier = Modifier
                            .background(Slate100, RoundedCornerShape(6.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            transaction.category, 
                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                            fontWeight = FontWeight.Bold,
                            color = Slate700
                        )
                    }
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    "${transaction.amount} NOK", 
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Black,
                    color = Slate900
                )
                transaction.mvaAmount?.let { 
                    Text(
                        "${it} MVA", 
                        style = MaterialTheme.typography.labelSmall, 
                        color = Slate500
                    )
                }
            }
        }
    }
}

fun groupTransactions(transactions: List<TransactionEntry>): Map<Int, Map<String, List<TransactionEntry>>> {
    val locale = Locale("nb", "NO")
    val monthFormat = SimpleDateFormat("MMMM", locale)
    
    return transactions.groupBy { 
        val cal = Calendar.getInstance().apply { timeInMillis = it.date }
        cal.get(Calendar.YEAR)
    }.toSortedMap(reverseOrder()).mapValues { entry ->
        entry.value.groupBy { 
            val cal = Calendar.getInstance().apply { timeInMillis = it.date }
            monthFormat.format(cal.time).replaceFirstChar { if (it.isLowerCase()) it.titlecase(locale) else it.toString() }
        }.toSortedMap(compareByDescending { monthName ->
            // Sort months by calendar order
            try {
                val date = monthFormat.parse(monthName)
                date?.month ?: 0
            } catch (e: Exception) {
                0
            }
        })
    }
}

fun formatUnixDate(timeMillis: Long): String {
    val date = Date(timeMillis)
    val formatter = SimpleDateFormat("d. MMM", Locale("nb", "NO"))
    return formatter.format(date)
}
