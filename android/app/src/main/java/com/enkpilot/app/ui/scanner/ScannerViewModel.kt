package com.enkpilot.app.ui.scanner

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.enkpilot.app.data.VaultRepository
import com.enkpilot.app.data.entities.TransactionEntry
import com.enkpilot.app.data.entities.TransactionType
import com.enkpilot.app.scanner.ExtractedReceiptData
import com.enkpilot.app.scanner.ReceiptParser
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class ScannerUiState {
    object Idle : ScannerUiState()
    object Processing : ScannerUiState()
    data class Success(val data: ExtractedReceiptData, val imageUri: Uri) : ScannerUiState()
    data class Error(val message: String) : ScannerUiState()
}

class ScannerViewModel(private val repository: VaultRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<ScannerUiState>(ScannerUiState.Idle)
    val uiState: StateFlow<ScannerUiState> = _uiState

    private val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
    private val parser = ReceiptParser()

    fun processScannedReceipt(context: Context, uri: Uri) {
        _uiState.value = ScannerUiState.Processing
        
        viewModelScope.launch {
            try {
                val image = InputImage.fromFilePath(context, uri)
                recognizer.process(image)
                    .addOnSuccessListener { visionText ->
                        val extracted = parser.parse(visionText)
                        _uiState.value = ScannerUiState.Success(extracted, uri)
                    }
                    .addOnFailureListener { e ->
                        _uiState.value = ScannerUiState.Error(e.message ?: "OCR failed")
                    }
            } catch (e: Exception) {
                _uiState.value = ScannerUiState.Error(e.message ?: "Failed to load image")
            }
        }
    }

    fun setError(message: String) {
        _uiState.value = ScannerUiState.Error(message)
    }

    fun saveTransaction(data: ExtractedReceiptData, imageUri: Uri) {
        viewModelScope.launch {
            val transaction = TransactionEntry(
                date = data.date ?: System.currentTimeMillis(),
                vendor = data.vendor ?: "Ukjent",
                amount = data.amount ?: 0.0,
                category = data.category ?: "Ukjent",
                type = TransactionType.EXPENSE,
                mvaAmount = (data.amount ?: 0.0) * (data.mvaRate ?: 0.25),
                receiptPath = imageUri.toString()
            )
            repository.insertTransaction(transaction)
            _uiState.value = ScannerUiState.Idle
        }
    }
}
