import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "de", "fr"],

  // Used when no locale matches
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: true,
});
