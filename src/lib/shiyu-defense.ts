import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { ShiyuDefenseData } from '@/types/shiyu-defense';

const DATA_DIR = path.join(process.cwd(), 'shiyu');

export async function getLatestShiyuDefenseData(): Promise<ShiyuDefenseData | null> {
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
    
    return JSON.parse(fileContent) as ShiyuDefenseData;
  } catch (error) {
    console.error('Error reading shiyu defense data:', error);
    return null;
  }
}

export async function getAllShiyuDefenseData(): Promise<ShiyuDefenseData[]> {
  try {
    const files = await readdir(DATA_DIR);
    const dataPromises = files.map(async (file) => {
      const filePath = path.join(DATA_DIR, file);
      const fileContent = await readFile(filePath, 'utf-8');
      return JSON.parse(fileContent) as ShiyuDefenseData;
    });

    return await Promise.all(dataPromises);
  } catch (error) {
    console.error('Error reading all shiyu defense data:', error);
    return [];
  }
}
