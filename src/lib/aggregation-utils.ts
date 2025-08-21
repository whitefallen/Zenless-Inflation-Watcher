import { Avatar, CharacterUsage, TeamUsage } from "@/types/shared";
import { createTeamKey } from "./agent-utils";
import { calculateStats } from "./data-utils";

/**
 * Generic character usage aggregation
 */
export function aggregateCharacterUsage<T, R>(
  allData: T[],
  getAvatars: (item: R) => Avatar[],
  getScore?: (item: R) => number,
  getLayer?: (item: R) => number,
  getMaxLayer?: (data: T) => number
): CharacterUsage[] {
  const charMap = new Map<number, CharacterUsage>();
  let bestScore = 0;
  
  // First pass to find best score if scoring is enabled
  if (getScore) {
    for (const data of allData) {
      for (const run of getItemsFromData<T, R>(data)) {
        const score = getScore(run);
        if (score > bestScore) bestScore = score;
      }
    }
  }
  
  // Second pass to aggregate
  for (const data of allData) {
    const maxLayer = getMaxLayer?.(data);
    
    for (const run of getItemsFromData<T, R>(data)) {
      const avatars = getAvatars(run);
      const score = getScore?.(run) || 0;
      const layer = getLayer?.(run) || 0;
      
      for (const avatar of avatars) {
        if (!charMap.has(avatar.id)) {
          charMap.set(avatar.id, {
            avatar,
            count: 0,
            totalScore: 0,
            topRunCount: 0
          });
        }
        
        const entry = charMap.get(avatar.id)!;
        entry.count += 1;
        
        if (getScore) {
          entry.totalScore = (entry.totalScore || 0) + score;
          entry.averageScore = entry.totalScore / entry.count;
          
          if (score === bestScore) {
            entry.topRunCount = (entry.topRunCount || 0) + 1;
          }
        }
        
        if (getLayer && maxLayer && layer === maxLayer) {
          entry.topRunCount = (entry.topRunCount || 0) + 1;
        }
      }
    }
  }
  
  return Array.from(charMap.values()).sort((a, b) => b.count - a.count);
}

/**
 * Generic team usage aggregation
 */
export function aggregateTeamUsage<T, R>(
  allData: T[],
  getTeam: (item: R) => Avatar[],
  getScore?: (item: R) => number
): TeamUsage[] {
  const teamMap = new Map<string, TeamUsage>();
  
  for (const data of allData) {
    for (const run of getItemsFromData<T, R>(data)) {
      const team = getTeam(run);
      const teamKey = createTeamKey(team);
      const score = getScore?.(run);
      
      if (!teamMap.has(teamKey)) {
        teamMap.set(teamKey, {
          avatars: team,
          teamKey,
          count: 0,
          scores: []
        });
      }
      
      const entry = teamMap.get(teamKey)!;
      entry.count += 1;
      
      if (score !== undefined) {
        entry.scores = entry.scores || [];
        entry.scores.push(score);
      }
    }
  }
  
  // Calculate derived metrics
  for (const team of teamMap.values()) {
    if (team.scores && team.scores.length > 0) {
      const stats = calculateStats(team.scores);
      team.averageScore = stats.average;
      team.maxScore = stats.max;
    }
  }
  
  return Array.from(teamMap.values()).sort((a, b) => b.count - a.count);
}

/**
 * Boss difficulty aggregation for deadly assault
 */
export function aggregateBossData<T, R>(
  allData: T[],
  getBosses: (item: R) => Array<{ name: string; icon?: string }>,
  getScore: (item: R) => number
): Array<{
  name: string;
  icon?: string;
  count: number;
  scores: number[];
  averageScore: number;
  maxScore: number;
}> {
  const bossMap = new Map<string, {
    name: string;
    icon?: string;
    count: number;
    scores: number[];
    averageScore: number;
    maxScore: number;
  }>();
  
  for (const data of allData) {
    for (const run of getItemsFromData<T, R>(data)) {
      const bosses = getBosses(run);
      const score = getScore(run);
      
      for (const boss of bosses) {
        if (!bossMap.has(boss.name)) {
          bossMap.set(boss.name, {
            name: boss.name,
            icon: boss.icon,
            count: 0,
            scores: [],
            averageScore: 0,
            maxScore: 0
          });
        }
        
        const entry = bossMap.get(boss.name)!;
        entry.count += 1;
        entry.scores.push(score);
      }
    }
  }
  
  // Calculate derived metrics
  for (const boss of bossMap.values()) {
    if (boss.scores.length > 0) {
      const stats = calculateStats(boss.scores);
      boss.averageScore = stats.average;
      boss.maxScore = stats.max;
    }
  }
  
  return Array.from(bossMap.values()).sort((a, b) => b.count - a.count);
}

