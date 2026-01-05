'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { TriangleAlert } from 'lucide-react'
import { Link } from '@/navigation'
import { useLocale } from 'next-intl'
import { Suspense } from 'react'

export default function ErrorPage() {
  const locale = useLocale()
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Suspense fallback={<div>Laster...</div>}>
        <Card className="w-full max-w-md shadow-xl border-none">
          <CardHeader className="text-center pb-2 bg-white rounded-t-xl">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                <TriangleAlert className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold font-outfit uppercase">En feil oppstod</CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Vi beklager, men noe gikk galt under pålogging eller registrering.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6 text-center bg-white px-8">
            <p className="text-slate-600">
              Vennligst sjekk at e-post og passord er riktig, eller prøv igjen senere.
              Husk at du må bekrefte e-posten din før du kan logge inn hvis du nettopp registrerte deg.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center p-8 bg-white rounded-b-xl border-t border-slate-50">
            <Link href="/login" locale={locale}>
              <Button className="bg-blue-600 hover:bg-blue-700 h-11 px-8 font-bold">
                Tilbake til logg inn
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </Suspense>
    </div>
  )
}
