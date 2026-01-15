package com.enkpilot.app.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.enkpilot.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EnkProfileScreen(viewModel: SettingsViewModel, onBack: () -> Unit) {
    val isMvaRegistered by viewModel.isMvaRegistered.collectAsState()
    val ytdIncome by viewModel.ytdIncome.collectAsState()
    val ytdExpenses by viewModel.ytdExpenses.collectAsState()
    val externalSalary by viewModel.externalSalary.collectAsState()
    val annualIncomeEstimate by viewModel.annualIncomeEstimate.collectAsState()
    val advanceTaxPaid by viewModel.advanceTaxPaid.collectAsState()
    val isSaving by viewModel.isSaving.collectAsState()
    val saveSuccess by viewModel.saveSuccess.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.BusinessCenter, null, tint = Blue600, modifier = Modifier.size(24.dp))
                        Spacer(Modifier.width(12.dp))
                        Text("ENK-profil", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, null)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        bottomBar = {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color.White,
                tonalElevation = 8.dp
            ) {
                Box(modifier = Modifier.padding(20.dp).windowInsetsPadding(WindowInsets.navigationBars)) {
                    Button(
                        onClick = { viewModel.saveSettings() },
                        modifier = Modifier.fillMaxWidth().height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Slate900),
                        enabled = !isSaving
                    ) {
                        if (isSaving) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                        } else if (saveSuccess) {
                            Icon(Icons.Default.Check, null)
                            Spacer(Modifier.width(8.dp))
                            Text("Lagret!", fontWeight = FontWeight.Bold)
                        } else {
                            Icon(Icons.Default.Save, null)
                            Spacer(Modifier.width(8.dp))
                            Text("Lagre innstillinger", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Slate50.copy(alpha = 0.5f))
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                color = Color.White,
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate100)
            ) {
                Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(24.dp)) {
                    // MVA Toggle
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f).padding(end = 16.dp)) {
                            Text("MVA-registrert", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Slate900)
                            Text("Aktiver dette hvis bedriften din er registrert i MVA-registeret.", style = MaterialTheme.typography.bodySmall, color = Slate500)
                        }
                        Checkbox(
                            checked = isMvaRegistered,
                            onCheckedChange = { viewModel.setMvaRegistered(it) },
                            colors = CheckboxDefaults.colors(checkedColor = Slate900)
                        )
                    }

                    Divider(color = Slate100, thickness = 1.dp)

                    // YTD Row
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        SettingsField(
                            label = "BRUTTOINNTEKT HITTIL I ÅR",
                            value = ytdIncome,
                            onValueChange = { viewModel.setYtdIncome(it) },
                            suffix = "NOK",
                            modifier = Modifier.weight(1f)
                        )
                        SettingsField(
                            label = "UTGIFTER HITTIL I ÅR",
                            value = ytdExpenses,
                            onValueChange = { viewModel.setYtdExpenses(it) },
                            suffix = "NOK",
                            modifier = Modifier.weight(1f)
                        )
                    }

                    // External Salary
                    SettingsField(
                        label = "ÅRLIG EKSTERN LØNN (FRA ANDRE JOBBER)",
                        value = externalSalary,
                        onValueChange = { viewModel.setExternalSalary(it) },
                        suffix = "NOK / YEAR"
                    )

                    // Annual Results & Prepaid Tax
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Box(modifier = Modifier.fillMaxWidth().height(32.dp), contentAlignment = Alignment.BottomStart) {
                                Text(
                                    "FORVENTET ÅRSRESULTAT", 
                                    style = MaterialTheme.typography.labelSmall, 
                                    fontWeight = FontWeight.Black, 
                                    color = Slate500
                                )
                            }
                            OutlinedTextField(
                                value = annualIncomeEstimate,
                                onValueChange = { viewModel.setAnnualIncomeEstimate(it) },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                textStyle = TextStyle(fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Slate900),
                                suffix = { Text("NOK/Y", style = TextStyle(fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate400)) },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                singleLine = true,
                                colors = OutlinedTextFieldDefaults.colors(
                                    unfocusedBorderColor = Slate200,
                                    focusedBorderColor = Slate900,
                                    unfocusedContainerColor = Color.Transparent,
                                    focusedContainerColor = Color.Transparent
                                )
                            )
                        }
                        
                        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Box(modifier = Modifier.fillMaxWidth().height(32.dp), contentAlignment = Alignment.BottomStart) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(), 
                                    horizontalArrangement = Arrangement.SpaceBetween, 
                                    verticalAlignment = Alignment.Bottom
                                ) {
                                    Text(
                                        "ÅRLIG SKATT", 
                                        style = MaterialTheme.typography.labelSmall, 
                                        fontWeight = FontWeight.Black, 
                                        color = Slate500,
                                        modifier = Modifier.weight(1f)
                                    )
                                    Row(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .clickable { /* Scan logic */ }
                                            .padding(horizontal = 4.dp, vertical = 2.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.PictureAsPdf, null, modifier = Modifier.size(12.dp), tint = Blue600)
                                        Spacer(Modifier.width(4.dp))
                                        Text("Skann", style = TextStyle(fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Blue600))
                                    }
                                }
                            }
                            OutlinedTextField(
                                value = advanceTaxPaid,
                                onValueChange = { viewModel.setAdvanceTaxPaid(it) },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                textStyle = TextStyle(fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Slate900),
                                suffix = { Text("NOK/Y", style = TextStyle(fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate400)) },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                singleLine = true,
                                colors = OutlinedTextFieldDefaults.colors(
                                    unfocusedBorderColor = Slate200,
                                    focusedBorderColor = Slate900,
                                    unfocusedContainerColor = Color.Transparent,
                                    focusedContainerColor = Color.Transparent
                                )
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SettingsField(label: String, value: String, onValueChange: (String) -> Unit, suffix: String, modifier: Modifier = Modifier) {
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Box(modifier = Modifier.fillMaxWidth().height(32.dp), contentAlignment = Alignment.BottomStart) {
            Text(
                label, 
                style = MaterialTheme.typography.labelSmall, 
                fontWeight = FontWeight.Black, 
                color = Slate500,
                maxLines = 2
            )
        }
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            textStyle = TextStyle(fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Slate900),
            suffix = { Text(suffix, style = TextStyle(fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate400)) },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedBorderColor = Slate200,
                focusedBorderColor = Slate900,
                unfocusedContainerColor = Color.Transparent,
                focusedContainerColor = Color.Transparent
            )
        )
    }
}
