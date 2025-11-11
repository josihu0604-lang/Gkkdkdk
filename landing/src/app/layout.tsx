import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'ZZIK — Location Integrity SaaS',
    template: '%s | ZZIK'
  },
  description: 'GPS 무결성 기반 B2B SaaS 플랫폼. 외국인 관광객을 실제 매출로 전환하세요.',
  keywords: ['GPS', 'SaaS', 'B2B', '위치 기반 서비스', '체크인', '리워드'],
  authors: [{ name: 'ZZIK Team' }],
  creator: 'ZZIK',
  publisher: 'ZZIK',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://zzik.com',
    title: 'ZZIK — Location Integrity SaaS',
    description: 'GPS 무결성 기반 B2B SaaS 플랫폼',
    siteName: 'ZZIK',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZZIK — Location Integrity SaaS',
    description: 'GPS 무결성 기반 B2B SaaS 플랫폼',
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
