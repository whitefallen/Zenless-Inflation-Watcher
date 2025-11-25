import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { DeadlyAssaultData } from '@/types/deadly-assault';
import { ShiyuDefenseData } from '@/types/shiyu-defense';
import { VoidFrontData } from '@/types/void-front';
import { buildFileName, getSeasonId } from './date-utils';
import { logger } from './error-utils';

type DataType = 'deadly-assault' | 'shiyu-defense' | 'void-front';

interface DataIndex {
  file: string;
  seasonId?: number;
  // Legacy fields for backwards compatibility
  start?: string;
  end?: string;
}

/**
 * Centralized data service for loading game data
 */
export class DataService {
  private getDataDirectory(type: DataType): string {
    const baseDir = process.cwd();
    if (type === 'deadly-assault') {
      return path.join(baseDir, 'deadlyAssault');
    } else if (type === 'shiyu-defense') {
      return path.join(baseDir, 'shiyu');
    } else if (type === 'void-front') {
      return path.join(baseDir, 'voidFront');
    } else {
      return path.join(baseDir, 'data');
    }
  }

  private parseSeasonIdFromFilename(fileName: string, type: DataType): number | null {
    let prefix: string;
    
    if (type === 'deadly-assault') {
      prefix = 'deadly-assault';
    } else if (type === 'shiyu-defense') {
      prefix = 'shiyu-defense';
    } else if (type === 'void-front') {
      prefix = 'void-front';
    } else {
      prefix = type;
    }
    
    // New ID-based pattern: gameMode-ID.json
    const idPattern = new RegExp(`^${prefix}-(\\d+)\\.json$`);
    const idMatch = fileName.match(idPattern);
    
    if (idMatch) {
      return parseInt(idMatch[1], 10);
    }
    return null;
  }

  private parseEndDateFromFilename(fileName: string, type: DataType): number | null {
    let prefix: string;
    
    if (type === 'deadly-assault') {
      prefix = 'deadly-assault';
    } else if (type === 'shiyu-defense') {
      prefix = 'shiyu-defense';
    } else if (type === 'void-front') {
      prefix = 'void-front';
    } else {
      prefix = type;
    }
    
    // Legacy date-based pattern: gameMode-startDate-endDate.json
    const pattern = new RegExp(`^${prefix}-(\\d{4}-\\d{2}-\\d{2})-(\\d{4}-\\d{2}-\\d{2})\\.json$`);
    const match = fileName.match(pattern);
    
    if (match) {
      const endDate = new Date(match[2] + 'T00:00:00Z').getTime();
      return Number.isNaN(endDate) ? null : endDate;
    }
    return null;
  }

  private parseWindowFromFilename(fileName: string, type: DataType): { seasonId?: number; start?: string; end?: string } {
    let prefix: string;
    
    if (type === 'deadly-assault') {
      prefix = 'deadly-assault';
    } else if (type === 'shiyu-defense') {
      prefix = 'shiyu-defense';
    } else if (type === 'void-front') {
      prefix = 'void-front';
    } else {
      prefix = type;
    }
    
    // New ID-based pattern: gameMode-ID.json
    const idPattern = new RegExp(`^${prefix}-(\\d+)\\.json$`);
    const idMatch = fileName.match(idPattern);
    
    if (idMatch) {
      return { seasonId: parseInt(idMatch[1], 10) };
    }
    
    // Legacy date-based pattern: gameMode-startDate-endDate.json
    const datePattern = new RegExp(`^${prefix}-(\\d{4}-\\d{2}-\\d{2})-(\\d{4}-\\d{2}-\\d{2})\\.json$`);
    const dateMatch = fileName.match(datePattern);
    
    if (dateMatch) {
      return { start: dateMatch[1], end: dateMatch[2] };
    }
    return {};
  }

