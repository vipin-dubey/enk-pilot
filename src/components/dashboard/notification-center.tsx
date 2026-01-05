'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Trash2, Calendar, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/utils/supabase/client'
import { useTranslations, useLocale } from 'next-intl'
import { format } from 'date-fns'
import { nb, enUS } from 'date-fns/locale'

export function NotificationCenter() {
  const t = useTranslations('notifications')
  const locale = useLocale()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()

    // Real-time subscription
    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(count => count + 1)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchNotifications() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
  }

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(count => Math.max(0, count - 1))
    }
  }

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'deadlines': return <Calendar className="h-4 w-4 text-blue-500" />
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Info className="h-4 w-4 text-slate-400" />
    }
  }

  const dateLocale = locale === 'nb' ? nb : enUS

  return (
    <Dialog onOpenChange={(open) => { if (open) fetchNotifications() }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white animate-in zoom-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-slate-50/50 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-outfit font-bold flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              {t('title')}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                <Check className="h-3.5 w-3.5 mr-1" />
                {t('markAllRead')}
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-slate-500 font-medium">{t('empty')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`group relative p-4 transition-colors hover:bg-slate-50/80 ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex gap-4">
                    <div className={`mt-1 h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${!n.is_read ? 'bg-white shadow-sm ring-1 ring-blue-100' : 'bg-slate-50'}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 space-y-1 pr-6">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold ${!n.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
                          {n.title}
                        </p>
                        <time className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                          {format(new Date(n.created_at), 'HH:mm', { locale: dateLocale })}
                        </time>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 pt-1">
                        {format(new Date(n.created_at), 'd. MMM yyyy', { locale: dateLocale })}
                      </p>
                    </div>
                  </div>
                  {!n.is_read && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => markAsRead(n.id)}
                      className="absolute top-4 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-blue-100 hover:text-blue-600"
                      title={t('markAsRead')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  {!n.is_read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="p-4 bg-slate-50/50 border-t text-center">
            <Button variant="link" size="sm" className="text-slate-500 hover:text-blue-600 no-underline font-semibold h-auto py-0">
              {t('viewAll')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
