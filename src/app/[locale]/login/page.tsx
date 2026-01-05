import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login, signup } from './actions'
import { Link } from '@/navigation'
import { getTranslations } from 'next-intl/server'

export default async function LoginPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('common')

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="space-y-1 text-center bg-white rounded-t-xl pb-8">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">EP</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold font-outfit uppercase tracking-tighter">ENK Pilot</CardTitle>
          <CardDescription className="text-slate-500 font-medium pt-2">
            Enten du er ny eller veteran, vi hjelper deg med ENK-økonomien.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6 bg-white px-8">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-600 font-semibold">E-post</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="ola@norman.no" 
                required 
                className="h-11 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-600 font-semibold">Passord</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="h-11 border-slate-200"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button formAction={login} className="flex-1 bg-blue-600 hover:bg-blue-700 h-11 font-bold">
                Logg inn
              </Button>
              <Button formAction={signup} variant="outline" className="flex-1 h-11 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold">
                Registrer deg
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 p-8 bg-white rounded-b-xl border-t border-slate-50">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold tracking-wider">Alt er trygt og kryptert</span>
            </div>
          </div>
          <Link href="/" locale={locale} className="text-sm text-blue-600 hover:underline text-center font-medium">
            Glemt passordet?
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
