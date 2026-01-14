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
              {locale === 'en' ? 'Last updated: January 14, 2026' : 'Sist oppdatert: 14. januar 2026'}
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
                        ENK Pilot is an <strong>experimental, non-commercial software project</strong> provided for educational and informational purposes only. The service is provided "as-is" and may be changed or discontinued at any time without notice.
                        We are not accountants, tax advisors, or lawyers. You are solely responsible for your own
                        financial decisions and tax compliance.
                      </>
                    ) : (
                      <>
                        ENK Pilot er et <strong>eksperimentelt, ikke-kommersielt programvareprosjekt</strong> levert utelukkende for pedagogiske og informative formål. Tjenesten leveres "som den er" (as-is) og kan endres eller avsluttes når som helst uten forvarsel.
                        Vi er ikke regnskapsførere, skatterådvivere eller jurister. Du har selv det fulle og hele ansvaret for dine
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

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    2. {locale === 'en' ? 'Operator Information' : 'Operatørinformasjon'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    <>
                      ENK Pilot is operated by a <strong>private individual</strong> in their personal capacity. This is a non-commercial, experimental project and does not constitute any form of trade or commercial activity.
                      <br /><br />
                      <strong>Contact Email:</strong> support@enkpilot.com
                    </>
                  ) : (
                    <>
                      ENK Pilot drives av en <strong>privatperson</strong> i vedkommendes private kapasitet. Dette er et ikke-kommersielt, eksperimentelt prosjekt og utgjør ikke noen form for handel eller kommersiell aktivitet.
                      <br /><br />
                      <strong>E-post:</strong> support@enkpilot.com
                    </>
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
                    3. {locale === 'en' ? 'Disclaimer of Advice' : 'Ansvarsfraskrivelse for rådgivning'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'All content and calculations in ENK Pilot are intended for information and guidance only. The service does not provide legal, tax, accounting, or financial advice. While we strive for accuracy, laws and regulations can change quickly. You are strongly encouraged to verify all data and calculations with a certified accountant or directly with the Tax Administration (Skatteetaten) before submitting reports or making payments.'
                  ) : (
                    'Alt innhold og alle beregninger i ENK Pilot er kun ment som informasjon og veiledning. Tjenesten gir ikke juridisk, skattemessig, regnskapsmessig eller økonomisk rådgivning. Selv om vi streber etter nøyaktighet, kan lover og regler endres raskt. Du oppfordres på det sterkeste til å verifisere alle data og beregninger med en autorisert regnskapsfører eller direkte med Skatteetaten før du sender inn meldinger eller foretar betalinger.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    4. {locale === 'en' ? 'Intellectual Property' : 'Immaterialrett'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'All software, content, and materials available through the Service are the property of the operator and are protected by applicable intellectual property laws. You are granted a limited, non-exclusive, revocable license to access and use the Service for personal, non-commercial purposes.'
                  ) : (
                    'All programvare, alt innhold og alt materiale tilgjengelig gjennom Tjenesten tilhører operatøren og er beskyttet av gjeldende lover om immaterialrett. Du får en begrenset, ikke-eksklusiv, tilbakekallelig lisens til å få tilgang til og bruke Tjenesten for personlige, ikke-kommersielle formål.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    5. {locale === 'en' ? 'User Data and Content' : 'Brukerdata og innhold'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'You retain ownership of the data you input into the Service. By using the Service, you grant the operator the right to process this data solely to provide the Service to you. You may request an export of your data at any time before your account is deleted.'
                  ) : (
                    'Du beholder eierskapet til dataene du legger inn i Tjenesten. Ved å bruke Tjenesten gir du operatøren rett til å behandle disse dataene utelukkende for å levere Tjenesten til deg. Du kan be om eksport av dine data når som helst før kontoen din slettes.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Scale className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    6. {locale === 'en' ? 'Limitation of Liability' : 'Ansvarsbegrensning'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'To the maximum extent permitted by applicable law, ENK Pilot and its operator shall under no circumstances be held liable for any direct, indirect, incidental, or consequential loss, tax interest, penalties from authorities, or other financial consequences arising from the use or inability to use the software. Total liability for any claim shall be capped at zero (0 NOK) while the software is provided as a free tool.'
                  ) : (
                    'I den grad det er tillatt etter gjeldende lov, skal ENK Pilot og dets operatør under ingen omstendigheter holdes ansvarlig for direkte, indirekte, tilfeldige tap eller følgetap, skatterenter, gebyrer fra myndigheter eller andre økonomiske konsekvenser som oppstår ved bruk eller manglende evne til å bruke programvaren. Samlet erstatningsansvar for ethvert krav skal være null (0 NOK) så lenge programvaren leveres som et gratis verktøy.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    7. {locale === 'en' ? 'Acceptable Use' : 'Akseptabel bruk'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'You agree to use the Service only for lawful purposes. Prohibited conduct includes, but is not limited to: abusing or misusing the Service, attempting to reverse engineer the software, or using the Service to provide illegal services or evade tax laws.'
                  ) : (
                    'Du samtykker i å bruke Tjenesten kun til lovlige formål. Forbudt oppførsel inkluderer, men er ikke begrenset til: misbruk av Tjenesten, forsøk på å dekode (reverse engineer) programvaren, eller bruk av Tjenesten for å levere ulovlige tjenester eller unndra skatt.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    8. {locale === 'en' ? 'User Responsibility' : 'Brukerens ansvar'}
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
                    9. {locale === 'en' ? 'Third-Party Services' : 'Tredjepartstjenester'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'We use third parties such as Stripe/Lemon Squeezy for payments, Supabase for data storage, and Posthog for analysis. The operator disclaims responsibility for the content, privacy policies, or practices of any third-party services. By using the service, you also agree to the terms of these providers.'
                  ) : (
                    'Vi benytter tredjeparter som Stripe/Lemon Squeezy for betalinger, Supabase for datalagring og Posthog for analyse. Operatøren fraskriver seg ethvert ansvar for innholdet, personvernreglene eller praksisen til tredjepartstjenester. Ved å bruke tjenesten godtar du også vilkårene til disse leverandørene.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    10. {locale === 'en' ? 'Subscriptions & Billing' : 'Abonnement og fakturering'}
                  </h2>
                </div>
                <div className="text-sm font-medium leading-relaxed space-y-2">
                  <p>
                    {locale === 'en'
                      ? 'This software is provided free of charge as a non-commercial, experimental project. There are no costs associated with using this tool.'
                      : 'Denne programvaren leveres gratis som et ikke-kommersielt, eksperimentelt prosjekt. Det er ingen kostnader forbundet med å bruke dette verktøyet.'}
                  </p>
                </div>
              </section>

              <section className="space-y-4" id="refund-policy">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    11. {locale === 'en' ? 'Refund & Cancellation Policy' : 'Refusjon og kansellering'}
                  </h2>
                </div>
                <div className="text-sm font-medium leading-relaxed space-y-4">
                  <p>
                    {locale === 'en'
                      ? 'As the Service is provided free of charge, no refund or cancellation policies apply. Users may stop using the Service and delete their account at any time without further obligation.'
                      : 'Siden Tjenesten leveres gratis, gjelder ingen regler for refusjon eller kansellering. Brukere kan slutte å bruke Tjenesten og slette kontoen sin når som helst uten ytterligere forpliktelser.'}
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    12. {locale === 'en' ? 'Termination and Changes' : 'Avslutning og endringer'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    'The operator reserves the right to modify, suspend, or terminate the Service at any time without notice. Access may be revoked for any reason, including suspected breach of these terms. Upon termination, the right to access the Service ceases immediately.'
                  ) : (
                    'Operatøren forbeholder seg retten til å endre, suspendere eller avslutte Tjenesten når som helst uten forvarsel. Tilgang kan trekkes tilbake av enhver grunn, inkludert mistanke om brudd på disse vilkårene. Ved avslutning opphører retten til å bruke Tjenesten umiddelbart.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    13. {locale === 'en' ? 'Privacy and GDPR' : 'Personvern og GDPR'}
                  </h2>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {locale === 'en' ? (
                    <>
                      Your privacy is important. Personal data is processed in accordance with our{' '}
                      <Link href="/privacy" locale={locale} className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>{' '}
                      and EU GDPR regulations. You have the right to access, rectify, or delete your personal data as described in the policy.
                    </>
                  ) : (
                    <>
                      Ditt personvern er viktig. Personopplysninger behandles i samsvar med vår{' '}
                      <Link href="/privacy" locale={locale} className="text-blue-600 hover:underline">
                        personvernerklæring
                      </Link>{' '}
                      og EUs GDPR-forordning. Du har rett til innsyn, rettelse eller sletting av dine personopplysninger som beskrevet i erklæringen.
                    </>
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 font-outfit m-0">
                    14. {locale === 'en' ? 'Contact Information' : 'Kontaktinformasjon'}
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
                    15. {locale === 'en' ? 'Governing Law' : 'Lovvalg og verneting'}
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
