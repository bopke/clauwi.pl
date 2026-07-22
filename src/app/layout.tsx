import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

// Body / UI font — matches the live Kadence site (Montserrat).
const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

// Heading / display font — matches the live site (Cormorant Garamond).
const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const SITE_NAME = "ClauWi®";
const DEFAULT_TITLE = "ClauWi® — Szkoła doradców noszenia";
const DEFAULT_DESCRIPTION =
  "ClauWi® — szkoła kształcąca doradców noszenia. Kursy, certyfikacja, lista aktywnych doradców w Twoim województwie.";

export const metadata: Metadata = {
  metadataBase: new URL("https://clauwi.pl"),
  title: {
    default: DEFAULT_TITLE,
    template: "%s — ClauWi®",
  },
  description: DEFAULT_DESCRIPTION,
  icons: {
    // Same favicon as the original WordPress site (cropped-logo_clauwi).
    icon: [
      { url: "/brand/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/brand/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    locale: "pl_PL",
    type: "website",
    images: [{ url: "/brand/logo-clauwi.png", width: 1431, height: 1446, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/brand/logo-clauwi.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${montserrat.variable} ${cormorant.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
