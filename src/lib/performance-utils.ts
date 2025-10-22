/**
 * Performance monitoring utilities
 * Tracks Web Vitals and custom metrics
 */

import { logger } from './error-utils';

/**
 * Performance metric type
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

/**
 * Web Vitals thresholds (in milliseconds)
 */
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },      // First Contentful Paint
  LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
  CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 },      // Time to First Byte
  INP: { good: 200, poor: 500 },        // Interaction to Next Paint
};

/**
 * Get rating based on value and thresholds
 */
function getRating(
  value: number,
  thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Report Web Vitals to analytics
 */
export function reportWebVitals(metric: PerformanceMetric) {
  logger.info(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
  
  // In production, send to analytics service
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics
    // window.gtag?.('event', metric.name, {
    //   value: Math.round(metric.value),
    //   metric_rating: metric.rating,
    // });
  }
}

/**
 * Measure custom performance metric
 */
export function measurePerformance(name: string): () => void {
  const startTime = performance.now();
  
  return () => {
    const duration = performance.now() - startTime;
    const metric: PerformanceMetric = {
      name,
      value: duration,
      rating: getRating(duration, { good: 100, poor: 500 }),
      timestamp: Date.now()
    };
    
    reportWebVitals(metric);
  };
}

/**
 * Monitor component render time
 */
export function usePerformanceMonitor(componentName: string) {
  if (typeof window === 'undefined') return;
  
  const startMark = `${componentName}-start`;
  const endMark = `${componentName}-end`;
  const measureName = `${componentName}-render`;
  
  // Start mark
  performance.mark(startMark);
  
  return () => {
    // End mark and measure
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    
    const measure = performance.getEntriesByName(measureName)[0];
    if (measure) {
      const metric: PerformanceMetric = {
        name: measureName,
        value: measure.duration,
        rating: getRating(measure.duration, { good: 16, poor: 50 }), // 60fps = 16ms
        timestamp: Date.now()
      };
      
      reportWebVitals(metric);
    }
    
    // Clean up marks and measures
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);
  };
}

/**
 * Get Core Web Vitals
 */
export async function getCoreWebVitals() {
  if (typeof window === 'undefined') return [];
  
  try {
    // Dynamic import to reduce bundle size
    const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');
    
    const metrics: PerformanceMetric[] = [];
    
    onCLS((metric) => {
      const webVital: PerformanceMetric = {
        name: 'CLS',
        value: metric.value,
        rating: getRating(metric.value, THRESHOLDS.CLS),
        timestamp: Date.now()
      };
      metrics.push(webVital);
      reportWebVitals(webVital);
    });
    
    onFCP((metric) => {
      const webVital: PerformanceMetric = {
        name: 'FCP',
        value: metric.value,
        rating: getRating(metric.value, THRESHOLDS.FCP),
        timestamp: Date.now()
      };
      metrics.push(webVital);
      reportWebVitals(webVital);
    });
    
    onLCP((metric) => {
      const webVital: PerformanceMetric = {
        name: 'LCP',
        value: metric.value,
        rating: getRating(metric.value, THRESHOLDS.LCP),
        timestamp: Date.now()
      };
      metrics.push(webVital);
      reportWebVitals(webVital);
    });
    
    onTTFB((metric) => {
      const webVital: PerformanceMetric = {
        name: 'TTFB',
        value: metric.value,
        rating: getRating(metric.value, THRESHOLDS.TTFB),
        timestamp: Date.now()
      };
      metrics.push(webVital);
      reportWebVitals(webVital);
    });
    
    onINP((metric) => {
      const webVital: PerformanceMetric = {
        name: 'INP',
        value: metric.value,
        rating: getRating(metric.value, THRESHOLDS.INP),
        timestamp: Date.now()
      };
      metrics.push(webVital);
      reportWebVitals(webVital);
    });
    
    return metrics;
  } catch (error) {
    logger.error('Error getting Core Web Vitals:', error);
    return [];
  }
}

/**
 * Monitor bundle size
 */
export function logBundleSize() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
  
  // Get all script tags
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  let totalSize = 0;
  
  scripts.forEach(script => {
    const src = (script as HTMLScriptElement).src;
    if (src && !src.includes('localhost')) {
      fetch(src, { method: 'HEAD' })
        .then(response => {
          const size = parseInt(response.headers.get('content-length') || '0');
          totalSize += size;
          logger.info(`Script: ${src.split('/').pop()} - ${(size / 1024).toFixed(2)} KB`);
        })
        .catch(() => {
          // Ignore errors
        });
    }
  });
  
  setTimeout(() => {
    logger.info(`Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
  }, 2000);
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
