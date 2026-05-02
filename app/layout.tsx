import { Figtree } from "next/font/google";
import "./globals.css";
import Header from "@/components/reusable/header";
import PageWrapper from "@/components/ui/wrapper";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { QueryProvider } from "@/components/services/reactQuery";
import { LanguageProvider } from "@/components/localeButtons/LanguageProvider";
import { ThemeProvider } from "@/components/theme/themeContext";
import { UserAuthProvider } from "@/components/api/user";
import { AuthGuard } from "@/components/api/authguard";
import { Toaster } from "sonner";
import { AxiosInterceptorSetup } from "@/components/api";
import Analytics from "@/components/static/analytics";
import Footer from "@/components/reusable/footer";
import type { Metadata } from "next";
import Script from "next/script";
import { BotIdClient } from "botid/client";
import { cloudflareImageUrl } from "@/components/api/path";
import { getUserLocale } from "@/services/locale";
import { defaultLocale, locales } from "@/i18n/config";

const inter = Figtree({ subsets: ["latin"] });
const isDev = process.env.NEXT_PUBLIC_NODE_ENV === "development";
const baseUrl = process.env.NEXT_PUBLIC_ORION_URL || "https://orion.aiwork.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Orion Insights | Equity Research & Stock Analysis Platform",
    template: "%s | Orion Insights",
  },
  description: "Access professional-grade equity research, stock analysis, and thematic investment reports across global markets. Generate structured insights with AI-powered workflows.",
  keywords: ["Orion Insights", "Stock Market", "Finance", "Analytics", "Unbiased Equity Research"],
  authors: [{ name: "AI Work" }],
  openGraph: {
    title: "Orion Insights | Equity Research & Stock Analysis Platform",
    description: "Access professional-grade equity research, stock analysis, and thematic investment reports across global markets. Generate structured insights with AI-powered workflows.",
    url: baseUrl,
    siteName: "Orion Insights",
    images: [
      {
        url: `/OI-logo.png`,
        width: 1200,
        height: 630,
        alt: "Orion Insights | Equity Research & Stock Analysis Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@aiwork",
    title: "Orion Insights | Equity Research & Stock Analysis Platform",
    description: "Access professional-grade equity research, stock analysis, and thematic investment reports across global markets. Generate structured insights with AI-powered workflows.",
    images: [`/OI-logo.png`],
  },
};

const protectedRoutes = [
  { path: "/auth/register", method: "POST" },
  { path: "/auth/login", method: "POST" },
  { path: "/orion-insight/watchlists/", method: "POST" },
  { path: "/report/create", method: "POST" },
  { path: "/report/delete/*", method: "POST" },
  { path: "/api/my-reports", method: "POST" },
  { path: "/report/cost", method: "POST" },
  { path: "/ticker-extract", method: "POST" },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieLocale = await getUserLocale();
  const normalizedLocale = cookieLocale === "zh" ? "zh-CN" : cookieLocale;
  const locale = locales.includes(normalizedLocale as (typeof locales)[number]) ? normalizedLocale : defaultLocale;

  let messages = {};
  try {
    messages = await getMessages({ locale });
  } catch {
    console.warn(`⚠️ Missing translation messages for locale: ${locale}`);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Orion Insights",
    url: baseUrl,
    publisher: {
      "@type": "Organization",
      name: "AI Work",
    },
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <BotIdClient protect={protectedRoutes} />
        {isDev && <meta name="robots" content="noindex, nofollow" />}
        <link rel="preconnect" href="https://cdn.aiwork.app" />
        <link rel="preconnect" href="https://api-orion.aiwork.app" />
        <link rel="icon" type="image/svg" sizes="32x32" href="/OI.svg" />
        <link rel="icon" type="image/svg" sizes="180x180" href="/OI.svg" />
        <link rel="icon" type="image/svg" sizes="16x16" href="/OI.svg" />
        <link rel="manifest" href="/favicon/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/favicon/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${inter.className} min-h-screen overflow-auto`}>
        <Script id="json-ld" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <AxiosInterceptorSetup />
            <LanguageProvider>
              <ThemeProvider>
                <UserAuthProvider>
                  <Analytics />
                  <AuthGuard>
                    <div className="flex min-h-screen flex-col">
                      <Header />
                      <main className="flex-1">
                        <PageWrapper>{children}</PageWrapper>
                      </main>
                      <Footer />
                    </div>
                  </AuthGuard>
                </UserAuthProvider>
                <Toaster position="top-right" richColors closeButton />
              </ThemeProvider>
            </LanguageProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
