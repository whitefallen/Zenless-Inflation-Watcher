import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { DeadlyAssaultData } from '@/types/deadly-assault';

const DATA_DIR = path.join(process.cwd(), 'deadlyAssault');

export async function getLatestDeadlyAssaultData(): Promise<DeadlyAssaultData | null> {
  try {
    // Get list of files in the directory
    const files = await readdir(DATA_DIR);
    
    // Sort files to get the latest
    const sortedFiles = files.sort().reverse();
    
    if (sortedFiles.length === 0) {
      return null;
    }

    // Read the latest file
    const latestFile = sortedFiles[0];
    const filePath = path.join(DATA_DIR, latestFile);
    const fileContent = await readFile(filePath, 'utf-8');
    
    return JSON.parse(fileContent) as DeadlyAssaultData;
  } catch (error) {
    console.error('Error reading deadly assault data:', error);
    return null;
  }
}

export async function getAllDeadlyAssaultData(): Promise<DeadlyAssaultData[]> {
  try {
    const files = await readdir(DATA_DIR);
    const dataPromises = files.map(async (file) => {
      const filePath = path.join(DATA_DIR, file);
      const fileContent = await readFile(filePath, 'utf-8');
      return JSON.parse(fileContent) as DeadlyAssaultData;
    });

    return await Promise.all(dataPromises);
  } catch (error) {
    console.error('Error reading all deadly assault data:', error);
    return [];
  }
}
