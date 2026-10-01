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

const legacyCopy = /Avyro|Velto|Rovyn|Orvyn|Nexro|Ravelo|Starter|Growth|Full stack|€39|€79|€149|14 dagen|geen kaart/;

function withoutLegacyCopy(value: unknown): unknown {
  if (typeof value === "string") return legacyCopy.test(value) ? "" : value;
  if (Array.isArray(value)) return value.map(withoutLegacyCopy);
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      if (legacyCopy.test(key)) continue;
      next[key] = withoutLegacyCopy(child);
    }
    return next;
  }
  return value;
}

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = legacyModulesEnabled ? resolveLocale(store.get(LOCALE_COOKIE)?.value) : "nl";
  const messages = legacyModulesEnabled ? catalogs[locale] : withoutLegacyCopy(catalogs.nl);

  return {
    locale,
    messages: messages as (typeof catalogs)[AppLocale],
  };
});
