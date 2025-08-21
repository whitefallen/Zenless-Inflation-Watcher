/**
 * Stable JSON stringification for comparison purposes
 */
export function stableStringify(value: unknown): string {
  const seen = new WeakSet();
  
  const sorter = (obj: unknown): unknown => {
    if (obj === null || typeof obj !== "object") return obj;
    if (seen.has(obj as object)) return obj;
    seen.add(obj as object);
    
    if (Array.isArray(obj)) return obj.map(sorter);
    
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce((acc: Record<string, unknown>, key) => {
        acc[key] = sorter((obj as Record<string, unknown>)[key]);
        return acc;
      }, {});
  };
  
  return JSON.stringify(sorter(value));
}

/**
 * Normalizes an object for comparison by removing volatile fields
 */
export function normalizeForComparison(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;
  
  const clone = JSON.parse(JSON.stringify(obj));
  
  // Remove metadata.exportDate as it changes on every save
  if (clone.metadata && typeof clone.metadata === "object") {
    delete clone.metadata.exportDate;
  }
  
  return clone;
}

/**
 * Deep clone utility
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Safe property access utility
 */
export function safeGet<T>(obj: unknown, path: string, defaultValue?: T): T | undefined {
  try {
    return path.split('.').reduce((current: unknown, key: string) => {
      return current && typeof current === 'object' && key in current 
        ? (current as Record<string, unknown>)[key] 
        : undefined;
    }, obj) as T || defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Groups an array by a key function
 */
export function groupBy<T, K extends string | number>(
  array: T[], 
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

/**
 * Calculates basic statistics for an array of numbers
 */
export function calculateStats(numbers: number[]): {
  min: number;
  max: number;
  average: number;
  sum: number;
  count: number;
} {
  if (numbers.length === 0) {
    return { min: 0, max: 0, average: 0, sum: 0, count: 0 };
  }
  
  const sum = numbers.reduce((a, b) => a + b, 0);
  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers),
    average: sum / numbers.length,
    sum,
    count: numbers.length
  };
}

/**
 * Sorts an array of objects by multiple criteria
 */
export function sortBy<T>(
  array: T[], 
  sortFns: ((item: T) => number | string)[]
): T[] {
  return [...array].sort((a, b) => {
    for (const sortFn of sortFns) {
      const aVal = sortFn(a);
      const bVal = sortFn(b);
      
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
}

/**
 * Debounce function utility
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