  /**
   * Get the latest data file for a given type
   */
  async getLatestData<T extends DeadlyAssaultData | ShiyuDefenseData | VoidFrontData>(type: DataType): Promise<T | null> {
    try {
      const dataDir = this.getDataDirectory(type);
      const files = await readdir(dataDir);
      
      if (files.length === 0) {
        logger.warn(`No ${type} data files found`);
        return null;
      }

      // Prefer new ID-based naming (higher ID = newer season)
      const withSeasonId = files
        .map((f) => ({ f, seasonId: this.parseSeasonIdFromFilename(f, type) }))
        .filter((x) => x.seasonId !== null) as { f: string; seasonId: number }[];

      let latestFile: string;
      if (withSeasonId.length > 0) {
        withSeasonId.sort((a, b) => b.seasonId - a.seasonId);
        latestFile = withSeasonId[0].f;
      } else {
        // Fallback to legacy date-based files
        const withEnd = files
          .map((f) => ({ f, end: this.parseEndDateFromFilename(f, type) }))
          .filter((x) => x.end !== null) as { f: string; end: number }[];

        if (withEnd.length > 0) {
          withEnd.sort((a, b) => b.end - a.end);
          latestFile = withEnd[0].f;
        } else {
          // Final fallback: lexicographic reverse
          latestFile = files.sort().reverse()[0];
        }
      }

      const filePath = path.join(dataDir, latestFile);
      const fileContent = await readFile(filePath, 'utf-8');
      
      return JSON.parse(fileContent) as T;
    } catch (error) {
      logger.error(`Error reading latest ${type} data:`, error);
      return null;
    }
  }

  /**
   * Get all data files for a given type, sorted by season ID (descending)
   */
  async getAllData<T extends DeadlyAssaultData | ShiyuDefenseData | VoidFrontData>(type: DataType): Promise<T[]> {
    try {
      const dataDir = this.getDataDirectory(type);
      const files = await readdir(dataDir);
      
      // Prefer sorting by season ID (higher ID = newer)
      const withSeasonId = files
        .map((f) => ({ f, seasonId: this.parseSeasonIdFromFilename(f, type) }))
        .filter((x) => x.seasonId !== null) as { f: string; seasonId: number }[];

      // Also collect legacy date-based files
      const withEnd = files
        .map((f) => ({ f, end: this.parseEndDateFromFilename(f, type) }))
        .filter((x) => x.end !== null && !withSeasonId.some(s => s.f === x.f)) as { f: string; end: number }[];

      let ordered: string[];
      if (withSeasonId.length > 0 || withEnd.length > 0) {
        // Sort ID-based by seasonId descending
        withSeasonId.sort((a, b) => b.seasonId - a.seasonId);
        // Sort date-based by end date descending
        withEnd.sort((a, b) => b.end - a.end);
        // ID-based files come first (newer scheme), then legacy
        ordered = [...withSeasonId.map((x) => x.f), ...withEnd.map((x) => x.f)];
      } else {
        ordered = files.sort().reverse();
      }

      const dataPromises = ordered.map(async (file) => {
        const filePath = path.join(dataDir, file);
        const fileContent = await readFile(filePath, 'utf-8');
        return JSON.parse(fileContent) as T;
      });

      return await Promise.all(dataPromises);
    } catch (error) {
      logger.error(`Error reading all ${type} data:`, error);
      return [];
    }
  }

  /**
   * Get data index (list of available files with season IDs or date ranges)
   */
  async getDataIndex(type: DataType): Promise<DataIndex[]> {
    try {
      const dataDir = this.getDataDirectory(type);
      const files = await readdir(dataDir);
      
      const parsed = files
        .map((f) => ({ 
          f, 
          seasonId: this.parseSeasonIdFromFilename(f, type),
          endTs: this.parseEndDateFromFilename(f, type), 
          ...this.parseWindowFromFilename(f, type) 
        }))
        .sort((a, b) => {
          // Sort by season ID first (higher = newer), then by end date
          if (a.seasonId !== null && b.seasonId !== null) return (b.seasonId - a.seasonId);
          if (a.seasonId !== null) return -1; // ID-based comes first
          if (b.seasonId !== null) return 1;
          if (a.endTs !== null && b.endTs !== null) return (b.endTs! - a.endTs!);
          return b.f.localeCompare(a.f);
        });
        
      return parsed.map(({ f, seasonId, start, end }) => ({ file: f, seasonId: seasonId ?? undefined, start, end }));
    } catch (error) {
      logger.error(`Error reading ${type} index:`, error);
      return [];
    }
  }

  /**
   * Get data by specific filename
   */
  async getDataByFile<T extends DeadlyAssaultData | ShiyuDefenseData | VoidFrontData>(
    fileName: string, 
    type: DataType
  ): Promise<T | null> {
    try {
      const dataDir = this.getDataDirectory(type);
      const filePath = path.join(dataDir, fileName);
      const fileContent = await readFile(filePath, 'utf-8');
      return JSON.parse(fileContent) as T;
    } catch (error) {
      logger.error(`Error reading ${type} data by file:`, error);
      return null;
    }
  }

