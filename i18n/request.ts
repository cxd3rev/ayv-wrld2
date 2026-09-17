import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import de from "../messages/de.json";
import en from "../messages/en.json";
import fr from "../messages/fr.json";
import nl from "../messages/nl.json";
import { LOCALE_COOKIE, type AppLocale, resolveLocale } from "./config";

const catalogs: Record<AppLocale, typeof en> = {
  en,
  fr,
  de,
  nl,
};

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = resolveLocale(store.get(LOCALE_COOKIE)?.value);

  return {
    locale,
    messages: catalogs[locale],
  };
});
