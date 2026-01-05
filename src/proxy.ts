import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

const middleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export default middleware;

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
