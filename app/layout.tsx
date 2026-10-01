import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { ToastProvider } from "@/components/ui/toast";
import { ayvBrand } from "@/config/brands";
import { PRODUCT_NAME, PRODUCT_TAGLINE, PRODUCT_URL } from "@/config/site";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin", "latin-ext"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(PRODUCT_URL),
    title: {
      default: PRODUCT_NAME,
      template: `%s · ${PRODUCT_NAME}`,
    },
    description: PRODUCT_TAGLINE,
    applicationName: PRODUCT_NAME,
    icons: {
      icon: "/icon.png",
      apple: "/apple-icon.png",
    },
    openGraph: {
      siteName: PRODUCT_NAME,
      title: PRODUCT_NAME,
      description: PRODUCT_TAGLINE,
      url: "/",
      type: "website",
      images: [{ url: ayvBrand.logo, width: 512, height: 512, alt: PRODUCT_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: PRODUCT_NAME,
      description: PRODUCT_TAGLINE,
      images: [ayvBrand.logo],
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <NextIntlClientProvider>
          <ToastProvider>{children}</ToastProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
