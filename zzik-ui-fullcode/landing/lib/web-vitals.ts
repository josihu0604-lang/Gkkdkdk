/**
 * Web Vitals Performance Monitoring
 * 
 * Tracks Core Web Vitals:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FID (First Input Delay) - Interactivity
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - TTFB (Time to First Byte) - Server responsiveness
 * - FCP (First Contentful Paint) - Perceived load speed
 * - INP (Interaction to Next Paint) - Responsiveness
 */

export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

/**
 * Rating thresholds based on Google's recommendations
 */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },      // milliseconds
  FID: { good: 100, poor: 300 },        // milliseconds
  CLS: { good: 0.1, poor: 0.25 },       // score
  TTFB: { good: 800, poor: 1800 },      // milliseconds
  FCP: { good: 1800, poor: 3000 },      // milliseconds
  INP: { good: 200, poor: 500 },        // milliseconds
};

/**
 * Calculate rating from value and thresholds
 */
function getRating(
  name: WebVitalsMetric['name'],
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) {
    return 'good';
  }
  if (value <= threshold.poor) {
    return 'needs-improvement';
  }
  return 'poor';
}

/**
 * Send metric to analytics endpoint
 */
async function sendToAnalytics(metric: WebVitalsMetric): Promise<void> {
  try {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', {
        name: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
        id: metric.id,
      });
      return;
    }

    // Send to analytics endpoint
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });

    // Use sendBeacon for reliability (survives page unload)
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/web-vitals', body);
    } else {
      // Fallback to fetch
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch((error) => {
        console.error('Failed to send web vitals:', error);
      });
    }
  } catch (error) {
    console.error('Error sending web vitals:', error);
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals(): void {
  if (typeof window === 'undefined') {
    return; // Server-side, skip
  }

  // Dynamically import web-vitals library
  import('web-vitals')
    .then((webVitals) => {
      // Cumulative Layout Shift
      if (webVitals.onCLS) {
        webVitals.onCLS((metric) => {
          sendToAnalytics({
            ...metric,
            rating: getRating('CLS', metric.value),
          } as WebVitalsMetric);
        });
      }

      // First Input Delay (deprecated in web-vitals v3, use INP instead)
      if (webVitals.onFID) {
        webVitals.onFID((metric) => {
          sendToAnalytics({
            ...metric,
            rating: getRating('FID', metric.value),
          } as WebVitalsMetric);
        });
      }

      // First Contentful Paint
      if (webVitals.onFCP) {
        webVitals.onFCP((metric) => {
          sendToAnalytics({
            ...metric,
            rating: getRating('FCP', metric.value),
          } as WebVitalsMetric);
        });
      }

      // Largest Contentful Paint
      if (webVitals.onLCP) {
        webVitals.onLCP((metric) => {
          sendToAnalytics({
            ...metric,
            rating: getRating('LCP', metric.value),
          } as WebVitalsMetric);
        });
      }

      // Time to First Byte
      if (webVitals.onTTFB) {
        webVitals.onTTFB((metric) => {
          sendToAnalytics({
            ...metric,
            rating: getRating('TTFB', metric.value),
          } as WebVitalsMetric);
        });
      }

      // Interaction to Next Paint
      if (webVitals.onINP) {
        webVitals.onINP((metric) => {
          sendToAnalytics({
            ...metric,
            rating: getRating('INP', metric.value),
          } as WebVitalsMetric);
        });
      }

      console.log('[Web Vitals] Monitoring initialized');
    })
    .catch((error) => {
      console.error('Failed to load web-vitals library:', error);
    });
}

/**
 * Custom performance mark
 */
export function performanceMark(name: string): void {
  if (typeof window !== 'undefined' && window.performance && window.performance.mark) {
    window.performance.mark(name);
  }
}

/**
 * Custom performance measure
 */
export function performanceMeasure(
  name: string,
  startMark: string,
  endMark: string
): number | null {
  if (typeof window !== 'undefined' && window.performance && window.performance.measure) {
    try {
      window.performance.measure(name, startMark, endMark);
      const entries = window.performance.getEntriesByName(name);
      if (entries.length > 0) {
        const duration = entries[entries.length - 1].duration;
        
        // Log in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Performance] ${name}: ${Math.round(duration)}ms`);
        }
        
        return duration;
      }
    } catch (error) {
      console.error('Performance measure failed:', error);
    }
  }
  return null;
}

/**
 * Long Task Observer
 * Detects tasks that block the main thread for > 50ms
 */
export function observeLongTasks(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Log long tasks (> 50ms)
          if (entry.duration > 50) {
            console.warn('[Long Task]', {
              duration: Math.round(entry.duration),
              startTime: Math.round(entry.startTime),
              name: entry.name,
            });

            // Send to analytics in production
            if (process.env.NODE_ENV === 'production') {
              fetch('/api/analytics/long-tasks', {
                method: 'POST',
                body: JSON.stringify({
                  duration: entry.duration,
                  startTime: entry.startTime,
                  name: entry.name,
                  url: window.location.href,
                  timestamp: Date.now(),
                }),
                headers: { 'Content-Type': 'application/json' },
                keepalive: true,
              }).catch(() => {
                // Ignore errors
              });
            }
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
      console.log('[Long Tasks] Observer initialized');
    } catch (error) {
      console.error('Failed to initialize Long Task observer:', error);
    }
  }
}

/**
 * Resource timing observer
 * Tracks slow resources (images, scripts, etc.)
 */
export function observeResourceTiming(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          
          // Flag slow resources (> 1s)
          if (resource.duration > 1000) {
            console.warn('[Slow Resource]', {
              name: resource.name,
              duration: Math.round(resource.duration),
              type: resource.initiatorType,
              size: resource.transferSize,
            });
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
      console.log('[Resource Timing] Observer initialized');
    } catch (error) {
      console.error('Failed to initialize Resource Timing observer:', error);
    }
  }
}

/**
 * Initialize all performance monitoring
 */
export function initPerformanceMonitoring(): void {
  initWebVitals();
  observeLongTasks();
  observeResourceTiming();
}
