import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { DeadlyAssaultData } from '@/types/deadly-assault';
import { ShiyuDefenseData } from '@/types/shiyu-defense';
import { buildFileName, getSeasonWindow } from './date-utils';
import { logger } from './error-utils';

type DataType = 'deadly-assault' | 'shiyu-defense';

interface DataIndex {
  file: string;
  start?: string;
  end?: string;
}

/**
 * Centralized data service for loading game data
 */
export class DataService {
  private getDataDirectory(type: DataType): string {
    const baseDir = process.cwd();
    return type === 'deadly-assault' 
      ? path.join(baseDir, 'deadlyAssault')
      : path.join(baseDir, 'shiyu');
  }

  private parseEndDateFromFilename(fileName: string, type: DataType): number | null {
    const prefix = type === 'deadly-assault' ? 'deadly-assault' : 'shiyu-defense';
    const pattern = new RegExp(`^${prefix}-(\\d{4}-\\d{2}-\\d{2})-(\\d{4}-\\d{2}-\\d{2})\\.json$`);
    const match = fileName.match(pattern);
    
    if (match) {
      const endDate = new Date(match[2] + 'T00:00:00Z').getTime();
      return Number.isNaN(endDate) ? null : endDate;
    }
    return null;
  }

  private parseWindowFromFilename(fileName: string, type: DataType): { start?: string; end?: string } {
    const prefix = type === 'deadly-assault' ? 'deadly-assault' : 'shiyu-defense';
    const pattern = new RegExp(`^${prefix}-(\\d{4}-\\d{2}-\\d{2})-(\\d{4}-\\d{2}-\\d{2})\\.json$`);
    const match = fileName.match(pattern);
    
    if (match) {
      return { start: match[1], end: match[2] };
    }
    return {};
  }

  /**
   * Get the latest data file for a given type
   */
  async getLatestData<T extends DeadlyAssaultData | ShiyuDefenseData>(type: DataType): Promise<T | null> {
    try {
      const dataDir = this.getDataDirectory(type);
      const files = await readdir(dataDir);
      
      if (files.length === 0) {
        logger.warn(`No ${type} data files found`);
        return null;
      }

      // Prefer new naming by end date
      const withEnd = files
        .map((f) => ({ f, end: this.parseEndDateFromFilename(f, type) }))
        .filter((x) => x.end !== null) as { f: string; end: number }[];

      let latestFile: string;
      if (withEnd.length > 0) {
        withEnd.sort((a, b) => b.end - a.end);
        latestFile = withEnd[0].f;
      } else {
        // Fallback: previous behavior (lexicographic reverse)
        latestFile = files.sort().reverse()[0];
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
   * Get all data files for a given type, sorted by date
   */
  async getAllData<T extends DeadlyAssaultData | ShiyuDefenseData>(type: DataType): Promise<T[]> {
    try {
      const dataDir = this.getDataDirectory(type);
      const files = await readdir(dataDir);
      
      // Prefer sorting by end date if possible
      const withEnd = files
        .map((f) => ({ f, end: this.parseEndDateFromFilename(f, type) }))
        .filter((x) => x.end !== null) as { f: string; end: number }[];

      let ordered: string[];
      if (withEnd.length > 0) {
        withEnd.sort((a, b) => b.end - a.end);
        ordered = withEnd.map((x) => x.f);
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
   * Get data index (list of available files with date ranges)
   */
  async getDataIndex(type: DataType): Promise<DataIndex[]> {
    try {
      const dataDir = this.getDataDirectory(type);
      const files = await readdir(dataDir);
      
      const withEnd = files
        .map((f) => ({ 
          f, 
          endTs: this.parseEndDateFromFilename(f, type), 
          ...this.parseWindowFromFilename(f, type) 
        }))
        .sort((a, b) => {
          if (a.endTs !== null && b.endTs !== null) return (b.endTs! - a.endTs!);
          return b.f.localeCompare(a.f);
        });
        
      return withEnd.map(({ f, start, end }) => ({ file: f, start, end }));
    } catch (error) {
      logger.error(`Error reading ${type} index:`, error);
      return [];
    }
  }

  /**
   * Get data by specific filename
   */
  async getDataByFile<T extends DeadlyAssaultData | ShiyuDefenseData>(
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
  async saveData<T extends DeadlyAssaultData | ShiyuDefenseData>(
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

      // Get season window and build filename
      const mode = type === 'deadly-assault' ? 'deadly' : 'shiyu';
      const { start, end } = getSeasonWindow(mode, data);
      const fileName = buildFileName(mode, start, end);
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
  async hasDataChanged<T extends DeadlyAssaultData | ShiyuDefenseData>(
    newData: T,
    type: DataType
  ): Promise<boolean> {
    try {
      const mode = type === 'deadly-assault' ? 'deadly' : 'shiyu';
      const { start, end } = getSeasonWindow(mode, newData);
      const fileName = buildFileName(mode, start, end);
      
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
  getDataSummary<T extends DeadlyAssaultData | ShiyuDefenseData>(data: T, type: DataType): Record<string, unknown> {
    if (type === 'deadly-assault') {
      const deadlyData = data as DeadlyAssaultData;
      return {
        count: deadlyData.data?.list?.length || 0,
        player: deadlyData.data?.nick_name || "Unknown",
        totalScore: deadlyData.data?.total_score || 0,
        totalStars: deadlyData.data?.total_star || 0,
        rankPercent: deadlyData.data?.rank_percent,
      };
    } else {
      const shiyuData = data as ShiyuDefenseData;
      return {
        count: shiyuData.data?.all_floor_detail?.length || 0,
        player: "Unknown", // Shiyu data doesn't have nick_name
        maxLayer: shiyuData.data?.max_layer || 0,
        fastTime: shiyuData.data?.fast_layer_time || 0,
        rating: shiyuData.data?.rating_list?.[0]?.rating || "N/A",
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
