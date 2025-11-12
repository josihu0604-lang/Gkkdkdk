/**
 * SEO Metadata Generator
 * Creates optimized metadata for pages with Open Graph and Twitter Cards
 */

import { Metadata } from 'next';

const APP_NAME = 'ZZIK';
const APP_DESCRIPTION =
  'Earn USDC rewards by checking in at your favorite places. Powered by Web3 on Base network.';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://zzik.app';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * Default metadata for all pages
 */
export const defaultMetadata: Metadata = {
  title: {
    default: `${APP_NAME} - Earn rewards by exploring`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  authors: [{ name: APP_NAME, url: BASE_URL }],
  generator: 'Next.js',
  keywords: [
    'Web3',
    'USDC',
    'rewards',
    'check-in',
    'crypto',
    'Base network',
    'location-based',
    'earn crypto',
    'vouchers',
  ],
  referrer: 'origin-when-cross-origin',
  creator: APP_NAME,
  publisher: APP_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${APP_NAME} - Earn rewards by exploring`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [OG_IMAGE],
    creator: '@zzikapp', // TODO: Update with actual Twitter handle
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
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

/**
 * Generate metadata for a place page
 */
export function generatePlaceMetadata(place: {
  name: string;
  description?: string | null;
  category: string;
  addressFull: string;
  imageUrl?: string | null;
  averageRating: number;
  totalCheckIns: number;
}): Metadata {
  const title = `${place.name} - ${place.category}`;
  const description =
    place.description ||
    `Check in at ${place.name} and earn USDC rewards. ${place.totalCheckIns} check-ins, ${place.averageRating}★ rating.`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'place',
      locale: 'en_US',
      url: `${BASE_URL}/places/${place.name}`,
      siteName: APP_NAME,
      images: place.imageUrl
        ? [
            {
              url: place.imageUrl,
              width: 1200,
              height: 630,
              alt: place.name,
            },
          ]
        : [{ url: OG_IMAGE }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: place.imageUrl ? [place.imageUrl] : [OG_IMAGE],
    },
    alternates: {
      canonical: `/places/${place.name}`,
    },
  };
}

/**
 * Generate metadata for a user profile page
 */
export function generateUserMetadata(user: {
  username?: string | null;
  displayName?: string | null;
  bio?: string | null;
  level: number;
  totalPoints: number;
  avatarUrl?: string | null;
}): Metadata {
  const name = user.displayName || user.username || 'User';
  const title = `${name} - Level ${user.level}`;
  const description =
    user.bio || `${name} has earned ${user.totalPoints} points on ${APP_NAME}`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      locale: 'en_US',
      url: `${BASE_URL}/users/${user.username}`,
      siteName: APP_NAME,
      images: user.avatarUrl
        ? [
            {
              url: user.avatarUrl,
              width: 400,
              height: 400,
              alt: name,
            },
          ]
        : [{ url: OG_IMAGE }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: user.avatarUrl ? [user.avatarUrl] : [OG_IMAGE],
    },
    alternates: {
      canonical: `/users/${user.username}`,
    },
  };
}

/**
 * Generate JSON-LD structured data for a place
 */
export function generatePlaceJsonLd(place: {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  latitude: number;
  longitude: number;
  addressFull: string;
  imageUrl?: string | null;
  websiteUrl?: string | null;
  phoneNumber?: string | null;
  averageRating: number;
  totalCheckIns: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/places/${place.id}`,
    name: place.name,
    description: place.description || undefined,
    image: place.imageUrl || undefined,
    url: place.websiteUrl || `${BASE_URL}/places/${place.id}`,
    telephone: place.phoneNumber || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: place.addressFull,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: place.latitude,
      longitude: place.longitude,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: place.averageRating,
      reviewCount: place.totalCheckIns,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

/**
 * Generate JSON-LD structured data for breadcrumbs
 */
export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: APP_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: APP_DESCRIPTION,
    sameAs: [
      'https://twitter.com/zzikapp', // TODO: Update with actual social links
      'https://github.com/zzik-app',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@zzik.app',
    },
  };
}

/**
 * Generate JSON-LD structured data for website
 */
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: APP_NAME,
    url: BASE_URL,
    description: APP_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
