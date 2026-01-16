package com.enkpilot.app.scanner

import android.graphics.Rect
import com.google.mlkit.vision.text.Text
import org.junit.Assert.assertEquals
import org.junit.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock

class ReceiptParserTest {

    private val parser = ReceiptParser()

    @Test
    fun `test Clas Ohlson receipt sample`() {
        val mockText = mock(Text::class.java)
        
        // Mock "Clas Ohlson" at top
        val vendorLine = createMockLine("Clas Ohlson", 100, 10, 500, 100)
        
        // Mock Date line: "0129 3 TWH 793905 16/12/25 12:19"
        val dateLine = createMockLine("0129 3 TWH 793905 16/12/25 12:19", 100, 200, 800, 250)
        
        // Mock Total line: "TOTAL 969,00"
        val totalLine = createMockLine("TOTAL 969,00", 100, 500, 800, 550)
        
        // Mock MVA section: "MOMS 193.70"
        val mvaLine = createMockLine("MOMS 193.70", 100, 700, 800, 750)

        val mockBlock = mock(Text.TextBlock::class.java)
        `when`(mockBlock.lines).thenReturn(listOf(vendorLine, dateLine, totalLine, mvaLine))
        `when`(mockText.textBlocks).thenReturn(listOf(mockBlock))

        val result = parser.parse(mockText)
        
        assertEquals("Clas Ohlson", result.vendor)
        assertEquals(969.00, result.amount ?: 0.0, 0.01)
        assertEquals(193.70, result.mvaAmount ?: 0.0, 0.01)
        
        // 16/12/25 is Dec 16, 2025
        val dateStr = java.text.SimpleDateFormat("dd/MM/yy").format(java.util.Date(result.date!!))
        assertEquals("16/12/25", dateStr)
    }

    private fun createMockLine(text: String, left: Int, top: Int, right: Int, bottom: Int): Text.Line {
        val line = mock(Text.Line::class.java)
        val element = mock(Text.Element::class.java)
        
        // Use a mock Rect and mock the fields if possible, or just use a real Rect if it works
        // Since we are in a unit test, android.graphics.Rect might be a stub.
        val box = mock(android.graphics.Rect::class.java)
        box.left = left
        box.top = top
        box.right = right
        box.bottom = bottom
        
        `when`(line.text).thenReturn(text)
        `when`(line.boundingBox).thenReturn(box)
        
        `when`(element.text).thenReturn(text)
        `when`(element.boundingBox).thenReturn(box)
        
        `when`(line.elements).thenReturn(listOf(element))
        return line
    }
}
