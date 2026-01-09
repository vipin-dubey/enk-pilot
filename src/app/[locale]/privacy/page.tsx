import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Link } from '@/navigation'
import { ChevronLeft, ShieldCheck, Eye, Database, Globe, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PublicFooter } from '@/components/layout/footer'

export default async function PrivacyPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('legal')
  const tCommon = await getTranslations('common')

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" locale={locale}>
          <Button variant="ghost" size="sm" className="mb-8 gap-2 text-slate-500 hover:text-blue-600 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            {tCommon('backToDashboard')}
          </Button>
        </Link>

        <Card className="border-none shadow-premium overflow-hidden">
          <div className="bg-emerald-500 h-2 w-full" />
          <CardHeader className="bg-white pb-8 pt-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black uppercase tracking-tighter text-slate-900 font-outfit">
              {locale === 'en' ? 'Privacy Policy' : 'Personvernserklæring'}
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium pt-2 uppercase tracking-widest text-[10px]">
              {locale === 'en' ? 'Last updated: January 8, 2026' : 'Sist oppdatert: 8. januar 2026'}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none p-8 sm:p-12 bg-white">
            <div className="space-y-8 text-slate-600">
              <section className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex gap-4 items-start">
                <Lock className="h-6 w-6 text-emerald-600 shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="text-slate-900 font-bold m-0 p-0 leading-none">
                    {locale === 'en' ? 'Privacy First' : 'Personvern først'}
                  </h3>
                  <p className="text-sm m-0 p-0 leading-relaxed font-medium">
                    {locale === 'en' ? (
                      'We build ENK Pilot with privacy at its core. Your most sensitive data (like PDF content) never leaves your device.'
                    ) : (
                      'Vi bygger ENK Pilot med personvern i kjernen. De mest sensitive dataene dine (som innhold i PDF-er) forlater aldri din enhet.'
                    )}
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    1. {locale === 'en' ? 'What data do we collect?' : 'Hvilke data samler vi inn?'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? 'We only collect information necessary to deliver the service:' : 'Vi samler kun inn informasjon som er nødvendig for å levere tjenesten:'}
                </p>
                <ul className="text-sm font-medium space-y-2 list-disc pl-5 uppercase tracking-tight">
                  <li>{locale === 'en' ? 'Email address (for login and notifications)' : 'E-postadresse (for innlogging og varsler)'}</li>
                  <li>{locale === 'en' ? 'Tax rate and financial totals that you enter yourself' : 'Skattesats og økonomiske summer som du selv legger inn'}</li>
                  <li>{locale === 'en' ? 'Receipt images and vouchers (for storage and export, unless you opt out)' : 'Kvitteringsbilder og bilag (for lagring og eksport, dersom du ikke velger det bort)'}</li>
                  <li>{locale === 'en' ? 'Payment information (handled by third parties – we never see your card details)' : 'Betalingsinformasjon (håndteres av tredjepart – vi ser aldri dine kortdetaljer)'}</li>
                </ul>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    2. {locale === 'en' ? 'Local AI and PDF Processing' : 'Lokal AI og PDF-behandling'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'When you scan a tax card or a receipt with our AI feature, all image and text recognition happens locally in your browser. The file itself is never sent to our servers for analysis, and we do not store the full content of your documents (such as SSN or birth date) unless you explicitly choose to save an image of a receipt.'
                  ) : (
                    'Når du skanner et skattekort eller en kvittering med vår AI-funksjon, skjer all bilde- og tekstgjenkjenning lokalt i din nettleser. Selve filen sendes aldri til våre servere for analyse, og vi lagrer ikke det fulle innholdet i dokumentene dine (som personnummer eller fødselsdato) med mindre du eksplisitt velger å lagre et bilde av en kvittering.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    3. {locale === 'en' ? 'Where is the data stored?' : 'Hvor lagres dataene?'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'We use Supabase (part of Vercel/AWS infrastructure) for data storage. All data is stored on servers within the EU to ensure compliance with GDPR.'
                  ) : (
                    'Vi benytter Supabase (del av Vercel-infrastruktur) for lagring av data. Alle data lagres på servere innenfor EU for å sikre samsvar med GDPR.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    4. {locale === 'en' ? 'Third-Party Providers' : 'Tredjepartsleverandører'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? 'To run technical functions, we use:' : 'For å drive tekniske funksjoner bruker vi:'}
                </p>
                <ul className="text-sm font-medium space-y-2 list-disc pl-5">
                  <li><strong>Resend</strong>: {locale === 'en' ? 'Sending email notifications.' : 'Utsendelse av e-postvarsler.'}</li>
                  <li><strong>Posthog</strong>: {locale === 'en' ? 'Anonymized usage statistics to improve the service.' : 'Anonymisert bruksstatistikk for å forbedre tjenesten.'}</li>
                  <li><strong>Stripe / Lemon Squeezy</strong>: {locale === 'en' ? 'Subscription and payment handling.' : 'Håndtering av abonnement og betaling.'}</li>
                  <li><strong>Google Analytics</strong>: {locale === 'en' ? 'Potentially for marketing analysis (if you have accepted cookies).' : 'Eventuelt for markedsføringsanalyse (dersom du har godtatt cookies).'}</li>
                </ul>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    5. {locale === 'en' ? 'Your Rights (GDPR)' : 'Dine rettigheter (GDPR)'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'You have the right to access your own personal data, the right to demand correction or deletion, and the right to data portability. You can delete your account and all associated data at any time via the settings in the app.'
                  ) : (
                    'Du har rett til innsyn i egne personopplysninger, rett til å kreve rettelse eller sletting, og rett til dataportabilitet. Du kan når som helst slette din konto og alle tilhørende data via innstillinger i appen.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    6. {locale === 'en' ? 'Data Retention & Deletion' : 'Lagringstid og sletting'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? 'We retain your data only for as long as necessary to provide our services:' : 'Vi oppbevarer dine data kun så lenge det er nødvendig for å levere tjenesten:'}
                </p>
                <ul className="text-sm font-medium space-y-2 list-disc pl-5">
                  <li>
                    <strong>{locale === 'en' ? 'Account Deletion' : 'Sletting av konto'}:</strong>{' '}
                    {locale === 'en'
                      ? 'If you request account deletion, all your personal data and uploaded receipts will be permanently deleted from our primary databases within 48 hours.'
                      : 'Hvis du ber om sletting av konto, vil alle dine personopplysninger og opplastede kvitteringer bli permanent slettet fra våre primærdatabaser innen 48 timer.'}
                  </li>
                  <li>
                    <strong>{locale === 'en' ? 'Inactivity' : 'Inaktivitet'}:</strong>{' '}
                    {locale === 'en'
                      ? 'Accounts inactive for more than 3 years may be marked for deletion. We will notify you via email before this happens.'
                      : 'Kontoer inaktive i mer enn 3 år kan bli slettet. Vi varsler deg via e-post før dette skjer.'}
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit border-b border-slate-100 pb-2">
                  7. {locale === 'en' ? 'Cookies & Opt-out' : 'Cookies og reservasjon'}
                </h2>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'We use necessary cookies for login and security. You can choose to opt out of analytical cookies at any time via our cookie banner. Kjernefunksjonaliteten vil fortsatt fungere uten disse.'
                  ) : (
                    'Vi bruker nødvendige cookies for innlogging og sikkerhet. Du kan når som helst velge å takke nei til analytiske cookies via vårt cookie-banner. Kjernefunksjonaliteten vil fortsatt fungere uten disse.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit border-b border-slate-100 pb-2">
                  8. {locale === 'en' ? 'Contact Information' : 'Kontaktinformasjon'}
                </h2>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    <>
                      If you have any questions about this privacy policy, please contact us at{' '}
                      <a
                        href="mailto:support@enkpilot.com"
                        className="text-blue-600 hover:underline inline-block"
                      >
                        support@enkpilot.com
                      </a>.
                    </>
                  ) : (
                    <>
                      Hvis du har spørsmål om denne personvernserklæringen, vennligst kontakt oss på{' '}
                      <a
                        href="mailto:support@enkpilot.com"
                        className="text-blue-600 hover:underline inline-block"
                      >
                        support@enkpilot.com
                      </a>.
                    </>
                  )}
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
        <PublicFooter />
      </div>
    </div>
  )
}
