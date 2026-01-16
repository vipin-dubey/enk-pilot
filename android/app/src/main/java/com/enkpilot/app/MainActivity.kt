package com.enkpilot.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.enkpilot.app.ui.navigation.NavRoute
import com.enkpilot.app.ui.pulse.PulseScreen
import com.enkpilot.app.ui.pulse.PulseViewModel
import com.enkpilot.app.ui.calculator.CalculatorScreen
import com.enkpilot.app.ui.calculator.CalculatorViewModel
import com.enkpilot.app.ui.scanner.ScannerScreen
import com.enkpilot.app.ui.scanner.ScannerViewModel
import com.enkpilot.app.ui.receipts.ReceiptsViewModel
import com.enkpilot.app.ui.receipts.ReceiptsScreen
import com.enkpilot.app.ui.journal.JournalScreen
import com.enkpilot.app.ui.journal.JournalViewModel
import com.enkpilot.app.ui.settings.SettingsScreen
import com.enkpilot.app.ui.settings.EnkProfileScreen
import com.enkpilot.app.ui.settings.SettingsViewModel
import com.enkpilot.app.ui.deadlines.DeadlinesScreen
import com.enkpilot.app.ui.deadlines.DeadlinesViewModel
import com.enkpilot.app.ui.analysis.AnalysisScreen
import com.enkpilot.app.ui.analysis.AnalysisViewModel
import com.enkpilot.app.ui.theme.*
import androidx.work.*
import java.util.concurrent.TimeUnit

