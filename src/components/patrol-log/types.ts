export interface TimeStamp {
  year: number; month: number; day: number;
  hour?: number; minute?: number; second?: number;
}

export interface AvatarInfo {
  id: number;
  url?: string;
  element: number;
  profession: number;
  rarity: 'S' | 'A';
  rank: number;
}

export interface ShiyuBrief {
  score: number;
  rating: string;
  rank_percent: number;
}

export interface ShiyuLayer {
  layer_id: number;
  score: number;
  rating: string;
  challenge_time: TimeStamp;
  avatars: AvatarInfo[];
  bosses?: Array<{ id: number; name: string }>;
}

export interface ShiyuPeriod {
  zone_id: number;
  begin: TimeStamp;
  end: TimeStamp;
  pass5: boolean;
  brief: ShiyuBrief;
  layers: ShiyuLayer[];
}

export interface VFBoss {
  id: number;
  name: string;
}

export interface VFChallenge {
  id: number;
  name: string;
  score: number;
  score_ratio?: number;
  star?: number;
  avatars: AvatarInfo[];
}

export interface VoidFrontPeriod {
  schedule_id: number;
  total_score: number;
  max_score?: number;
  rank_percent?: number;
  boss?: VFBoss;
  main?: { score_ratio?: number; star?: number };
  ending?: string;
  challenges?: VFChallenge[];
}

export interface DABoss {
  id: number;
  name: string;
}

export interface DARun {
  boss: DABoss[];
  score: number;
  star: number;
  total_star?: number;
  challenge_time: TimeStamp;
  avatars: AvatarInfo[];
}

export interface DeadlyAssaultPeriod {
  schedule_id: number;
  zone_id?: number;
  total_score: number;
  total_max_score?: number;
  room_max_score?: number;
  total_star: number;
  rank_percent: number;
  begin_time: TimeStamp;
  end_time: TimeStamp;
  runs: DARun[];
}

export interface ZZZData {
  shiyu: ShiyuPeriod[];
  voidFront: VoidFrontPeriod[];
  deadlyAssault: DeadlyAssaultPeriod[];
}
