/**
 * Dynamic Sitemap Generation
 * Automatically generates sitemap.xml for SEO
 */

import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://zzik.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/map`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
  
  try {
    // Dynamic place pages
    const places = await prisma.place.findMany({
      where: { isActive: true },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 1000, // Limit to prevent massive sitemaps
    });
    
    const placeSitemaps: MetadataRoute.Sitemap = places.map((place) => ({
      url: `${BASE_URL}/places/${place.id}`,
      lastModified: place.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
    
    return [...staticPages, ...placeSitemaps];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages if database query fails
    return staticPages;
  }
}
