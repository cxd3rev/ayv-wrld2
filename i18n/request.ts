import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import de from "../messages/de.json";
import en from "../messages/en.json";
import fr from "../messages/fr.json";
import nl from "../messages/nl.json";
import { legacyModulesEnabled } from "@/config/features";
import { LOCALE_COOKIE, type AppLocale, resolveLocale } from "./config";

const catalogs: Record<AppLocale, typeof en> = {
  en,
  fr,
  de,
  nl,
};

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = legacyModulesEnabled ? resolveLocale(store.get(LOCALE_COOKIE)?.value) : "nl";

  return {
    locale,
    messages: catalogs[locale],
  };
});
