import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { ShiyuDefenseData, HadalInfoV2Data, isHadalV2Data, ShiyuDefenseDataAny, FloorDetail } from '@/types/shiyu-defense';

const DATA_DIR = path.join(process.cwd(), 'shiyu');

/**
 * Converts Hadal v2 format to legacy ShiyuDefenseData format for backward compatibility
 * NEW MAPPING: 5th floor = node 7, 4th floor = node 6
 * Supports iterating through 2-3 teams/bosses dynamically
 */
function normalizeHadalV2ToLegacy(v2Data: HadalInfoV2Data): ShiyuDefenseData {
  const { hadal_info_v2 } = v2Data.data;
  const allFloorDetails: FloorDetail[] = [];

  // 4th floor (node 6) - typically 2 teams/bosses
  if (hadal_info_v2.fourth_layer_detail?.layer_challenge_info_list) {
    hadal_info_v2.fourth_layer_detail.layer_challenge_info_list.forEach((layer, index) => {
      allFloorDetails.push({
        layer_index: 6,
        rating: hadal_info_v2.fourth_layer_detail.rating,
        layer_id: layer.layer_id,
        buffs: [hadal_info_v2.fourth_layer_detail.buffer],
        node_1: {
          avatars: layer.avatar_list,
          buddy: layer.buddy,
          element_type_list: [...new Set(layer.avatar_list.map(a => a.element_type))],
          monster_info: {
            level: 0,
            list: [{
              id: 0,
              name: `Boss ${index + 1}`,
              weak_element_type: 0,
              ice_weakness: 0,
              fire_weakness: 0,
              elec_weakness: 0,
              ether_weakness: 0,
              physics_weakness: 0,
              icon_url: '',
              race_icon: '',
              bg_icon: ''
            }]
          },
          battle_time: layer.battle_time
        },
        node_2: {
          avatars: [],
          buddy: { id: 0, rarity: 'S', level: 0, bangboo_rectangle_url: '' },
          element_type_list: [],
          monster_info: { level: 0, list: [] },
          battle_time: 0
        },
        challenge_time: hadal_info_v2.fourth_layer_detail.challenge_time.year.toString(),
        zone_name: `Fourth Floor - Team ${index + 1}`,
        floor_challenge_time: hadal_info_v2.fourth_layer_detail.challenge_time
      });
    });
  }

  // 5th floor (node 7) - typically 3 teams/bosses
  if (hadal_info_v2.fitfh_layer_detail?.layer_challenge_info_list) {
    hadal_info_v2.fitfh_layer_detail.layer_challenge_info_list.forEach((layer, index) => {
      allFloorDetails.push({
        layer_index: 7,
        rating: layer.rating,
        layer_id: layer.layer_id,
        buffs: [layer.buffer],
        node_1: {
          avatars: layer.avatar_list,
          buddy: layer.buddy,
          element_type_list: [...new Set(layer.avatar_list.map(a => a.element_type))],
          monster_info: {
            level: 0,
            list: [{
              id: 0,
              name: '',
              weak_element_type: 0,
              ice_weakness: 0,
              fire_weakness: 0,
              elec_weakness: 0,
              ether_weakness: 0,
              physics_weakness: 0,
              icon_url: layer.monster_pic,
              race_icon: '',
              bg_icon: ''
            }]
          },
          battle_time: layer.battle_time
        },
        node_2: {
          avatars: [],
          buddy: { id: 0, rarity: 'S', level: 0, bangboo_rectangle_url: '' },
          element_type_list: [],
          monster_info: { level: 0, list: [] },
          battle_time: 0
        },
        challenge_time: hadal_info_v2.brief.challenge_time.year.toString(),
        zone_name: `Fifth Floor - Team ${index + 1}`,
        floor_challenge_time: hadal_info_v2.brief.challenge_time
      });
    });
  }

  return {
    retcode: v2Data.retcode,
    message: v2Data.message,
    data: {
      schedule_id: hadal_info_v2.zone_id,
      begin_time: hadal_info_v2.begin_time,
      end_time: hadal_info_v2.end_time,
      rating_list: [{ times: 1, rating: hadal_info_v2.brief.rating }],
      has_data: true,
      all_floor_detail: allFloorDetails,
      fast_layer_time: hadal_info_v2.brief.battle_time,
      max_layer: 7, // Always 7 for new format (representing node 7)
      hadal_begin_time: hadal_info_v2.hadal_begin_time,
      hadal_end_time: hadal_info_v2.hadal_end_time,
      battle_time_47: 0
    },
    metadata: v2Data.metadata
  };
}