  /**
   * Save data with proper filename and metadata
   */
  async saveData<T extends DeadlyAssaultData | ShiyuDefenseData | VoidFrontData>(
    data: T,
    uid: string,
    type: DataType,
    automated = false
  ): Promise<string | null> {
    try {
      const dataDir = this.getDataDirectory(type);
      
      // Ensure directory exists
      const fs = await import('fs');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Get season ID and build filename
      const mode = type === 'deadly-assault' ? 'deadly' : (type === 'void-front' ? 'void-front' : 'shiyu');
      const seasonId = getSeasonId(mode, data);
      const fileName = buildFileName(mode, seasonId);
      const filePath = path.join(dataDir, fileName);

      // Add metadata
      const dataWithMetadata = {
        ...data,
        metadata: {
          exportDate: new Date().toISOString(),
          uid: uid,
          type: type.replace('-', '_'),
          automated
        }
      };

      // Write file
      fs.writeFileSync(filePath, JSON.stringify(dataWithMetadata, null, 2));
      
      return fileName;
    } catch (error) {
      logger.error(`Error saving ${type} data:`, error);
      return null;
    }
  }

  /**
   * Check if data has changed compared to existing file
   */
  async hasDataChanged<T extends DeadlyAssaultData | ShiyuDefenseData | VoidFrontData>(
    newData: T,
    type: DataType
  ): Promise<boolean> {
    try {
      const mode = type === 'deadly-assault' ? 'deadly' : (type === 'void-front' ? 'void-front' : 'shiyu');
      const seasonId = getSeasonId(mode, newData);
      const fileName = buildFileName(mode, seasonId);
      
      const dataDir = this.getDataDirectory(type);
      const filePath = path.join(dataDir, fileName);
      
      const fs = await import('fs');
      if (!fs.existsSync(filePath)) {
        return true; // New file, so it's a change
      }

      const existingContent = await readFile(filePath, 'utf-8');
      const existingData = JSON.parse(existingContent);

      // Compare normalized data (excluding metadata.exportDate)
      const { normalizeForComparison, stableStringify } = await import('./data-utils');
      const normalizedExisting = stableStringify(normalizeForComparison(existingData));
      const normalizedNew = stableStringify(normalizeForComparison(newData));

      return normalizedExisting !== normalizedNew;
    } catch (error) {
      logger.error(`Error checking data changes for ${type}:`, error);
      return true; // Assume changed on error
    }
  }

  /**
   * Get summary statistics for data
   */
  getDataSummary<T extends DeadlyAssaultData | ShiyuDefenseData | VoidFrontData>(data: T, type: DataType): Record<string, unknown> {
    if (type === 'deadly-assault') {
      const deadlyData = data as DeadlyAssaultData;
      return {
        count: deadlyData.data?.list?.length || 0,
        player: deadlyData.data?.nick_name || "Unknown",
        totalScore: deadlyData.data?.total_score || 0,
        totalStars: deadlyData.data?.total_star || 0,
        rankPercent: deadlyData.data?.rank_percent,
      };
    } else if (type === 'shiyu-defense') {
      const shiyuData = data as ShiyuDefenseData;
      return {
        count: shiyuData.data?.all_floor_detail?.length || 0,
        player: "Unknown", // Shiyu data doesn't have nick_name
        maxLayer: shiyuData.data?.max_layer || 0,
        fastTime: shiyuData.data?.fast_layer_time || 0,
        rating: shiyuData.data?.rating_list?.[0]?.rating || "N/A",
      };
    } else {
      // Void Front data
      const voidFrontData = data as VoidFrontData;
      return {
        player: voidFrontData.data?.role_basic_info?.nickname || "Unknown",
        totalScore: voidFrontData.data?.void_front_battle_abstract_info_brief?.total_score || 0,
        rankPercent: voidFrontData.data?.void_front_battle_abstract_info_brief?.rank_percent || 0,
        endingRecord: voidFrontData.data?.void_front_battle_abstract_info_brief?.ending_record_name || "Unknown",
        mainChallenges: voidFrontData.data?.main_challenge_record_list?.length || 0,
      };
    }
  }

  /**
   * Export data to JSON file with custom name
   */
  async exportToJSON<T>(
    data: T,
    fileName: string,
    outputDir?: string
  ): Promise<boolean> {
    try {
      const fs = await import('fs');
      const exportDir = outputDir || process.cwd();
      
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      const filePath = path.join(exportDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      return true;
    } catch (error) {
      logger.error('Error exporting to JSON:', error);
      return false;
    }
  }
}

// Export singleton instance
export const dataService = new DataService();
