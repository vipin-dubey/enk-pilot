export const locales = ['en', 'nb'] as const;
export const defaultLocale = 'nb' as const;

export type Locale = (typeof locales)[number];
