package com.enkpilot.app.ui.scanner

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.foundation.border
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.runtime.LaunchedEffect
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import androidx.camera.core.ImageCapture
import androidx.camera.view.PreviewView
import java.util.concurrent.Executors
import com.google.accompanist.permissions.rememberPermissionState

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun ScannerScreen(
    viewModel: ScannerViewModel,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    val cameraPermissionState = rememberPermissionState(android.Manifest.permission.CAMERA)
    
    val cameraExecutor = remember { Executors.newSingleThreadExecutor() }
    val scope = rememberCoroutineScope()
    
    // We'll use a simpler approach: define the ImageCapture outside or pass it in
    val imageCapture = remember {
        ImageCapture.Builder()
            .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
            .build()
    }

    LaunchedEffect(Unit) {
        if (!cameraPermissionState.status.isGranted) {
            cameraPermissionState.launchPermissionRequest()
        }
    }



    Box(modifier = Modifier.fillMaxSize()) {
        if (cameraPermissionState.status.isGranted) {
            when (val state = uiState) {
                is ScannerUiState.Idle -> {
                    // Immersive Viewfinder
                    ScannerViewfinder(
                        modifier = Modifier.fillMaxSize(),
                        imageCapture = imageCapture,
                        onImageCaptured = { file -> 
                            viewModel.processScannedReceipt(context, android.net.Uri.fromFile(file))
                        },
                        onError = { viewModel.setError(it.message ?: "Camera Error") }
                    )


                    // Scanner Overlay (Visual Cue)
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .aspectRatio(0.7f)
                                .border(2.dp, Color.White.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                        )
                    }

                    // Scan FAB
                    FloatingActionButton(
                        onClick = {
                            captureImage(
                                imageCapture,
                                context,
                                cameraExecutor,
                                onImageCaptured = { file ->
                                    viewModel.processScannedReceipt(context, android.net.Uri.fromFile(file))
                                },
                                onError = { viewModel.setError(it.message ?: "Capture failed") }
                            )
                        },

                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 64.dp),
                        containerColor = MaterialTheme.colorScheme.primary
                    ) {
                        Text("TAB FOR Å SCANNE", modifier = Modifier.padding(horizontal = 24.dp))
                    }
                }
                is ScannerUiState.Processing -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                is ScannerUiState.Success -> {
                    Surface(
                        modifier = Modifier.fillMaxSize(),
                        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f)
                    ) {
                        Column(
                            modifier = Modifier.fillMaxWidth().padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("The Eye har sett dette:", style = MaterialTheme.typography.headlineSmall, color = MaterialTheme.colorScheme.onSurface)
                            Spacer(modifier = Modifier.height(32.dp))
                            
                            ResultRow("Butikk", state.data.vendor ?: "Ukjent")
                            ResultRow("Sum", "${state.data.amount} NOK")
                            ResultRow("Kategori", state.data.category ?: "Annet")

                            Spacer(modifier = Modifier.weight(1f))
                            
                            Button(
                                onClick = { viewModel.saveTransaction(state.data, state.imageUri); onNavigateBack() },
                                modifier = Modifier.fillMaxWidth().height(56.dp)
                            ) {
                                Text("GODKJENN & LAGRE")
                            }
                            TextButton(onClick = { viewModel.reset() }) {
                                Text("SCAN PÅ NYTT", color = MaterialTheme.colorScheme.primary)
                            }
                        }
                    }
                }
                is ScannerUiState.Error -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("Feil: ${state.message}", color = MaterialTheme.colorScheme.error)
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { viewModel.reset() }) {
                            Text("Prøv igjen")
                        }
                    }
                }
            }
        } else {
            Column(
                modifier = Modifier.align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Kamera-tilgang er nødvendig")
                Button(onClick = { cameraPermissionState.launchPermissionRequest() }) {
                    Text("Gi tilgang")
                }
            }
        }
    }
}

@Composable
fun ResultRow(label: String, value: String) {
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp)) {
        Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
        Text(value, style = MaterialTheme.typography.headlineSmall, color = MaterialTheme.colorScheme.onSurface)
        HorizontalDivider(modifier = Modifier.padding(top = 8.dp), color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f))
    }
}