function parseEndDateFromFilename(fileName: string): number | null {
  // Expected new format: shiyu-defense-YYYY-MM-DD-YYYY-MM-DD.json
  const m = fileName.match(/^(shiyu-defense)-(\d{4}-\d{2}-\d{2})-(\d{4}-\d{2}-\d{2})\.json$/);
  if (m) {
    const end = new Date(m[3] + 'T00:00:00Z').getTime();
    return Number.isNaN(end) ? null : end;
  }
  return null;
}

function parseWindowFromFilename(fileName: string): { start?: string; end?: string } {
  const m = fileName.match(/^(shiyu-defense)-(\d{4}-\d{2}-\d{2})-(\d{4}-\d{2}-\d{2})\.json$/);
  if (m) {
    return { start: m[2], end: m[3] };
  }
  return {};
}

export async function getLatestShiyuDefenseData(): Promise<ShiyuDefenseData | null> {
  try {
    // Get list of files in the directory
    const allFiles = await readdir(DATA_DIR);
    
    // Filter out files with "unknown-id" (created when session expires)
    const files = allFiles.filter(f => !f.includes('unknown-id'));
    
    if (files.length === 0) {
      return null;
    }

    // Prefer new naming by end date
    const withEnd = files
      .map((f) => ({ f, end: parseEndDateFromFilename(f) }))
      .filter((x) => x.end !== null) as { f: string; end: number }[];

    let latestFile: string;
    if (withEnd.length > 0) {
      withEnd.sort((a, b) => b.end - a.end);
      latestFile = withEnd[0].f;
    } else {
      // Fallback: previous behavior (lexicographic reverse)
      latestFile = files.sort().reverse()[0];
    }

    const filePath = path.join(DATA_DIR, latestFile);
    const fileContent = await readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent) as ShiyuDefenseDataAny;
    
    // Convert Hadal v2 format to legacy format for compatibility
    if (isHadalV2Data(data)) {
      return normalizeHadalV2ToLegacy(data);
    }
    
    return data;
  } catch (error) {
    console.error('Error reading shiyu defense data:', error);
    return null;
  }
}

export async function getAllShiyuDefenseData(): Promise<ShiyuDefenseData[]> {
  try {
    const allFiles = await readdir(DATA_DIR);
    
    // Filter out files with "unknown-id" (created when session expires)
    const files = allFiles.filter(f => !f.includes('unknown-id'));
    // Prefer sorting by end date if possible
    const withEnd = files
      .map((f) => ({ f, end: parseEndDateFromFilename(f) }))
      .filter((x) => x.end !== null) as { f: string; end: number }[];

    let ordered: string[];
    if (withEnd.length > 0) {
      withEnd.sort((a, b) => b.end - a.end);
      ordered = withEnd.map((x) => x.f);
    } else {
      ordered = files.sort().reverse();
    }

    const dataPromises = ordered.map(async (file) => {
      const filePath = path.join(DATA_DIR, file);
      const fileContent = await readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent) as ShiyuDefenseDataAny;
      
      // Convert Hadal v2 format to legacy format for compatibility
      if (isHadalV2Data(data)) {
        return normalizeHadalV2ToLegacy(data);
      }
      
      return data;
    });

    return await Promise.all(dataPromises);
  } catch (error) {
    console.error('Error reading all shiyu defense data:', error);
    return [];
  }
}

export async function getShiyuDefenseIndex(): Promise<Array<{ file: string; start?: string; end?: string }>> {
  try {
    const allFiles = await readdir(DATA_DIR);
    
    // Filter out files with "unknown-id" (created when session expires)
    const files = allFiles.filter(f => !f.includes('unknown-id'));
    const withEnd = files
      .map((f) => ({ f, endTs: parseEndDateFromFilename(f), ...parseWindowFromFilename(f) }))
      .sort((a, b) => {
        if (a.endTs !== null && b.endTs !== null) return (b.endTs! - a.endTs!);
        return b.f.localeCompare(a.f);
      });
    return withEnd.map(({ f, start, end }) => ({ file: f, start, end }));
  } catch (error) {
    console.error('Error reading shiyu defense index:', error);
    return [];
  }
}

export async function getShiyuDefenseDataByFile(fileName: string): Promise<ShiyuDefenseData | null> {
  try {
    const filePath = path.join(DATA_DIR, fileName);
    const fileContent = await readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent) as ShiyuDefenseDataAny;
    
    // Convert Hadal v2 format to legacy format for compatibility
    if (isHadalV2Data(data)) {
      return normalizeHadalV2ToLegacy(data);
    }
    
    return data;
  } catch (error) {
    console.error('Error reading shiyu defense data by file:', error);
    return null;
  }
}

