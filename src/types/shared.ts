// Shared interfaces used across both deadly assault and shiyu defense

export interface TimeStamp {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
}

export interface Avatar {
  id: number;
  level: number;
  element_type: number;
  avatar_profession: number;
  rarity: string;
  rank: number;
  role_square_url: string;
  sub_element_type?: number;
}

export interface Buddy {
  id: number;
  rarity: string;
  level: number;
  bangboo_rectangle_url: string;
}

export interface AgentInfo {
  id: number;
  name: string;
  weaponType: string;
  elementType: string;
  rarity: number;
  iconUrl: string;
  level?: number;
}

export interface DataMetadata {
  exportDate: string;
  uid: string;
  type: string;
  automated: boolean;
}

// Element type mappings
export const ELEMENT_TYPES: Record<number, string> = {
  200: "Physical",
  201: "Fire", 
  202: "Ice",
  203: "Electric",
  204: "Grass",
  205: "Ether",
  206: "Imaginary",
};

export const ELEMENT_COLORS: Record<number, string> = {
  200: "#8B4513", // Brown for Physical
  201: "#FF4500", // Orange Red for Fire
  202: "#00BFFF", // Deep Sky Blue for Ice
  203: "#FFD700", // Gold for Electric
  204: "#32CD32", // Lime Green for Grass
  205: "#9370DB", // Medium Slate Blue for Ether
  206: "#FF69B4", // Hot Pink for Imaginary
};

export const RARITY_COLORS: Record<string, string> = {
  "S": "#ff6b6b", // Red/Pink for S-rank
  "A": "#4ecdc4", // Teal for A-rank
  "B": "#45b7d1", // Blue for B-rank
  "C": "#96ceb4", // Green for C-rank
};

// Utility type for table field configuration
export interface TableField<T> {
  label: string;
  key?: keyof T;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  sortFn?: (item: T) => number | string;
}

// Generic aggregation result
export interface AggregationResult<T> {
  item: T;
  count: number;
  metadata?: Record<string, unknown>;
}

// Character aggregation specific types
export interface CharacterUsage {
  avatar: Avatar;
  count: number;
  totalScore?: number;
  averageScore?: number;
  topRunCount?: number;
}

export interface TeamUsage {
  avatars: Avatar[];
  teamKey: string;
  count: number;
  scores?: number[];
  averageScore?: number;
  maxScore?: number;
}

// Performance metrics
export interface PerformanceMetrics {
  total: number;
  average: number;
  min: number;
  max: number;
  median: number;
  standardDeviation?: number;
}
