'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as any })
  }

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-[120px] font-bold border-slate-200">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="z-[110]">
        <SelectItem value="en">🇬🇧 English</SelectItem>
        <SelectItem value="nb">🇳🇴 Norsk</SelectItem>
      </SelectContent>
    </Select>
  )
}
