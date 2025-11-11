import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL('https://zzik.app'),
  title: {
    default: "ZZIK — Location Discovery & Rewards Platform",
    template: "%s | ZZIK",
  },
  description: "Discover local businesses and earn crypto rewards. Pokemon GO + Xiaohongshu for real-world exploration with GPS verification and USDC rewards.",
  keywords: [
    "location discovery",
    "crypto rewards",
    "USDC",
    "local business",
    "GPS verification",
    "check-in rewards",
    "web3",
    "blockchain",
    "location-based",
    "social discovery",
  ],
  authors: [{ name: "ZZIK Team" }],
  creator: "ZZIK Platform",
  publisher: "ZZIK Inc.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    alternateLocale: ["zh_CN", "ja_JP"],
    url: "https://zzik.app",
    siteName: "ZZIK",
    title: "ZZIK — Location Discovery & Rewards",
    description: "Discover local businesses and earn crypto rewards with GPS-verified check-ins",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZZIK Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZZIK — Location Discovery & Rewards",
    description: "Discover local businesses and earn crypto rewards",
    images: ["/og-image.png"],
    creator: "@zzik_app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

// This is the root layout that delegates to locale-specific layouts
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
