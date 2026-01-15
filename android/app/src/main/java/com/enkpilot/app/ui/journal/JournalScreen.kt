package com.enkpilot.app.ui.journal

import androidx.compose.foundation.background
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.enkpilot.app.data.entities.TransactionEntry
import com.enkpilot.app.data.entities.TransactionType
import com.enkpilot.app.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JournalScreen(viewModel: JournalViewModel) {
    val transactions by viewModel.transactions.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val typeFilter by viewModel.typeFilter.collectAsState()
    val showAccountantView by viewModel.showAccountantView.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        Surface(
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 0.dp
        ) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            "Transaksjonsjournal",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Black,
                            color = Slate900
                        )
                        Text(
                            "En kronologisk oversikt over alt registrert",
                            style = MaterialTheme.typography.bodySmall,
                            color = Slate500
                        )
                    }
                    Button(
                        onClick = { viewModel.exportTransactions() },
                        colors = ButtonDefaults.buttonColors(containerColor = Slate900),
                        shape = RoundedCornerShape(12.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)
                    ) {
                        Icon(Icons.Default.Download, null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Eksport", style = MaterialTheme.typography.labelMedium)
                    }
                }

                TextField(
                    value = searchQuery,
                    onValueChange = { viewModel.setSearchQuery(it) },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("Søk på butikk eller beløp...", color = Slate400, fontSize = 14.sp) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Slate400, modifier = Modifier.size(20.dp)) },
                    singleLine = true,
                    shape = RoundedCornerShape(16.dp),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Slate100,
                        unfocusedContainerColor = Slate100,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent,
                    )
                )
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Type Filters
                    Surface(
                        color = Slate100,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.padding(vertical = 4.dp)
                    ) {
                        Row(modifier = Modifier.padding(4.dp)) {
                            FilterSegment("All", typeFilter == TransactionTypeFilter.ALL) { viewModel.setTypeFilter(TransactionTypeFilter.ALL) }
                            FilterSegment("Inntekt", typeFilter == TransactionTypeFilter.INCOME, Icons.Default.ArrowUpward, Color(0xFF10B981)) { viewModel.setTypeFilter(TransactionTypeFilter.INCOME) }
                            FilterSegment("Utgift", typeFilter == TransactionTypeFilter.EXPENSE, Icons.Default.ArrowDownward, Color(0xFFF59E0B)) { viewModel.setTypeFilter(TransactionTypeFilter.EXPENSE) }
                        }
                    }

                    // Accountant Toggle
                    IconButton(onClick = { viewModel.toggleAccountantView() }) {
                        Icon(
                            Icons.Default.Description, 
                            null, 
                            tint = if (showAccountantView) Blue600 else Slate400,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        }

        if (transactions.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Icon(Icons.Default.History, "", modifier = Modifier.size(48.dp), tint = Slate200)
                    Text("Ingen transaksjoner funnet", color = Slate500, style = MaterialTheme.typography.bodyLarge)
                }
            }
        } else {
            val grouped = remember<Map<Int, Map<String, List<TransactionEntry>>>>(transactions) {
                groupJournalTransactions(transactions)
            }

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = 24.dp)
            ) {
                grouped.forEach { (year, months) ->
                    months.forEach { (month, monthTransactions) ->
                        item {
                            MonthHeader(month = "$month $year")
                        }
                        items(monthTransactions) { transaction ->
                            JournalItem(transaction = transaction, showAccountantInfo = showAccountantView)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FilterSegment(label: String, selected: Boolean, icon: androidx.compose.ui.graphics.vector.ImageVector? = null, iconColor: Color = Color.Unspecified, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        color = if (selected) Color.White else Color.Transparent,
        shape = RoundedCornerShape(8.dp),
        shadowElevation = if (selected) 2.dp else 0.dp
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            if (icon != null) {
                Icon(icon, null, tint = if (selected) iconColor else Slate400, modifier = Modifier.size(12.dp))
                Spacer(Modifier.width(4.dp))
            }
            Text(
                label, 
                style = MaterialTheme.typography.labelSmall, 
                fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                color = if (selected) Slate900 else Slate500
            )
        }
    }
}

@Composable
fun MonthHeader(month: String) {
    Text(
        text = month.uppercase(),
        style = MaterialTheme.typography.labelSmall,
        color = Slate400,
        fontWeight = FontWeight.Black,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 12.dp)
            .padding(top = 8.dp)
    )
}

@Composable
fun JournalItem(transaction: TransactionEntry, showAccountantInfo: Boolean) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 4.dp),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate100)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            val isIncome = transaction.type == TransactionType.INCOME
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(if (isIncome) Color(0xFFECFDF5) else Slate50, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    if (isIncome) Icons.Default.ArrowUpward else Icons.Default.Receipt, 
                    "", 
                    tint = if (isIncome) Color(0xFF10B981) else Slate500, 
                    modifier = Modifier.size(20.dp)
                )
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    transaction.vendor, 
                    style = MaterialTheme.typography.bodyMedium, 
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        formatJournalDate(transaction.date), 
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400
                    )
                    if (showAccountantInfo) {
                        Spacer(Modifier.width(8.dp))
                        Surface(
                            color = Blue50,
                            shape = RoundedCornerShape(4.dp),
                            modifier = Modifier.padding(vertical = 2.dp)
                        ) {
                            Text(
                                "Konto ${transaction.account ?: "???"}", 
                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp),
                                style = androidx.compose.ui.text.TextStyle(fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Blue600)
                            )
                        }
                    }
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    "${if (isIncome) "+" else ""}${transaction.amount.toInt()} kr", 
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Black,
                    color = if (isIncome) Color(0xFF059669) else Slate900
                )
                if (showAccountantInfo && transaction.mvaCode != null) {
                    Text(
                        "MVA Kode ${transaction.mvaCode}", 
                        style = androidx.compose.ui.text.TextStyle(fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate400)
                    )
                }
            }
        }
    }
}

fun groupJournalTransactions(transactions: List<TransactionEntry>): Map<Int, Map<String, List<TransactionEntry>>> {
    val locale = Locale("nb", "NO")
    val monthFormat = SimpleDateFormat("MMMM", locale)
    
    return transactions.groupBy { 
        val cal = Calendar.getInstance().apply { timeInMillis = it.date }
        cal.get(Calendar.YEAR)
    }.toSortedMap(reverseOrder()).mapValues { entry ->
        entry.value.groupBy { 
            val cal = Calendar.getInstance().apply { timeInMillis = it.date }
            monthFormat.format(cal.time).replaceFirstChar { it.uppercase() }
        }.toSortedMap(compareByDescending { monthName ->
            try {
                val date = monthFormat.parse(monthName.lowercase())
                date?.month ?: 0
            } catch (e: Exception) {
                0
            }
        })
    }
}

fun formatJournalDate(timeMillis: Long): String {
    val date = Date(timeMillis)
    val formatter = SimpleDateFormat("d. MMM", Locale("nb", "NO"))
    return formatter.format(date)
}
