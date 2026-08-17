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
  /**
   * Separate hard track introduced by hadal_mem_detail_v2. Scored on its own —
   * total_score / total_max_score / rank_percent describe `runs` only.
   */
  has_hard?: boolean;
  hard_rank_percent?: number;
  hard_runs?: DARun[];
}

export interface HoloClear {
  boss?: string;
  boss_icon?: string;
  medal_icon?: string;
  medal_id?: number;
  /** Cleared without taking damage — the medal condition. */
  no_injured: boolean;
  rank: number;
  star: number;
  /** Clear duration in seconds. The API sends this as a TimeStamp-shaped
   *  duration (hour/minute/second), not a wall-clock time. */
  clear_seconds: number;
  avatars: AvatarInfo[];
}

export interface HoloBossSeason {
  /** Derived from start_time (YYYYMMDD) — the payload carries no zone id. */
  season_id: number;
  start_time?: TimeStamp;
  end_time?: TimeStamp;
  unlock: boolean;
  total_star: number;
  /** Count of clears earning the no-damage medal. */
  flawless: number;
  clears: HoloClear[];
}

export interface ZZZData {
  shiyu: ShiyuPeriod[];
  voidFront: VoidFrontPeriod[];
  deadlyAssault: DeadlyAssaultPeriod[];
  holoBoss: HoloBossSeason[];
}
