'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutDashboard, Calendar, Receipt, History, LineChart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { DashboardHeaderActions } from './header-actions'

interface DashboardTabsProps {
  children: {
    overview: React.ReactNode
    safeToSpend: React.ReactNode
    deadlines: React.ReactNode
    receipts: React.ReactNode
    history: React.ReactNode
    analytics: React.ReactNode
  }
}

export function DashboardTabs({ children }: DashboardTabsProps) {
  const tTabs = useTranslations('tabs')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (['overview', 'safe-to-spend', 'deadlines', 'receipts', 'history', 'analytics'].includes(hash)) {
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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8 text-slate-900">
      <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm p-1 md:p-1.5 rounded-2xl md:rounded-xl border border-slate-200/60 shadow-sm sticky top-2 z-10 mx-auto w-full max-w-full overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide flex-1">
          <TabsList className="bg-transparent border-none h-11 md:h-10 flex w-max md:w-full justify-start md:justify-start px-2 md:px-0 gap-1 md:gap-0">
            <TabsTrigger value="overview" className="gap-2 px-4 md:px-6 py-2 rounded-xl md:rounded-lg data-[state=active]:bg-slate-100/50 data-[state=active]:text-blue-600 data-[state=active]:shadow-none font-bold text-xs md:text-sm whitespace-nowrap transition-all">
              <LayoutDashboard className="h-4 w-4" />
              {tTabs('overview')}
            </TabsTrigger>
            <TabsTrigger value="safe-to-spend" className="gap-2 px-4 md:px-6 py-2 rounded-xl md:rounded-lg data-[state=active]:bg-slate-100/50 data-[state=active]:text-blue-600 data-[state=active]:shadow-none font-bold text-xs md:text-sm whitespace-nowrap transition-all">
              <LineChart className="h-4 w-4" />
              {tTabs('safeToSpend')}
            </TabsTrigger>
            <TabsTrigger value="deadlines" className="gap-2 px-4 md:px-6 py-2 rounded-xl md:rounded-lg data-[state=active]:bg-slate-100/50 data-[state=active]:text-blue-600 data-[state=active]:shadow-none font-bold text-xs md:text-sm whitespace-nowrap transition-all">
              <Calendar className="h-4 w-4" />
              {tTabs('deadlines')}
            </TabsTrigger>
            <TabsTrigger value="receipts" className="gap-2 px-4 md:px-6 py-2 rounded-xl md:rounded-lg data-[state=active]:bg-slate-100/50 data-[state=active]:text-blue-600 data-[state=active]:shadow-none font-bold text-xs md:text-sm whitespace-nowrap transition-all">
              <Receipt className="h-4 w-4" />
              {tTabs('receipts')}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 px-4 md:px-6 py-2 rounded-xl md:rounded-lg data-[state=active]:bg-slate-100/50 data-[state=active]:text-blue-600 data-[state=active]:shadow-none font-bold text-xs md:text-sm whitespace-nowrap transition-all">
              <History className="h-4 w-4" />
              {tTabs('history')}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 px-4 md:px-6 py-2 rounded-xl md:rounded-lg data-[state=active]:bg-slate-100/50 data-[state=active]:text-blue-600 data-[state=active]:shadow-none font-bold text-xs md:text-sm whitespace-nowrap transition-all">
              <LineChart className="h-4 w-4" />
              <div className="flex items-center gap-1.5">
                {tTabs('analytics')}
                <span className="text-[7px] md:text-[8px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm shadow-blue-500/20">Pro</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value="overview" className="mt-0 border-none p-0 focus-visible:ring-0">
        {children.overview}
      </TabsContent>

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

      <TabsContent value="analytics" className="mt-0 border-none p-0 focus-visible:ring-0">
        {children.analytics}
      </TabsContent>
    </Tabs >
  )
}