/**
 * Period statistics aggregation
 */
export function aggregatePeriodStats<T>(
  allData: T[],
  getStats: (data: T) => Record<string, unknown>
): Array<Record<string, unknown>> {
  return allData.map(getStats);
}

/**
 * Character performance across layers (for Shiyu Defense)
 */
export function aggregateCharacterLayerPerformance<T>(
  allData: T[],
  getFloors: (data: T) => Array<{ layer_index: number; avatars?: Avatar[] }>,
  getMaxLayer: (data: T) => number
): Array<{
  avatar: Avatar;
  count: number;
  totalLayer: number;
  averageLayer: number;
  topLayerCount: number;
}> {
  const charMap = new Map<number, {
    avatar: Avatar;
    count: number;
    totalLayer: number;
    averageLayer: number;
    topLayerCount: number;
  }>();
  
  for (const data of allData) {
    const floors = getFloors(data);
    const maxLayer = getMaxLayer(data);
    
    for (const floor of floors) {
      const avatars = floor.avatars || [];
      
      for (const avatar of avatars) {
        if (!charMap.has(avatar.id)) {
          charMap.set(avatar.id, {
            avatar,
            count: 0,
            totalLayer: 0,
            averageLayer: 0,
            topLayerCount: 0
          });
        }
        
        const entry = charMap.get(avatar.id)!;
        entry.count += 1;
        entry.totalLayer += floor.layer_index;
        entry.averageLayer = entry.totalLayer / entry.count;
        
        if (floor.layer_index === maxLayer) {
          entry.topLayerCount += 1;
        }
      }
    }
  }
  
  return Array.from(charMap.values()).sort((a, b) => b.count - a.count);
}

/**
 * Helper function to extract runs/items from data structure
 * This handles the common pattern of data.data.list or data.data.all_floor_detail
 */
function getItemsFromData<T, R>(data: T): R[] {
  if (typeof data === 'object' && data !== null && 'data' in data) {
    const dataObj = (data as Record<string, unknown>).data;
    if (typeof dataObj === 'object' && dataObj !== null) {
      // Try common list patterns
      if ('list' in dataObj && Array.isArray((dataObj as Record<string, unknown>).list)) {
        return (dataObj as Record<string, unknown>).list as R[];
      }
      if ('all_floor_detail' in dataObj && Array.isArray((dataObj as Record<string, unknown>).all_floor_detail)) {
        return (dataObj as Record<string, unknown>).all_floor_detail as R[];
      }
    }
  }
  
  // If direct array
  if (Array.isArray(data)) {
    return data as R[];
  }
  
  // Single item
  return [data as unknown as R];
}

/**
 * Enhanced team aggregation with detailed statistics
 */
export function aggregateTeamCompositions<T, R>(
  allData: T[],
  getTeam: (item: R) => Avatar[],
  getMetrics: (item: R) => Record<string, number>
): Array<{
  avatars: Avatar[];
  teamKey: string;
  count: number;
  metrics: Record<string, {
    total: number;
    average: number;
    min: number;
    max: number;
  }>;
}> {
  const teamMap = new Map<string, {
    avatars: Avatar[];
    teamKey: string;
    count: number;
    metricValues: Record<string, number[]>;
  }>();
  
  for (const data of allData) {
    for (const run of getItemsFromData<T, R>(data)) {
      const team = getTeam(run);
      const teamKey = createTeamKey(team);
      const metrics = getMetrics(run);
      
      if (!teamMap.has(teamKey)) {
        teamMap.set(teamKey, {
          avatars: team,
          teamKey,
          count: 0,
          metricValues: {}
        });
      }
      
      const entry = teamMap.get(teamKey)!;
      entry.count += 1;
      
      // Aggregate metrics
      for (const [metricName, value] of Object.entries(metrics)) {
        if (!entry.metricValues[metricName]) {
          entry.metricValues[metricName] = [];
        }
        entry.metricValues[metricName].push(value);
      }
    }
  }
  
  // Calculate final statistics
  return Array.from(teamMap.values()).map(team => ({
    avatars: team.avatars,
    teamKey: team.teamKey,
    count: team.count,
    metrics: Object.fromEntries(
      Object.entries(team.metricValues).map(([metric, values]) => {
        const stats = calculateStats(values);
        return [metric, {
          total: stats.sum,
          average: stats.average,
          min: stats.min,
          max: stats.max
        }];
      })
    )
  })).sort((a, b) => b.count - a.count);
}
