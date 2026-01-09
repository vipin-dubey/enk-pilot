import { getTranslations } from 'next-intl/server'
import { LandingPage } from '@/components/landing-page'
import { Metadata } from 'next'
import { locales } from '@/i18n'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'landing.metadata' })
  const baseUrl = 'https://enkpilot.com'
  const currentPath = locale === 'nb' ? '' : `/${locale}`

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${baseUrl}${currentPath}`,
      languages: {
        'en': `${baseUrl}/en`,
        'nb': `${baseUrl}`,
        'x-default': `${baseUrl}`
      }
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}${currentPath}`,
      siteName: 'ENK Pilot',
      locale: locale === 'en' ? 'en_US' : 'nb_NO',
      type: 'website',
      images: [
        {
          url: '/logo-square.png',
          width: 1200,
          height: 630,
          alt: 'ENK Pilot - Smart Tax Management',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/logo-square.png'],
      creator: '@enkpilot',
    },
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const tMetadata = await getTranslations('landing.metadata')
  const landingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ENK Pilot',
    description: tMetadata('description'),
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NOK',
    },
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landingJsonLd) }}
      />
      <LandingPage locale={locale} />
    </div>
  )
}
