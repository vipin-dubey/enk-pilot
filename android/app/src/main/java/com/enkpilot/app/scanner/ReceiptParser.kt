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
    val mvaRate: Double? = null,
    val mvaAmount: Double? = null
)

class ReceiptParser {

    private data class ReceiptRect(
        val left: Int,
        val top: Int,
        val right: Int,
        val bottom: Int
    ) {
        val height = bottom - top
        val centerX = (left + right) / 2
        val centerY = (top + bottom) / 2
    }

    private data class VisualElement(
        val text: String,
        val box: ReceiptRect,
        val confidence: Float
    )

    private data class LogicalLine(
        val elements: List<VisualElement>
    ) {
        val yTop = elements.minOfOrNull { it.box.top } ?: 0
        val yBottom = elements.maxOfOrNull { it.box.bottom } ?: 0
        val text = elements.sortedBy { it.box.left }.joinToString(" ") { it.text }
    }

    fun parse(text: Text): ExtractedReceiptData {
        val allElements = text.textBlocks.flatMap { it.lines }.flatMap { it.elements }.map { 
            val b = it.boundingBox ?: android.graphics.Rect()
            VisualElement(it.text, ReceiptRect(b.left, b.top, b.right, b.bottom), it.confidence)
        }
        
        if (allElements.isEmpty()) return ExtractedReceiptData(null, null, null)

        val maxY = allElements.maxOf { it.box.bottom }
        val minY = allElements.minOf { it.box.top }
        val height = maxY - minY
        val threshold20Percent = minY + height * 0.25 // Slightly more generous for large logos

        // 1. Group into Logical Lines by vertical overlap
        val logicalLines = groupIntoLogicalLines(allElements)

        // 2. Vendor: Physically highest element in top region
        val vendor = detectVendor(allElements, threshold20Percent)

        // 3. Amount, MVA, Date using structural proximity
        val amount = extractStructuralValue(logicalLines, listOf("total", "å betale", "sum", "beløp", "belop", "betalt", "kontant", "kjøp"))
        val mva = extractStructuralValue(logicalLines, listOf("mva", "moms", "vat", "tax", "mva%"))
        val date = extractStructuralDate(logicalLines, allElements)

        return ExtractedReceiptData(
            vendor = vendor?.name,
            amount = amount,
            date = date,
            category = vendor?.defaultCategory,
            mvaRate = vendor?.defaultMvaRate,
            mvaAmount = mva
        )
    }

    private fun groupIntoLogicalLines(elements: List<VisualElement>): List<LogicalLine> {
        val sorted = elements.sortedBy { it.box.top }
        val lines = mutableListOf<MutableList<VisualElement>>()
        
        for (element in sorted) {
            val added = lines.any { line ->
                val lineTop = line.minOf { it.box.top }
                val lineBottom = line.maxOf { it.box.bottom }
                val elementCenter = element.box.centerY
                
                // If the element's center falls within the vertical bounds of an existing line, group it
                if (elementCenter in lineTop..lineBottom || (lineTop + lineBottom) / 2 in element.box.top..element.box.bottom) {
                    line.add(element)
                    true
                } else false
            }
            if (!added) lines.add(mutableListOf(element))
        }
        
        return lines.map { LogicalLine(it) }.sortedBy { it.yTop }
    }

    private fun detectVendor(elements: List<VisualElement>, threshold: Double): StoreInfo? {
        // Filter to items in the top region and sort by vertical position (top-down)
        val topElements = elements.filter { it.box.top < threshold }
            .sortedBy { it.box.top }

        for (el in topElements) {
            val label = el.text.lowercase()
            for (store in StoreRegistry.stores) {
                if (store.keywords.any { label.contains(it) }) return store
            }
        }
        return null
    }

    private fun extractStructuralValue(lines: List<LogicalLine>, anchors: List<String>): Double? {
        val searchLines = if (anchors.contains("total") || anchors.contains("kjøp")) lines.reversed() else lines

        for (line in searchLines) {
            val lineText = line.text.lowercase()
            if (anchors.any { lineText.contains(it) }) {
                // Regex to catch currency values like 969,00 or 969.00 or 9 690.00
                val numbers = Regex("""(\d+[\.,]\s?\d{2})""").findAll(line.text)
                    .map { it.value.replace(" ", "").replace(",", ".").toDoubleOrNull() ?: 0.0 }
                    .filter { it > 0 }
                    .toList()
                
                if (numbers.isNotEmpty()) return numbers.last()
            }
        }
        
        // Final fallback: Largest number in the receipt if we need Total
        if (anchors.contains("total")) {
            return lines.flatMap { Regex("""\d+[\.,]\s?\d{2}""").findAll(it.text).map { m -> m.value } }
                .map { it.replace(" ", "").replace(",", ".").toDoubleOrNull() ?: 0.0 }
                .filter { it > 0 }
                .maxOrNull()
        }

        return null
    }

    private fun extractStructuralDate(lines: List<LogicalLine>, allElements: List<VisualElement>): Long? {
        val dateKeywords = listOf("dato", "date")
        
        for (line in lines) {
            if (dateKeywords.any { line.text.contains(it, ignoreCase = true) }) {
                val date = findDateInString(line.text)
                if (date != null) return date
            }
        }

        return findDateInString(allElements.joinToString(" ") { it.text })
    }

    private fun findDateInString(input: String): Long? {
        val patterns = listOf(
            Regex("""\d{2}[-./]\d{2}[-./]\d{4}"""),
            Regex("""\d{4}[-./]\d{2}[-./]\d{2}"""),
            Regex("""\d{2}[-./]\d{2}[-./]\d{2}""")
        )

        for (pattern in patterns) {
            val match = pattern.find(input)?.value ?: continue
            val separator = when {
                match.contains("/") -> "/"
                match.contains(".") -> "."
                match.contains("-") -> "-"
                else -> "/"
            }
            
            val format = when {
                match.length == 10 && match.startsWith("20") -> "yyyy${separator}MM${separator}dd"
                match.length == 10 -> "dd${separator}MM${separator}yyyy"
                match.length == 8 -> "dd${separator}MM${separator}yy"
                else -> null
            } ?: continue

            try {
                val sdf = SimpleDateFormat(format, Locale.getDefault())
                sdf.isLenient = false
                return sdf.parse(match)?.time
            } catch (e: Exception) { }
        }
        return null
    }
}
