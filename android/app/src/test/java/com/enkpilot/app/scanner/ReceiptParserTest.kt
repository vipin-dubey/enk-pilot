package com.enkpilot.app.scanner

import com.google.mlkit.vision.text.Text
import org.junit.Assert.assertEquals
import org.junit.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock

class ReceiptParserTest {

    private val parser = ReceiptParser()

    @Test
    fun `test vendor detection for REMA 1000`() {
        val mockText = mock(Text::class.java)
        val mockBlock = mock(Text.TextBlock::class.java)
        val mockLine = mock(Text.Line::class.java)

        `when`(mockText.text).thenReturn("REMA 1000\nOrg nr 987654321\nMVA")
        `when`(mockLine.text).thenReturn("REMA 1000")
        `when`(mockBlock.lines).thenReturn(listOf(mockLine))
        `when`(mockText.textBlocks).thenReturn(listOf(mockBlock))

        val result = parser.parse(mockText)
        assertEquals("REMA 1000", result.vendor)
        assertEquals("Mat og drikke", result.category)
        assertEquals(0.15, result.mvaRate!!, 0.01)
    }

    @Test
    fun `test amount extraction with fotalt typo`() {
        val mockText = mock(Text::class.java)
        val mockBlock = mock(Text.TextBlock::class.java)
        val mockLine = mock(Text.Line::class.java)

        // Simulating the common OCR error "fotalt" instead of "totalt"
        `when`(mockText.text).thenReturn("FODTALT 450,50")
        `when`(mockLine.text).thenReturn("fotalt 450,50")
        `when`(mockBlock.lines).thenReturn(listOf(mockLine))
        `when`(mockText.textBlocks).thenReturn(listOf(mockBlock))

        val result = parser.parse(mockText)
        assertEquals(450.50, result.amount!!, 0.01)
    }
}
