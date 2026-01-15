package com.enkpilot.app.scanner

import android.app.Activity
import android.content.Intent
import android.content.IntentSender
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.IntentSenderRequest
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions.RESULT_FORMAT_JPEG
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions.SCANNER_MODE_FULL
import com.google.mlkit.vision.documentscanner.GmsDocumentScanning

import android.util.Log

class ScannerManager(private val activity: Activity) {

    private val options = GmsDocumentScannerOptions.Builder()
        .setGalleryImportAllowed(true)
        .setPageLimit(1)
        .setResultFormats(RESULT_FORMAT_JPEG)
        .setScannerMode(SCANNER_MODE_FULL)
        .build()

    private val scanner = GmsDocumentScanning.getClient(options)

    fun startScan(
        scannerLauncher: ActivityResultLauncher<IntentSenderRequest>,
        onFailure: (Exception) -> Unit
    ) {
        Log.d("ScannerManager", "Starting scan intent request...")
        scanner.getStartScanIntent(activity)
            .addOnSuccessListener { intentSender ->
                Log.d("ScannerManager", "Successfully got intentSender")
                scannerLauncher.launch(IntentSenderRequest.Builder(intentSender).build())
            }
            .addOnFailureListener { e ->
                Log.e("ScannerManager", "Failed to get scan intent", e)
                onFailure(e)
            }
    }
}

