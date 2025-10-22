import { Avatar, Boss, Buffer, Buddy, TimeStamp } from './deadly-assault';

export interface VoidFrontData {
  retcode: number;
  message: string;
  data: {
    void_front_battle_abstract_info_brief: {
      void_front_id: number;
      end_ts_over_42_days: boolean;
      end_ts: number;
      has_ending_record: boolean;
      ending_record_name: string;
      ending_record_bg_pic: string;
      total_score: number;
      rank_percent: number;
      max_score: number;
      left_ts: number;
      ending_record_id: number;
    };
    boss_challenge_record: {
      boss_info: Boss;
      main_challenge_record: VoidFrontChallenge;
      sub_challenge_record: VoidFrontSubChallenge[];
    };
    main_challenge_record_list: VoidFrontChallenge[];
    role_basic_info: {
      server: string;
      nickname: string;
      icon: string;
    };
  };
  metadata?: {
    exportDate: string;
    uid: string;
    type: string;
    automated: boolean;
  };
}

export interface VoidFrontChallenge {
  battle_id: number;
  node_id: number;
  name: string;
  score: number;
  star: string;
  score_ratio: string;
  challenge_time: TimeStamp;
  buffer: Buffer;
  max_score: number;
  avatar_list: Avatar[];
  buddy: Buddy;
  sub_challenge_record?: VoidFrontSubChallenge[];
}

export interface VoidFrontSubChallenge {
  battle_id: number;
  name: string;
  star: string;
  avatar_list: Avatar[];
  buddy: Buddy;
  buffer: Buffer;
}