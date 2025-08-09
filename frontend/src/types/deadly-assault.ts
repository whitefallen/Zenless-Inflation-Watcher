export interface DeadlyAssaultData {
  retcode: number;
  message: string;
  data: {
    start_time: TimeStamp;
    end_time: TimeStamp;
    rank_percent: number;
    list: DeadlyAssaultRun[];
    has_data: boolean;
    nick_name: string;
    avatar_icon: string;
    total_score: number;
    total_star: number;
    zone_id: number;
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

export interface DeadlyAssaultRun {
  score: number;
  star: number;
  total_star: number;
  challenge_time: TimeStamp;
  boss: Boss[];
  buffer: Buffer[];
  avatar_list: Avatar[];
  buddy: Buddy;
}

export interface Boss {
  icon: string;
  name: string;
  race_icon: string;
  bg_icon: string;
}

export interface Buffer {
  icon: string;
  desc: string;
  name: string;
}

export interface Avatar {
  id: number;
  level: number;
  element_type: number;
  avatar_profession: number;
  rarity: string;
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
