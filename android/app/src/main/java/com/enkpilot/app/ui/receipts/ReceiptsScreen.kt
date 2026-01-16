package com.enkpilot.app.ui.receipts

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
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
    
    var transactionToEdit by remember { mutableStateOf<com.enkpilot.app.data.entities.TransactionEntry?>(null) }
    var transactionToDelete by remember { mutableStateOf<com.enkpilot.app.data.entities.TransactionEntry?>(null) }
    
    val categories = listOf("All", "Office", "Travel", "Food", "Equipment", "Marketing", "IT", "Software", "Other")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Search & Filter Section
        Surface(
            color = MaterialTheme.colorScheme.background,
            tonalElevation = 0.dp
        ) {
            Column(modifier = Modifier.padding(bottom = 20.dp, start = 20.dp, end = 20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {

                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { viewModel.setSearchQuery(it) },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("Søk på butikk eller beløp...", color = MaterialTheme.colorScheme.onSurfaceVariant) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant) },
                    singleLine = true,
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color.Transparent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
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
                                selectedContainerColor = MaterialTheme.colorScheme.primary,
                                selectedLabelColor = MaterialTheme.colorScheme.onPrimary,
                                containerColor = Color.Transparent,
                                labelColor = MaterialTheme.colorScheme.onSurfaceVariant
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = categoryFilter == category,
                                borderColor = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f),
                                selectedBorderColor = Color.Transparent
                            )
                        )
                    }
                }
            }
        }

        if (transactions.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Icon(Icons.Default.Receipt, "", modifier = Modifier.size(48.dp), tint = MaterialTheme.colorScheme.outlineVariant)
                    Text("Ingen kvitteringer funnet", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodyLarge)
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
                            ReceiptItem(
                                transaction = transaction,
                                onEdit = { transactionToEdit = it },
                                onDelete = { transactionToDelete = it }
                            )
                        }
                    }
                }
            }
        }

        // Edit Dialog
        transactionToEdit?.let { transaction ->
            com.enkpilot.app.ui.shared.EditTransactionDialog(
                transaction = transaction,
                onDismiss = { transactionToEdit = null },
                onSave = { 
                    viewModel.updateTransaction(it)
                    transactionToEdit = null
                }
            )
        }

        // Delete Confirmation Dialog
        transactionToDelete?.let { transaction ->
            AlertDialog(
                onDismissRequest = { transactionToDelete = null },
                title = { Text("Slett kvittering") },
                text = { Text("Er du sikker på at du vil slette denne kvitteringen fra ${transaction.vendor}?") },
                confirmButton = {
                    TextButton(
                        onClick = {
                            viewModel.deleteTransaction(transaction)
                            transactionToDelete = null
                        },
                        colors = ButtonDefaults.textButtonColors(contentColor = Color.Red)
                    ) {
                        Text("Slett")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { transactionToDelete = null }) {
                        Text("Avbryt")
                    }
                }
            )
        }
    }
}

@Composable
fun YearHeader(year: Int) {
    Text(
        text = year.toString(),
        style = MaterialTheme.typography.titleLarge,
        fontWeight = FontWeight.Black,
        color = MaterialTheme.colorScheme.onSurface,
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
        color = MaterialTheme.colorScheme.primary,
        fontWeight = FontWeight.Bold,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 8.dp)
    )
}

@OptIn(androidx.compose.foundation.ExperimentalFoundationApi::class)
@Composable
fun ReceiptItem(
    transaction: TransactionEntry,
    onEdit: (TransactionEntry) -> Unit,
    onDelete: (TransactionEntry) -> Unit
) {
    var showMenu by remember { mutableStateOf(false) }

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 4.dp)
            .combinedClickable(
                onClick = { /* Could show details */ },
                onLongClick = { showMenu = true }
            ),
        shape = RoundedCornerShape(16.dp),
        color = Color.Transparent,
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
    ) {
        Box {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(Color.Transparent, CircleShape)
                    .border(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f), CircleShape),
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
                    color = MaterialTheme.colorScheme.onSurface
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        formatUnixDate(transaction.date), 
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Box(
                        modifier = Modifier
                            .background(Color.Transparent, RoundedCornerShape(6.dp))
                            .border(0.5.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f), RoundedCornerShape(6.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            transaction.category, 
                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    "${transaction.amount} NOK", 
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.onSurface
                )
                transaction.mvaAmount?.let { 
                    Text(
                        "${it} MVA", 
                        style = MaterialTheme.typography.labelSmall, 
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        DropdownMenu(
            expanded = showMenu,
            onDismissRequest = { showMenu = false },
            modifier = Modifier.background(MaterialTheme.colorScheme.surface)
        ) {
            DropdownMenuItem(
                text = { Text("Rediger") },
                onClick = {
                    showMenu = false
                    onEdit(transaction)
                },
                leadingIcon = { Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(18.dp)) }
            )
            DropdownMenuItem(
                text = { Text("Slett", color = Color.Red) },
                onClick = {
                    showMenu = false
                    onDelete(transaction)
                },
                leadingIcon = { Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red, modifier = Modifier.size(18.dp)) }
            )
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
