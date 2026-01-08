import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip intl for auth routes and public assets
  if (pathname.startsWith('/auth') || pathname.startsWith('/api')) {
    return await updateSession(request);
  }

  const response = intlMiddleware(request);
  return await updateSession(request, response);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
