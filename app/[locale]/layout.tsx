import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/toaster";
import { dashboardConfig } from "@/lib/config";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <title>{dashboardConfig.name}</title>
        <meta name="description" content={dashboardConfig.description} />
        <link rel="icon" href={dashboardConfig.favicon} />
      </head>
      <body className={inter.className}>
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
