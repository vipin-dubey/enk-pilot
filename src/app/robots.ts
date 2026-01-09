import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
    const host = (await headers()).get('host') || 'enkpilot.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard', '/api', '/auth'],
        },
        sitemap: `${protocol}://${host}/sitemap.xml`,
    };
}