@OptIn(ExperimentalMaterial3Api::class)
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val app = application as VaultApplication
        
        // Simple manual DI for now
        val scannerViewModel = ViewModelProvider(this, object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return ScannerViewModel(app.repository) as T
            }
        })[ScannerViewModel::class.java]

        val receiptsViewModel = ViewModelProvider(this, object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return ReceiptsViewModel(app.repository) as T
            }
        })[ReceiptsViewModel::class.java]

        val calculatorViewModel = ViewModelProvider(this, object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return CalculatorViewModel(app.repository) as T
            }
        })[CalculatorViewModel::class.java]

        val journalViewModel = ViewModelProvider(this, object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return JournalViewModel(app.repository) as T
            }
        })[JournalViewModel::class.java]

        val settingsViewModel = ViewModelProvider(this, object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return SettingsViewModel(app.repository) as T
            }
        })[SettingsViewModel::class.java]

        val pulseViewModel = ViewModelProvider(this, object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return PulseViewModel(app.repository) as T
            }
        })[PulseViewModel::class.java]

        val deadlinesViewModel = ViewModelProvider(this, object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return DeadlinesViewModel(app.repository) as T
            }
        })[DeadlinesViewModel::class.java]

        val analysisViewModel = ViewModelProvider(this, object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return AnalysisViewModel(app.repository) as T
            }
        })[AnalysisViewModel::class.java]

        setupDeadlineWorker()

        enableEdgeToEdge()
        setContent {
            ENKPilotTheme {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route ?: NavRoute.Pulse.route
                var showMoreMenu by remember { mutableStateOf(false) }

                if (showMoreMenu) {
                    ModalBottomSheet(
                        onDismissRequest = { showMoreMenu = false },
                        shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
                        containerColor = MaterialTheme.colorScheme.surface,
                        dragHandle = { BottomSheetDefaults.DragHandle(color = MaterialTheme.colorScheme.outlineVariant) }
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 24.dp)
                                .padding(bottom = 48.dp)
                        ) {
                            Text(
                                "Mer",
                                style = MaterialTheme.typography.titleLarge,
                                modifier = Modifier.padding(vertical = 24.dp)
                            )
                            
                            Surface(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(20.dp),
                                color = Color.Transparent,
                                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                            ) {
                                Column {
                                    MenuRow(Icons.Default.ReceiptLong, "Kvitteringer") { 
                                        showMoreMenu = false 
                                        navController.navigate(NavRoute.Receipts.route)
                                    }
                                    HorizontalDivider(color = MaterialTheme.colorScheme.surface, thickness = 1.dp, modifier = Modifier.padding(horizontal = 16.dp))
                                    MenuRow(Icons.Default.Event, "Frister") { 
                                        showMoreMenu = false 
                                        navController.navigate(NavRoute.Deadlines.route)
                                    }
                                    HorizontalDivider(color = MaterialTheme.colorScheme.surface, thickness = 1.dp, modifier = Modifier.padding(horizontal = 16.dp))
                                    MenuRow(Icons.Default.Settings, "Innstillinger") { 
                                        showMoreMenu = false 
                                        navController.navigate(NavRoute.Settings.route)
                                    }
                                }
                            }
                        }
                    }
                }

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    topBar = {
                        val headerInfo = getHeaderInfo(currentRoute)
                        if (headerInfo != null) {
                            Surface(
                                color = MaterialTheme.colorScheme.background,
                                modifier = Modifier.statusBarsPadding()
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 20.dp, vertical = 24.dp)
                                ) {
                                    Text(
                                        text = headerInfo.first,
                                        style = MaterialTheme.typography.headlineMedium,
                                        fontWeight = FontWeight.Black,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = headerInfo.second,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    },
                    floatingActionButton = {
                        FloatingActionButton(
                            onClick = { navController.navigate(NavRoute.Eye.route) },
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = MaterialTheme.colorScheme.onPrimary,
                            shape = CircleShape,
                            modifier = Modifier.padding(bottom = 8.dp)
                        ) {
                            Icon(Icons.Default.PhotoCamera, contentDescription = "The Eye")
                        }
                    },
                    bottomBar = {
                        NavigationBar(
                            containerColor = MaterialTheme.colorScheme.surface,
                            tonalElevation = 0.dp,
                            modifier = Modifier.clip(RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
                        ) {
                            NavigationBarItem(
                                icon = { Icon(Icons.Default.Dashboard, contentDescription = "Puls") },
                                label = { Text("Puls", style = MaterialTheme.typography.labelSmall) },
                                selected = currentRoute == NavRoute.Pulse.route,
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = MaterialTheme.colorScheme.primary,
                                    selectedTextColor = MaterialTheme.colorScheme.primary,
                                    indicatorColor = Color.Transparent,
                                    unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                    unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                                ),
                                onClick = {
                                    navController.navigate(NavRoute.Pulse.route) {
                                        popUpTo(navController.graph.startDestinationId)
                                        launchSingleTop = true
                                    }
                                }
                            )
                            NavigationBarItem(
                                icon = { Icon(Icons.Default.BarChart, contentDescription = "Analyse") },
                                label = { Text("Analyse", style = MaterialTheme.typography.labelSmall) },
                                selected = currentRoute == NavRoute.Analysis.route,
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = MaterialTheme.colorScheme.primary,
                                    selectedTextColor = MaterialTheme.colorScheme.primary,
                                    indicatorColor = Color.Transparent,
                                    unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                    unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                                ),
                                onClick = {
                                    navController.navigate(NavRoute.Analysis.route) {
                                        popUpTo(navController.graph.startDestinationId)
                                        launchSingleTop = true
                                    }
                                }
                            )
                            NavigationBarItem(
                                icon = { Icon(Icons.Default.Calculate, contentDescription = "Kalkulator") },
                                label = { Text("Kalk", style = MaterialTheme.typography.labelSmall) },
                                selected = currentRoute == NavRoute.Calculator.route,
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = MaterialTheme.colorScheme.primary,
                                    selectedTextColor = MaterialTheme.colorScheme.primary,
                                    indicatorColor = Color.Transparent,
                                    unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                    unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                                ),
                                onClick = {
                                    navController.navigate(NavRoute.Calculator.route) {
                                        popUpTo(navController.graph.startDestinationId)
                                        launchSingleTop = true
                                    }
                                }
                            )
                            NavigationBarItem(
                                icon = { Icon(Icons.Default.Book, contentDescription = "Journal") },
                                label = { Text("Journal", style = MaterialTheme.typography.labelSmall) },
                                selected = currentRoute == NavRoute.Journal.route,
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = MaterialTheme.colorScheme.primary,
                                    selectedTextColor = MaterialTheme.colorScheme.primary,
                                    indicatorColor = Color.Transparent,
                                    unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                    unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                                ),
                                onClick = {
                                    navController.navigate(NavRoute.Journal.route) {
                                        popUpTo(navController.graph.startDestinationId)
                                        launchSingleTop = true
                                    }
                                }
                            )
                            NavigationBarItem(
                                icon = { Icon(Icons.Default.MoreHoriz, contentDescription = "More") },
                                label = { Text("Mer", style = MaterialTheme.typography.labelSmall) },
                                selected = showMoreMenu,
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = MaterialTheme.colorScheme.primary,
                                    selectedTextColor = MaterialTheme.colorScheme.primary,
                                    indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                                    unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                    unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                                ),
                                onClick = { showMoreMenu = true }
                            )
                        }
                    }
                )
 { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = NavRoute.Pulse.route,
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable(NavRoute.Pulse.route) { 
                            PulseScreen(viewModel = pulseViewModel) 
                        }
                        composable(NavRoute.Calculator.route) { 
                            CalculatorScreen(viewModel = calculatorViewModel) 
                        }
                        composable(NavRoute.Receipts.route) { 
                            ReceiptsScreen(viewModel = receiptsViewModel) 
                        }
                        composable(NavRoute.Eye.route) {
                            ScannerScreen(
                                viewModel = scannerViewModel,
                                onNavigateBack = { navController.popBackStack(NavRoute.Pulse.route, false) }
                            )
                        }
                        composable(NavRoute.Journal.route) {
                            JournalScreen(viewModel = journalViewModel)
                        }
                        composable(NavRoute.Settings.route) {
                            SettingsScreen(onNavigateToEnkProfile = { navController.navigate(NavRoute.EnkProfile.route) })
                        }
                        composable(NavRoute.EnkProfile.route) {
                            EnkProfileScreen(viewModel = settingsViewModel, onBack = { navController.popBackStack() })
                        }
                        composable(NavRoute.Deadlines.route) {
                            DeadlinesScreen(viewModel = deadlinesViewModel)
                        }
                        composable(NavRoute.Analysis.route) {
                            AnalysisScreen(viewModel = analysisViewModel)
                        }
                    }
                }
            }
        }
    }

    private fun getHeaderInfo(route: String?): Pair<String, String>? {
        return when (route) {
            NavRoute.Pulse.route -> "ENK-puls" to "Live oversikt over ditt enkeltpersonforetaks økonomiske helse."
            NavRoute.Analysis.route -> "Analyse" to "Dypere innsikt i din økonomiske utvikling."
            NavRoute.Calculator.route -> "Kalkulator" to "Beregn skatt og MVA for dine inntekter."
            NavRoute.Journal.route -> "Journal" to "En kronologisk oversikt over alt registrert."
            NavRoute.Receipts.route -> "Kvitteringer" to "Oversikt over alle dine scannede kvitteringer."
            NavRoute.Settings.route -> "Innstillinger" to "Administrer din profil og app-innstillinger."
            NavRoute.EnkProfile.route -> "Virksomhetsprofil" to "Informasjon om ditt enkeltpersonforetak."
            NavRoute.Deadlines.route -> "Frister" to "Oversikt over viktige skatte- og MVA-frister."
            else -> null
        }
    }

    private fun setupDeadlineWorker() {
        val workRequest = PeriodicWorkRequestBuilder<com.enkpilot.app.notifications.DeadlineNotificationWorker>(
            24, TimeUnit.HOURS
        ).setConstraints(
            Constraints.Builder()
                .setRequiredNetworkType(NetworkType.NOT_REQUIRED)
                .build()
        ).build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "deadline_reminders",
            ExistingPeriodicWorkPolicy.KEEP,
            workRequest
        )
    }

    @Composable
    fun MenuRow(icon: ImageVector, label: String, onClick: () -> Unit) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = onClick)
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, contentDescription = label, tint = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.width(16.dp))
            Text(label, style = MaterialTheme.typography.bodyLarge)
        }
    }
}