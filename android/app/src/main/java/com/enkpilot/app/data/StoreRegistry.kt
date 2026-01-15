package com.enkpilot.app.data

data class StoreInfo(
    val name: String,
    val keywords: List<String>,
    val defaultCategory: String,
    val defaultMvaRate: Double = 0.25
)

object StoreRegistry {
    val stores = listOf(
        StoreInfo("REMA 1000", listOf("rema", "1000"), "Mat og drikke", 0.15),
        StoreInfo("KIWI", listOf("kiwi"), "Mat og drikke", 0.15),
        StoreInfo("Meny", listOf("meny"), "Mat og drikke", 0.15),
        StoreInfo("Coop", listOf("coop", "extra", "obs", "mega", "prix"), "Mat og drikke", 0.15),
        StoreInfo("Clas Ohlson", listOf("clas", "ohlson"), "Verktøy og utstyr"),
        StoreInfo("Biltema", listOf("biltema"), "Verktøy og utstyr"),
        StoreInfo("IKEA", listOf("ikea"), "Møbler og inventar"),
        StoreInfo("Posten", listOf("posten", "bring"), "Porto og frakt"),
        StoreInfo("Vy", listOf("vy", "tog"), "Reiseutgifter", 0.12),
        StoreInfo("Ruter", listOf("ruter"), "Reiseutgifter", 0.12),
        StoreInfo("Circle K", listOf("circle", "stasjon"), "Drivstoff"),
        StoreInfo("Shell", listOf("shell"), "Drivstoff"),
        StoreInfo("Apple", listOf("apple.com", "itunes", "app store"), "Programvare"),
        StoreInfo("Microsoft", listOf("microsoft", "azure", "office 365"), "Programvare"),
        StoreInfo("Google", listOf("google", "workspace", "cloud"), "Programvare")
    )
}
