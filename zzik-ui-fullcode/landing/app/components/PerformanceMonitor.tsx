'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/web-vitals';

/**
 * Client-side performance monitoring component
 * Initializes Web Vitals and other performance observers
 */
export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring on client-side only
    initPerformanceMonitoring();
    
    // Log page load performance
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        const domReady = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        
        console.log('[Page Load]', {
          loadTime: Math.round(loadTime),
          domReady: Math.round(domReady),
          type: navigation.type,
        });
      }
    }
  }, []);

  // This component doesn't render anything
  return null;
}
