import { locales } from '@/i18n';
import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const host = (await headers()).get('host') || 'enkpilot.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';

    const routes = ['', '/login', '/signup', '/terms', '/privacy'];

    const sitemap: MetadataRoute.Sitemap = [];

    for (const locale of locales) {
        const localePrefix = locale === 'nb' ? '' : `/${locale}`
        for (const route of routes) {
            sitemap.push({
                url: `${protocol}://${host}${localePrefix}${route}`,
                lastModified: new Date(),
                changeFrequency: route === '' ? 'daily' : 'monthly',
                priority: route === '' ? 1 : 0.8,
            });
        }
    }

    return sitemap;
}
