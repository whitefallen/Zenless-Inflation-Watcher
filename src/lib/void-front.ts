import { VoidFrontData } from '@/types/void-front';
import { DataService } from './data-service';

/**
 * Gets all Void Front data sorted by date (newest first)
 */
export async function getAllVoidFrontData(): Promise<VoidFrontData[]> {
  const dataService = new DataService();
  return await dataService.getAllData<VoidFrontData>('void-front');
}

/**
 * Gets the latest Void Front data
 */
export async function getLatestVoidFrontData(): Promise<VoidFrontData | null> {
  const dataService = new DataService();
  return await dataService.getLatestData<VoidFrontData>('void-front');
}

/**
 * Gets Void Front data for a specific file
 */
export async function getVoidFrontDataByFile(fileName: string): Promise<VoidFrontData | null> {
  const dataService = new DataService();
  return await dataService.getDataByFile<VoidFrontData>(fileName, 'void-front');
}