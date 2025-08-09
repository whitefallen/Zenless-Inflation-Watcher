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
