import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { VoidFrontData, VoidFrontDataV2, isVoidFrontV2 } from '@/types/void-front';

const DATA_DIR = path.join(process.cwd(), 'voidFront');

function normalizeV2(raw: VoidFrontDataV2): VoidFrontData {
  const detail = raw.data.void_front_battle_detail;
  return {
    retcode: raw.retcode,
    message: raw.message,
    data: {
      void_front_battle_abstract_info_brief: detail.void_front_battle_abstract_info_brief,
      boss_challenge_record: detail.boss_challenge_record,
      main_challenge_record_list: detail.main_challenge_record_list,
      role_basic_info: detail.role_basic_info,
    },
    metadata: raw.metadata,
  };
}

function parseIdFromFilename(f: string): number | null {
  const m = f.match(/^void-front-(\d+)\.json$/);
  return m ? parseInt(m[1], 10) : null;
}

async function loadFile(fileName: string): Promise<VoidFrontData | null> {
  try {
    const content = await readFile(path.join(DATA_DIR, fileName), 'utf-8');
    const raw = JSON.parse(content) as VoidFrontData | VoidFrontDataV2;
    if (!raw?.data || raw.retcode !== 0) return null;
    if (isVoidFrontV2(raw)) return normalizeV2(raw);
    return raw as VoidFrontData;
  } catch {
    return null;
  }
}

export async function getAllVoidFrontData(): Promise<VoidFrontData[]> {
  try {
    const all = await readdir(DATA_DIR);
    const files = all.filter(f => !f.includes('unknown-id') && f.endsWith('.json'));

    const withId = files
      .map(f => ({ f, id: parseIdFromFilename(f) }))
      .filter((x): x is { f: string; id: number } => x.id !== null)
      .sort((a, b) => b.id - a.id);

    const results = await Promise.all(withId.map(x => loadFile(x.f)));
    return results.filter((d): d is VoidFrontData => d !== null);
  } catch {
    return [];
  }
}

export async function getLatestVoidFrontData(): Promise<VoidFrontData | null> {
  const all = await getAllVoidFrontData();
  return all[0] ?? null;
}

export async function getVoidFrontDataByFile(fileName: string): Promise<VoidFrontData | null> {
  return loadFile(fileName);
}
