package com.enkpilot.app.ui.navigation

sealed class NavRoute(val route: String) {
    // Main Tabs
    object Pulse : NavRoute("pulse")
    object Eye : NavRoute("eye")
    object Calculator : NavRoute("calculator")
    
    // More Menu Items
    object Receipts : NavRoute("receipts")
    object Journal : NavRoute("journal")
    object Deadlines : NavRoute("deadlines")
    object Analysis : NavRoute("analysis")
    object Settings : NavRoute("settings")
    object EnkProfile : NavRoute("enk_profile")
}
