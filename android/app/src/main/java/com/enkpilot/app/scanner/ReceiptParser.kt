package com.enkpilot.app.scanner

import com.enkpilot.app.data.StoreInfo
import com.enkpilot.app.data.StoreRegistry
import com.google.mlkit.vision.text.Text
import java.text.SimpleDateFormat
import java.util.*

data class ExtractedReceiptData(
    val vendor: String?,
    val amount: Double?,
    val date: Long?,
    val category: String? = null,
    val mvaRate: Double? = null
)

class ReceiptParser {

    fun parse(text: Text): ExtractedReceiptData {
        val fullText = text.text
        val lines = text.textBlocks.flatMap { it.lines }.map { it.text.lowercase() }

        val vendorInfo = detectVendor(lines)
        val amount = extractAmount(lines)
        val date = extractDate(fullText)

        return ExtractedReceiptData(
            vendor = vendorInfo?.name,
            amount = amount,
            date = date,
            category = vendorInfo?.defaultCategory,
            mvaRate = vendorInfo?.defaultMvaRate
        )
    }

    private fun detectVendor(lines: List<String>): StoreInfo? {
        // Prioritize first few lines
        val searchLines = lines.take(10)
        for (line in searchLines) {
            for (store in StoreRegistry.stores) {
                if (store.keywords.any { line.contains(it, ignoreCase = true) }) {
                    return store
                }
            }
        }
        return null
    }

    private fun extractAmount(lines: List<String>): Double? {
        val amountKeywords = listOf("total", "sum", "beløp", "belop", "fotalt", "betale")
        
        // Find line containing keyword and a number
        for (line in lines.reversed()) { // Usually at the bottom
            if (amountKeywords.any { line.contains(it) }) {
                val number = Regex("""(\d+[\.,]\s?\d{2})""").find(line)?.value
                if (number != null) {
                    return number.replace(" ", "").replace(",", ".").toDoubleOrNull()
                }
            }
        }

        // Fallback: largest number
        return lines.flatMap { Regex("""\d+[\.,]\d{2}""").findAll(it).map { m -> m.value } }
            .map { it.replace(",", ".").toDoubleOrNull() ?: 0.0 }
            .maxOrNull()
    }

    private fun extractDate(fullText: String): Long? {
        val datePatterns = listOf(
            Regex("""\d{2}\.\d{2}\.\d{4}"""),
            Regex("""\d{2}/\d{2}/\d{4}"""),
            Regex("""\d{4}-\d{2}-\d{2}"""),
            Regex("""\d{2}\.\d{2}\.\d{2}""")
        )

        for (pattern in datePatterns) {
            val match = pattern.find(fullText)?.value ?: continue
            val format = when {
                match.contains(".") && match.length == 10 -> "dd.MM.yyyy"
                match.contains("/") -> "dd/MM/yyyy"
                match.contains("-") -> "yyyy-MM-dd"
                match.contains(".") && match.length == 8 -> "dd.MM.yy"
                else -> null
            } ?: continue

            try {
                return SimpleDateFormat(format, Locale.getDefault()).parse(match)?.time
            } catch (e: Exception) {
                // Ignore
            }
        }
        return null
    }
}
