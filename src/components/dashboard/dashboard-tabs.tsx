'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutDashboard, Calendar, Receipt, History } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { DashboardHeaderActions } from './header-actions'

interface DashboardTabsProps {
  children: {
    safeToSpend: React.ReactNode
    deadlines: React.ReactNode
    receipts: React.ReactNode
    history: React.ReactNode
  }
}

export function DashboardTabs({ children }: DashboardTabsProps) {
  const tTabs = useTranslations('tabs')
  const [activeTab, setActiveTab] = useState('safe-to-spend')

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (['safe-to-spend', 'deadlines', 'receipts', 'history'].includes(hash)) {
        setActiveTab(hash)
      }
    }

    handleHash()
    window.addEventListener('hashchange', handleHash)
    
    // Also listen for a custom event for even more reliability
    const handleCustomSwitch = (e: any) => {
      if (e.detail?.tab) setActiveTab(e.detail.tab)
    }
    window.addEventListener('switch-dashboard-tab', handleCustomSwitch)

    return () => {
      window.removeEventListener('hashchange', handleHash)
      window.removeEventListener('switch-dashboard-tab', handleCustomSwitch)
    }
  }, [])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8 text-slate-900">
      <div className="flex items-center justify-between bg-white p-1.5 rounded-xl border shadow-sm sticky top-20 z-10">
        <TabsList className="bg-transparent border-none">
          <TabsTrigger value="safe-to-spend" className="gap-2 px-6 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">
            <LayoutDashboard className="h-4 w-4" />
            {tTabs('safeToSpend')}
          </TabsTrigger>
          <TabsTrigger value="deadlines" className="gap-2 px-6 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">
            <Calendar className="h-4 w-4" />
            {tTabs('deadlines')}
          </TabsTrigger>
          <TabsTrigger value="receipts" className="gap-2 px-6 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">
            <Receipt className="h-4 w-4" />
            {tTabs('receipts')}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2 px-6 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">
            <History className="h-4 w-4" />
            {tTabs('history')}
          </TabsTrigger>
        </TabsList>
        <DashboardHeaderActions />
      </div>

      <TabsContent value="safe-to-spend" className="mt-0 border-none p-0 focus-visible:ring-0">
        {children.safeToSpend}
      </TabsContent>

      <TabsContent value="deadlines" className="mt-0 border-none p-0 focus-visible:ring-0">
        {children.deadlines}
      </TabsContent>

      <TabsContent value="receipts" className="mt-0 border-none p-0 focus-visible:ring-0">
        {children.receipts}
      </TabsContent>

      <TabsContent value="history" className="mt-0 border-none p-0 focus-visible:ring-0">
        {children.history}
      </TabsContent>
    </Tabs>
  )
}
