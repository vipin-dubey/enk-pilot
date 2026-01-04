import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SafeToSpendCalculator } from '@/components/dashboard/safe-to-spend'
import { DeadlineTracker } from '@/components/dashboard/deadline-tracker'
import { ReceiptTriage } from '@/components/dashboard/receipt-triage'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCircle, LogOut, Sparkles } from 'lucide-react'
import { signOut } from './login/actions'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-white px-4 md:px-6">
        <div className="flex items-center gap-2 font-bold text-xl">
          <span className="text-blue-600">ENK</span> Pilot
        </div>
        <div className="ml-auto flex items-center gap-2">
          <form action={signOut}>
            <Button variant="ghost" size="sm" className="gap-2 text-slate-500">
              <LogOut className="h-4 w-4" /> 
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </form>
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border">
            <UserCircle className="h-5 w-5 text-slate-500" />
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Dashboard</h1>
            <p className="text-slate-500">Welcome back, {profile?.full_name || 'User'}! Here's your financial overview.</p>
          </div>
          
          {!profile?.is_pro && (
            <Card className="max-w-sm bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold">Upgrade to Pro</p>
                  <p className="text-xs text-blue-100">Unlock AI PDF Sync & OCR.</p>
                </div>
                <Button size="sm" variant="secondary" className="ml-auto bg-white text-blue-700 hover:bg-blue-50 border-none font-bold">
                  $29
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="bg-slate-100/50 p-1 border">
            <TabsTrigger value="calculator">Safe-to-Spend</TabsTrigger>
            <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="space-y-4">
            <SafeToSpendCalculator 
              taxRate={profile?.tax_rate_percent} 
              isMvaRegistered={profile?.is_mva_registered} 
            />
          </TabsContent>
          
          <TabsContent value="deadlines" className="space-y-4">
            <DeadlineTracker />
          </TabsContent>
          
          <TabsContent value="receipts" className="space-y-4">
            <ReceiptTriage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
