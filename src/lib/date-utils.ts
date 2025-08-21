export interface TimeStamp {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
}

/**
 * Converts a date to YYYY-MM-DD format
 */
export function toYMD(date: Date | string | number): string {
  const d = new Date(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Converts a TimeStamp object to YYYY-MM-DD format
 */
export function timestampObjectToDateString(ts?: TimeStamp): string | null {
  if (!ts || typeof ts !== "object") return null;
  const d = new Date(Date.UTC(ts.year, (ts.month || 1) - 1, ts.day || 1));
  return toYMD(d);
}

/**
 * Parses a potentially epoch string/number to YYYY-MM-DD format
 */
export function parsePossiblyEpochString(v: string | number): string | null {
  if (!v) return null;
  
  // If it's a purely numeric string, treat as seconds since epoch
  if (typeof v === "string" && /^\d+$/.test(v)) {
    const ms = Number(v) * 1000;
    return toYMD(ms);
  }
  
  // If it's a number, treat as seconds since epoch
  if (typeof v === "number") {
    return toYMD(v * 1000);
  }
  
  // Otherwise try Date constructor
  try {
    return toYMD(new Date(v));
  } catch {
    return null;
  }
}

/**
 * Formats a TimeStamp object to a readable date string
 */
export function formatTimeStamp(ts?: TimeStamp): string {
  if (!ts) return "Unknown";
  return `${ts.year}-${String(ts.month || 1).padStart(2, '0')}-${String(ts.day || 1).padStart(2, '0')}`;
}

/**
 * Formats a date range from two TimeStamp objects
 */
export function formatDateRange(start?: TimeStamp, end?: TimeStamp): string {
  if (!start || !end) return "Unknown period";
  const startDate = new Date(Date.UTC(start.year, (start.month || 1) - 1, start.day || 1));
  const endDate = new Date(Date.UTC(end.year, (end.month || 1) - 1, end.day || 1));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return `${fmt(startDate)} - ${fmt(endDate)}`;
}

/**
 * Formats time in seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Formats a date string to a readable format
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
}

/**
 * Gets the season window from API payload data
 */
export function getSeasonWindow(mode: "deadly" | "shiyu", payload: unknown): { start: string | null; end: string | null } {
  if (!payload || typeof payload !== 'object' || !('data' in payload) || !payload.data) {
    return { start: null, end: null };
  }
  
  const data = payload.data as Record<string, unknown>;
  
  if (mode === "deadly") {
    const start = timestampObjectToDateString(data.start_time as TimeStamp);
    const end = timestampObjectToDateString(data.end_time as TimeStamp);
    return { start, end };
  }
  
  // shiyu
  // Prefer hadal_* if present (object timestamps), else begin_time/end_time strings
  const start = timestampObjectToDateString(data.hadal_begin_time as TimeStamp) || 
                parsePossiblyEpochString(data.begin_time as string | number);
  const end = timestampObjectToDateString(data.hadal_end_time as TimeStamp) || 
              parsePossiblyEpochString(data.end_time as string | number);
  return { start, end };
}

/**
 * Builds a filename for data storage
 */
export function buildFileName(mode: "deadly" | "shiyu", start?: string | null, end?: string | null): string {
  const modeName = mode === "deadly" ? "deadly-assault" : "shiyu-defense";
  const startSafe = start || "unknown-start";
  const endSafe = end || "unknown-end";
  return `${modeName}-${startSafe}-${endSafe}.json`;
}
