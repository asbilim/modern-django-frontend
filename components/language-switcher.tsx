"use client";

import { usePathname, useRouter } from "@/i18n/routing/navigation";
import { useLocale } from "next-intl";

const locales = ["en", "de", "fr"] as const;

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value;
    router.push(pathname, { locale });
  };

  return (
    <select
      onChange={handleChange}
      value={currentLocale}
      className="border rounded px-2 py-1 text-sm bg-background">
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
