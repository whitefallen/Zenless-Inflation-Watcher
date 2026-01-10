// Legacy format (v1) - still supported for old data
export interface ShiyuDefenseData {
  retcode: number;
  message: string;
  data: {
    schedule_id: number;
    begin_time: string;
    end_time: string;
    rating_list: Rating[];
    has_data: boolean;
    all_floor_detail: FloorDetail[];
    fast_layer_time: number;
    max_layer: number;
    hadal_begin_time: TimeStamp;
    hadal_end_time: TimeStamp;
    battle_time_47: number;
  };
  metadata?: {
    exportDate: string;
    uid: string;
    type: string;
    automated: boolean;
  };
}

// New Hadal v2 format (Floor 5 expansion)
export interface HadalInfoV2Data {
  retcode: number;
  message: string;
  data: {
    hadal_ver: string;
    hadal_info_v2: HadalInfoV2;
    nick_name: string;
    icon: string;
  };
  metadata?: {
    exportDate: string;
    uid: string;
    type: string;
    automated: boolean;
  };
}

export interface HadalInfoV2 {
  zone_id: number;
  hadal_begin_time: TimeStamp;
  hadal_end_time: TimeStamp;
  pass_fifth_floor: boolean;
  brief: HadalBrief;
  fitfh_layer_detail: FifthLayerDetail;
  fourth_layer_detail: FourthLayerDetail;
  begin_time: string;
  end_time: string;
}

export interface HadalBrief {
  cur_period_zone_layer_count: number;
  score: number;
  rank_percent: number;
  battle_time: number;
  rating: string;
  challenge_time: TimeStamp;
  max_score: number;
}

export interface FifthLayerDetail {
  layer_challenge_info_list: LayerChallengeInfo[];
}

export interface FourthLayerDetail {
  buffer: BufferInfo;
  challenge_time: TimeStamp;
  rating: string;
  layer_challenge_info_list: FourthLayerChallengeInfo[];
}

export interface LayerChallengeInfo {
  layer_id: number;
  rating: string;
  buffer: BufferInfo;
  score: number;
  avatar_list: Avatar[];
  buddy: Buddy;
  battle_time: number;
  monster_pic: string;
  max_score: number;
}

export interface FourthLayerChallengeInfo {
  layer_id: number;
  battle_time: number;
  avatar_list: Avatar[];
  buddy: Buddy;
}

export interface BufferInfo {
  title: string;
  text: string;
}

export interface TimeStamp {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface Rating {
  times: number;
  rating: string;
}

export interface FloorDetail {
  layer_index: number;
  rating: string;
  layer_id: number;
  buffs: Buff[];
  node_1: Node;
  node_2: Node;
  challenge_time: string;
  zone_name: string;
  floor_challenge_time: TimeStamp;
}

export interface Buff {
  title: string;
  text: string;
}

export interface Node {
  avatars: Avatar[];
  buddy: Buddy;
  element_type_list: number[];
  monster_info: MonsterInfo;
  battle_time: number;
}

export interface Avatar {
  id: number;
  level: number;
  rarity: string;
  element_type: number;
  avatar_profession: number;
  rank: number;
  role_square_url: string;
  sub_element_type: number;
}

export interface Buddy {
  id: number;
  rarity: string;
  level: number;
  bangboo_rectangle_url: string;
}

export interface MonsterInfo {
  level: number;
  list: Monster[];
}

export interface Monster {
  id: number;
  name: string;
  weak_element_type: number;
  ice_weakness: number;
  fire_weakness: number;
  elec_weakness: number;
  ether_weakness: number;
  physics_weakness: number;
  icon_url: string;
  race_icon: string;
  bg_icon: string;
}

// Union type for both formats
export type ShiyuDefenseDataAny = ShiyuDefenseData | HadalInfoV2Data;

// Type guard to check if data is Hadal v2 format
export function isHadalV2Data(data: ShiyuDefenseDataAny): data is HadalInfoV2Data {
  return 'data' in data && 'hadal_ver' in data.data && data.data.hadal_ver === 'v2';
}
