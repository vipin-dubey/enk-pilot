import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Link } from '@/navigation'
import { ChevronLeft, Gavel, AlertCircle, Handshake, Info, Scale, User, CreditCard, RefreshCw, Mail, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PublicFooter } from '@/components/layout/footer'
import { ObfuscatedMailto } from '@/components/ui/obfuscated-mailto'

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
                <div className="flex items-center gap-3">
                  <Handshake className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    1. {locale === 'en' ? 'Acceptance of Terms' : 'Godtakelse av vilkår'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'By creating an account or using ENK Pilot ("the Service"), you agree to be bound by these terms. If you do not agree to the terms, you must immediately stop using the service.'
                  ) : (
                    'Ved å opprette en konto eller bruke ENK Pilot ("Tjenesten"), godtar du å være bundet av disse vilkårene. Hvis du ikke godtar vilkårene, må du umiddelbart slutte å bruke tjenesten.'
                  )}
                </p>
              </section>

              {/* ... Other sections omitted for brevity, but I should probably include them to be safe or use what I read ... 
                  Actually I have the full content in Step 1964. I will just paste it all but with the fix.
              */}

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    2. {locale === 'en' ? 'No Professional Advice' : 'Ingen profesjonell rådgivning'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'All content and calculations in ENK Pilot are intended for information and guidance only. While we strive for accuracy, laws and regulations can change quickly. You are strongly encouraged to verify all data and calculations with a certified accountant or directly with the Tax Administration (Skatteetaten) before submitting reports or making payments.'
                  ) : (
                    'Alt innhold og alle beregninger i ENK Pilot er kun ment som informasjon og veiledning. Selv om vi streber etter nøyaktighet, kan lover og regler endres raskt. Du oppfordres på det sterkeste til å verifisere alle data og beregninger med en autorisert regnskapsfører eller direkte med Skatteetaten før du sender inn meldinger eller foretar betalinger.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Scale className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    3. {locale === 'en' ? 'Limitation of Liability' : 'Ansvarsbegrensning'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'ENK Pilot, its developers, or affiliates shall under no circumstances be held liable for any direct or indirect loss, tax interest, penalties from authorities, or other financial consequences arising from the use or inability to use the service.'
                  ) : (
                    'ENK Pilot, dets utviklere eller tilknyttede selskaper skal under ingen omstendigheter holdes ansvarlig for direkte eller indirekte tap, skatterenter, gebyrer fra myndigheter eller andre økonomiske konsekvenser som oppstår ved bruk eller manglende evne til å bruke tjenesten.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    4. {locale === 'en' ? 'User Responsibility' : 'Brukerens ansvar'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'As a user, you are responsible for the accuracy of the data you enter (income, expenses, tax rate). You are also responsible for ensuring that your receipts and vouchers are in accordance with the Bookkeeping Act.'
                  ) : (
                    'Som bruker er du ansvarlig for nøyaktigheten av de dataene du legger inn (inntekt, utgifter, skattesats). Du er også ansvarlig for å sikre at dine kvitteringer og bilag er i henhold til bokføringsloven.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    5. {locale === 'en' ? 'Third-Party Services' : 'Tredjepartstjenester'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'We use third parties such as Stripe/Lemon Squeezy for payments, Supabase for data storage, and Posthog for analysis. By using the service, you also agree to the terms of these providers.'
                  ) : (
                    'Vi benytter tredjeparter som Stripe/Lemon Squeezy for betalinger, Supabase for datalagring og Posthog for analyse. Ved å bruke tjenesten godtar du også vilkårene til disse leverandørene.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    6. {locale === 'en' ? 'Subscriptions & Billing' : 'Abonnement og fakturering'}
                  </h2>
                </div>
                <div className="text-sm font-medium leading-relaxed space-y-2">
                  <p>
                    {locale === 'en'
                      ? 'ENK Pilot offers subscription-based services. By subscribing, you authorize us (via our payment processors) to charge the applicable fees to your designated payment method.'
                      : 'ENK Pilot tilbyr abonnementsbaserte tjenester. Ved å abonnere gir du oss (via våre betalingsformidlere) fullmakt til å belaste gjeldende gebyrer til din valgte betalingsmetode.'}
                  </p>
                  <p>
                    <strong>{locale === 'en' ? 'Automatic Renewal' : 'Automatisk fornyelse'}:</strong>{' '}
                    {locale === 'en'
                      ? 'Subscriptions automatically renew at the end of each billing period unless cancelled at least 24 hours before the renewal date.'
                      : 'Abonnementer fornyes automatisk ved slutten av hver faktureringsperiode med mindre de kanselleres minst 24 timer før fornyelsesdatoen.'}
                  </p>
                </div>
              </section>

              <section className="space-y-4" id="refund-policy">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    7. {locale === 'en' ? 'Refund & Cancellation Policy' : 'Refusjon og kansellering'}
                  </h2>
                </div>
                <div className="text-sm font-medium leading-relaxed space-y-2">
                  <p>
                    <strong>{locale === 'en' ? 'Free Trial' : 'Gratis prøveperiode'}:</strong>{' '}
                    {locale === 'en'
                      ? 'All new subscriptions include a 1-month free trial period. You will not be charged during this trial, allowing you to fully evaluate the service before any payment is required.'
                      : 'Alle nye abonnementer inkluderer en 1 måneds gratis prøveperiode. Du vil ikke bli belastet i løpet av denne prøveperioden, slik at du kan evaluere tjenesten fullt ut før betaling kreves.'}
                  </p>
                  <p>
                    <strong>{locale === 'en' ? 'Cancellation' : 'Kansellering'}:</strong>{' '}
                    {locale === 'en'
                      ? 'You can cancel your subscription at any time through your account settings. Upon cancellation, you will retain access to Pro features until the end of your current billing period. No refunds will be issued for partial billing periods.'
                      : 'Du kan når som helst kansellere abonnementet ditt via kontoinnstillingene. Ved kansellering vil du beholde tilgangen til Pro-funksjoner frem til slutten av din nåværende faktureringsperiode. Ingen refusjon gis for delvise faktureringsperioder.'}
                  </p>
                  <p>
                    <strong>{locale === 'en' ? 'Refund Policy' : 'Refusjonspolicy'}:</strong>{' '}
                    {locale === 'en'
                      ? 'Refunds may be issued within 14 days of payment in exceptional circumstances, including: (a) technical issues preventing access to the service that we are unable to resolve, (b) duplicate or erroneous charges, or (c) charges made after subscription cancellation due to system errors. Refund requests must be submitted via email to support@enkpilot.com with a detailed explanation.'
                      : 'Refusjon kan gis innen 14 dager etter betaling under spesielle omstendigheter, inkludert: (a) tekniske problemer som hindrer tilgang til tjenesten som vi ikke kan løse, (b) dupliserte eller feilaktige belastninger, eller (c) belastninger etter abonnementskansellering på grunn av systemfeil. Refusjonsforespørsler må sendes via e-post til support@enkpilot.com med en detaljert forklaring.'}
                  </p>
                  <p>
                    <strong>{locale === 'en' ? 'No Refunds For' : 'Ingen refusjon for'}:</strong>{' '}
                    {locale === 'en'
                      ? 'Refunds will not be issued for: change of mind, dissatisfaction with features after the trial period, failure to cancel before renewal, or unused portions of a subscription period.'
                      : 'Refusjon gis ikke for: ombestemmelse, misnøye med funksjoner etter prøveperioden, manglende kansellering før fornyelse, eller ubrukte deler av en abonnementsperiode.'}
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    8. {locale === 'en' ? 'Changes to the Service' : 'Endringer i tjenesten'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'We reserve the right to modify, suspend, or terminate the service at any time without notice. We may also change these terms, and your continued use of the service constitutes your acceptance of the new terms.'
                  ) : (
                    'Vi forbeholder oss retten til å endre, suspendere eller avslutte tjenesten når som helst uten forvarsel. Vi kan også endre disse vilkårene, og din fortsatte bruk av tjenesten utgjør din aksept av de nye vilkårene.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    9. {locale === 'en' ? 'Contact Information' : 'Kontaktinformasjon'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    <>
                      If you have any questions about these terms, please contact us at{' '}
                      <ObfuscatedMailto
                        email="support@enkpilot.com"
                        className="text-blue-600 hover:underline inline-block"
                      >
                        support@enkpilot.com
                      </ObfuscatedMailto>.
                    </>
                  ) : (
                    <>
                      Hvis du har spørsmål om disse vilkårene, vennligst kontakt oss på{' '}
                      <ObfuscatedMailto
                        email="support@enkpilot.com"
                        className="text-blue-600 hover:underline inline-block"
                      >
                        support@enkpilot.com
                      </ObfuscatedMailto>.
                    </>
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Scale className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    10. {locale === 'en' ? 'Governing Law' : 'Lovvalg og verneting'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en'
                    ? 'These terms are governed by and construed in accordance with the laws of Norway. Any disputes shall be subject to the exclusive jurisdiction of the courts of Norway.'
                    : 'Disse vilkårene er underlagt og tolkes i samsvar med norsk lov. Eventuelle tvister skal være underlagt norske domstolers eksklusive jurisdiksjon.'}
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
