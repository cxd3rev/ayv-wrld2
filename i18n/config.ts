export const locales = ["en", "fr", "de", "nl"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export const LOCALE_COOKIE = "ayv_locale";

export const localeNames: Record<AppLocale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  nl: "Nederlands",
};

export function isLocale(value: string | undefined | null): value is AppLocale {
  return Boolean(value && locales.includes(value as AppLocale));
}

export function resolveLocale(value: string | undefined | null): AppLocale {
  return isLocale(value) ? value : defaultLocale;
}
