import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Link } from '@/navigation'
import { ChevronLeft, Gavel, ShieldCheck, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PublicFooter } from '@/components/layout/footer'

export default async function TermsPage({
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
          <div className="bg-blue-600 h-2 w-full" />
          <CardHeader className="bg-white pb-8 pt-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Gavel className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black uppercase tracking-tighter text-slate-900 font-outfit">
              {locale === 'en' ? 'Terms of Service' : 'Vilkår for bruk'}
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium pt-2 uppercase tracking-widest text-[10px]">
              {locale === 'en' ? 'Last updated: January 8, 2026' : 'Sist oppdatert: 8. januar 2026'}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none p-8 sm:p-12 bg-white">
            <div className="space-y-8 text-slate-600">
              <section className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex gap-4 items-start">
                <AlertCircle className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="text-slate-900 font-bold m-0 p-0 leading-none">
                    {locale === 'en' ? 'Important Disclaimer' : 'Viktig ansvarsfraskrivelse'}
                  </h3>
                  <p className="text-sm m-0 p-0 leading-relaxed font-medium">
                    {locale === 'en' ? (
                      <>
                        ENK Pilot is an <strong>educational tool</strong> and decision support service. The service is provided "as-is". 
                        We are not accountants, tax advisors, or lawyers. You are solely responsible for your own 
                        financial decisions and tax compliance.
                      </>
                    ) : (
                      <>
                        ENK Pilot er et <strong>pedagogisk verktøy</strong> og en beslutningsstøtte. Tjenesten leveres "som den er" (as-is). 
                        Vi er ikke regnskapsførere, skatterådgivere eller jurister. Du har selv det fulle og hele ansvaret for dine 
                        økonomiske beslutninger og skattekrav.
                      </>
                    )}
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit border-b border-slate-100 pb-2">
                  1. {locale === 'en' ? 'Acceptance of Terms' : 'Godtakelse av vilkår'}
                </h2>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'By creating an account or using ENK Pilot ("the Service"), you agree to be bound by these terms. If you do not agree to the terms, you must immediately stop using the service.'
                  ) : (
                    'Ved å opprette en konto eller bruke ENK Pilot ("Tjenesten"), godtar du å være bundet av disse vilkårene. Hvis du ikke godtar vilkårene, må du umiddelbart slutte å bruke tjenesten.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit border-b border-slate-100 pb-2">
                  2. {locale === 'en' ? 'No Professional Advice' : 'Ingen profesjonell rådgivning'}
                </h2>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'All content and calculations in ENK Pilot are intended for information and guidance only. While we strive for accuracy, laws and regulations can change quickly. You are strongly encouraged to verify all data and calculations with a certified accountant or directly with the Tax Administration (Skatteetaten) before submitting reports or making payments.'
                  ) : (
                    'Alt innhold og alle beregninger i ENK Pilot er kun ment som informasjon og veiledning. Selv om vi streber etter nøyaktighet, kan lover og regler endres raskt. Du oppfordres på det sterkeste til å verifisere alle data og beregninger med en autorisert regnskapsfører eller direkte med Skatteetaten før du sender inn meldinger eller foretar betalinger.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit border-b border-slate-100 pb-2">
                  3. {locale === 'en' ? 'Limitation of Liability' : 'Ansvarsbegrensning'}
                </h2>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'ENK Pilot, its developers, or affiliates shall under no circumstances be held liable for any direct or indirect loss, tax interest, penalties from authorities, or other financial consequences arising from the use or inability to use the service.'
                  ) : (
                    'ENK Pilot, dets utviklere eller tilknyttede selskaper skal under ingen omstendigheter holdes ansvarlig for direkte eller indirekte tap, skatterenter, gebyrer fra myndigheter eller andre økonomiske konsekvenser som oppstår ved bruk eller manglende evne til å bruke tjenesten.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit border-b border-slate-100 pb-2">
                  4. {locale === 'en' ? 'User Responsibility' : 'Brukerens ansvar'}
                </h2>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'As a user, you are responsible for the accuracy of the data you enter (income, expenses, tax rate). You are also responsible for ensuring that your receipts and vouchers are in accordance with the Bookkeeping Act.'
                  ) : (
                    'Som bruker er du ansvarlig for nøyaktigheten av de dataene du legger inn (inntekt, utgifter, skattesats). Du er også ansvarlig for å sikre at dine kvitteringer og bilag er i henhold til bokføringsloven.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit border-b border-slate-100 pb-2">
                  5. {locale === 'en' ? 'Third-Party Services' : 'Tredjepartstjenester'}
                </h2>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'We use third parties such as Stripe/Lemon Squeezy for payments, Supabase for data storage, and Posthog for analysis. By using the service, you also agree to the terms of these providers.'
                  ) : (
                    'Vi benytter tredjeparter som Stripe/Lemon Squeezy for betalinger, Supabase for datalagring og Posthog for analyse. Ved å bruke tjenesten godtar du også vilkårene til disse leverandørene.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit border-b border-slate-100 pb-2">
                  6. {locale === 'en' ? 'Changes to the Service' : 'Endringer i tjenesten'}
                </h2>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'We reserve the right to modify, suspend, or terminate the service at any time without notice. We may also change these terms, and your continued use of the service constitutes your acceptance of the new terms.'
                  ) : (
                    'Vi forbeholder oss retten til å endre, suspendere eller avslutte tjenesten når som helst uten forvarsel. Vi kan også endre disse vilkårene, og din fortsatte bruk av tjenesten utgjør din aksept av de nye vilkårene.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit border-b border-slate-100 pb-2">
                  7. {locale === 'en' ? 'Contact Information' : 'Kontaktinformasjon'}
                </h2>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    <>
                      If you have any questions about these terms, please contact us at{' '}
                      <a href="mailto:support@enkpilot.com" className="text-blue-600 hover:underline">
                        support@enkpilot.com
                      </a>.
                    </>
                  ) : (
                    <>
                      Hvis du har spørsmål om disse vilkårene, vennligst kontakt oss på{' '}
                      <a href="mailto:support@enkpilot.com" className="text-blue-600 hover:underline">
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
