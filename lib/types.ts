export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  pin_hash?: string;
  created_at?: string;
}

export interface Booking {
  id: string;
  player_id: string;
  game_title: string;
  start_time: string; // ISO 8601 string
  end_time: string;   // ISO 8601 string
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: string;
  player?: Player;
}

export interface AvatarOption {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
}

export interface PopularGame {
  id: string;
  title: string;
  icon: string;
  color: string;
}

export type CalendarViewMode = 'week' | 'day';

export interface HouseRule {
  id: string;
  title: string;
  description: string;
  icon: string;
}
