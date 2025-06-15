"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { DefaultLogo } from "@/components/ui/default-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Github, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  const t = useTranslations("Footer");
  const currentYear = new Date().getFullYear();

  const footerNavigation = {
    solutions: [
      { name: t("solutions.admin"), href: "#" },
      { name: t("solutions.analytics"), href: "#" },
      { name: t("solutions.commerce"), href: "#" },
      { name: t("solutions.insights"), href: "#" },
    ],
    support: [
      { name: t("support.docs"), href: "/blog" },
      { name: t("support.pricing"), href: "#" },
      { name: t("support.guides"), href: "#" },
      { name: t("support.api"), href: "#" },
    ],
    company: [
      { name: t("company.about"), href: "/about" },
      { name: t("company.blog"), href: "/blog" },
      { name: t("company.jobs"), href: "#" },
      { name: t("company.partners"), href: "#" },
    ],
    legal: [
      { name: t("legal.privacy"), href: "#" },
      { name: t("legal.terms"), href: "#" },
    ],
    social: [
      {
        name: "GitHub",
        href: "https://github.com",
        icon: (props: React.ComponentProps<typeof Github>) => (
          <Github {...props} />
        ),
      },
      {
        name: "Twitter",
        href: "https://twitter.com",
        icon: (props: React.ComponentProps<typeof Twitter>) => (
          <Twitter {...props} />
        ),
      },
      {
        name: "LinkedIn",
        href: "https://linkedin.com",
        icon: (props: React.ComponentProps<typeof Linkedin>) => (
          <Linkedin {...props} />
        ),
      },
      {
        name: "Instagram",
        href: "https://instagram.com",
        icon: (props: React.ComponentProps<typeof Instagram>) => (
          <Instagram {...props} />
        ),
      },
    ],
  };

  return (
    <footer className="bg-secondary/5 border-t">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-16 sm:py-20 lg:px-8">
        <div className="mb-10 flex justify-center">
          <Link href="/" className="flex items-center">
            <DefaultLogo className="h-8 w-8" />
            <span className="ml-3 text-lg font-bold">{t("siteName")}</span>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div>
            <h3 className="text-sm font-semibold leading-6">
              {t("categories.solutions")}
            </h3>
            <ul className="mt-4 space-y-2">
              {footerNavigation.solutions.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-6">
              {t("categories.support")}
            </h3>
            <ul className="mt-4 space-y-2">
              {footerNavigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-6">
              {t("categories.company")}
            </h3>
            <ul className="mt-4 space-y-2">
              {footerNavigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-6">
              {t("categories.legal")}
            </h3>
            <ul className="mt-4 space-y-2">
              {footerNavigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold leading-6 mr-2">
                {t("categories.language")}
              </h3>
              <LanguageSwitcher />
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-semibold leading-6">
                {t("categories.followUs")}
              </h3>
              <div className="mt-4 flex space-x-4">
                {footerNavigation.social.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground"
                    target="_blank"
                    rel="noopener noreferrer">
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {t("companyName")}. {t("allRightsReserved")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("poweredBy")}{" "}
            <span className="font-medium">Django Modern Admin</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
