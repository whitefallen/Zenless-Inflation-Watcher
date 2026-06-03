import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { DeadlyAssaultData } from '@/types/deadly-assault';

const DATA_DIR = path.join(process.cwd(), 'deadlyAssault');

function parseEndDateFromFilename(fileName: string): number | null {
  // Expected new format: deadly-assault-YYYY-MM-DD-YYYY-MM-DD.json
  const m = fileName.match(/^(deadly-assault)-(\d{4}-\d{2}-\d{2})-(\d{4}-\d{2}-\d{2})\.json$/);
  if (m) {
    const end = new Date(m[3] + 'T00:00:00Z').getTime();
    return Number.isNaN(end) ? null : end;
  }
  return null;
}

function parseWindowFromFilename(fileName: string): { start?: string; end?: string } {
  const m = fileName.match(/^(deadly-assault)-(\d{4}-\d{2}-\d{2})-(\d{4}-\d{2}-\d{2})\.json$/);
  if (m) {
    return { start: m[2], end: m[3] };
  }
  return {};
}

function parseScheduleIdFromFilename(fileName: string): number | null {
  const m = fileName.match(/^deadly-assault-(\d+)\.json$/);
  if (m) {
    const id = Number(m[1]);
    return Number.isNaN(id) ? null : id;
  }
  return null;
}

export async function getLatestDeadlyAssaultData(): Promise<DeadlyAssaultData | null> {
  try {
    // Get list of files in the directory
    const allFiles = await readdir(DATA_DIR);
    
    // Filter out files with "unknown-id" (created when session expires)
    const files = allFiles.filter(f => !f.includes('unknown-id'));
    
    if (files.length === 0) {
      return null;
    }

    // Prefer ID-based naming (newer scheme), fallback to legacy date-based naming
    const withEnd = files
      .map((f) => ({ f, end: parseEndDateFromFilename(f) }))
      .filter((x) => x.end !== null) as { f: string; end: number }[];

    const withSchedule = files
      .map((f) => ({ f, id: parseScheduleIdFromFilename(f) }))
      .filter((x) => x.id !== null) as { f: string; id: number }[];

    let latestFile: string;
    if (withSchedule.length > 0) {
      withSchedule.sort((a, b) => b.id - a.id);
      latestFile = withSchedule[0].f;
    } else if (withEnd.length > 0) {
      withEnd.sort((a, b) => b.end - a.end);
      latestFile = withEnd[0].f;
    } else {
      // Fallback: previous behavior (lexicographic reverse)
      latestFile = files.sort().reverse()[0];
    }

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
    const allFiles = await readdir(DATA_DIR);
    
    // Filter out files with "unknown-id" (created when session expires)
    const files = allFiles.filter(f => !f.includes('unknown-id'));
    // Prefer sorting by ID-based naming (newer), then include legacy date-based files
    const withSchedule = files
      .map((f) => ({ f, id: parseScheduleIdFromFilename(f) }))
      .filter((x) => x.id !== null) as { f: string; id: number }[];

    const withEnd = files
      .map((f) => ({ f, end: parseEndDateFromFilename(f) }))
      .filter((x) => x.end !== null && !withSchedule.some((s) => s.f === x.f)) as { f: string; end: number }[];

    let ordered: string[];
    if (withSchedule.length > 0 || withEnd.length > 0) {
      withSchedule.sort((a, b) => b.id - a.id);
      withEnd.sort((a, b) => b.end - a.end);
      ordered = [...withSchedule.map((x) => x.f), ...withEnd.map((x) => x.f)];
    } else {
      ordered = files.sort().reverse();
    }

    const dataPromises = ordered.map(async (file) => {
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

export async function getDeadlyAssaultIndex(): Promise<Array<{ file: string; start?: string; end?: string }>> {
  try {
    const allFiles = await readdir(DATA_DIR);
    
    // Filter out files with "unknown-id" (created when session expires)
    const files = allFiles.filter(f => !f.includes('unknown-id'));
    
    const withEnd = files
      .map((f) => ({
        f,
        id: parseScheduleIdFromFilename(f),
        endTs: parseEndDateFromFilename(f),
        ...parseWindowFromFilename(f)
      }))
      .sort((a, b) => {
        if (a.id !== null && b.id !== null) return b.id - a.id;
        if (a.id !== null) return -1;
        if (b.id !== null) return 1;
        if (a.endTs !== null && b.endTs !== null) return (b.endTs! - a.endTs!);
        return b.f.localeCompare(a.f);
      });
    return withEnd.map(({ f, start, end }) => ({ file: f, start, end }));
  } catch (error) {
    console.error('Error reading deadly assault index:', error);
    return [];
  }
}

export async function getDeadlyAssaultDataByFile(fileName: string): Promise<DeadlyAssaultData | null> {
  try {
    const filePath = path.join(DATA_DIR, fileName);
    const fileContent = await readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as DeadlyAssaultData;
  } catch (error) {
    console.error('Error reading deadly assault data by file:', error);
    return null;
  }
}
