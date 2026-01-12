import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login, signup, resendVerification } from './actions'
import { Link } from '@/navigation'
import { getTranslations } from 'next-intl/server'
import AuthHashHandler from './auth-hash-handler'
import { PublicFooter } from '@/components/layout/footer'
import { SubmitButton } from '@/components/auth/submit-button'

export default async function LoginPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string, message?: string }>
}) {
  const { locale } = await params
  const { error, message } = await searchParams
  const t = await getTranslations('auth.login')
  const commonT = await getTranslations('common')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex-1 flex items-center justify-center w-full">
        <AuthHashHandler />
        <Card className="w-full max-w-md shadow-lg border-none">
          <CardHeader className="text-center bg-white rounded-t-xl pb-2 pt-8">
            <div className="flex justify-center mb-4">
              <img
                src="/logo.png"
                alt="ENK Pilot Logo"
                className="h-20 w-auto object-contain animate-in zoom-in duration-1000 drop-shadow-sm"
              />
            </div>
            <span className="sr-only">ENK Pilot</span>
            <CardDescription className="text-slate-500 font-semibold px-4">
              {t('description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 bg-white px-8 pb-4">
            {error && (
              <div className="p-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
                {message}
              </div>
            )}
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-600 font-semibold">{t('emailLabel')}</Label>
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
                <Label htmlFor="password" title="password" className="text-slate-600 font-semibold">{t('passwordLabel')}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="h-11 border-slate-200"
                />
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <SubmitButton formAction={login} className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-bold">
                  {t('title')}
                </SubmitButton>

                {(error || (message && message.toLowerCase().includes('email'))) && (
                  <Button
                    formAction={resendVerification}
                    variant="link"
                    className="text-xs text-blue-600 font-bold hover:text-blue-700 h-auto p-0"
                  >
                    {t('resendVerification')}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-8 bg-white rounded-b-xl border-t border-slate-50">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-bold tracking-wider">{commonT('secureAndEncrypted')}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Link href="/forgot-password" locale={locale} className="text-sm text-blue-600 hover:underline font-medium">
                {t('forgotPassword')}
              </Link>
              <Link href="/" locale={locale} className="text-sm text-slate-500 hover:underline font-medium">
                {locale === 'en' ? 'View Pricing & Features' : 'Se priser og funksjoner'}
              </Link>
              <div className="text-sm text-slate-600 pt-2">
                {t('noAccount')}{' '}
                <Link href="/signup" locale={locale} className="text-blue-600 hover:underline font-bold">
                  {t('signupLink')}
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="w-full max-w-7xl mx-auto">
        <PublicFooter />
      </div>
    </div>
  )
}
