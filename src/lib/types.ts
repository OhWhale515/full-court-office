export interface Player {
  id: string;
  name: string;
  team: string;
  teamAbbr: string;
  position: string;
  number: string;
  height: string;
  stats: PlayerStats;
  fantasyPoints?: number;
  rank?: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  minutesPerGame: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  stealsPerGame: number;
  blocksPerGame: number;
  turnoversPerGame: number;
  threePMPerGame: number;
  fgPercent: number;
  ftPercent: number;
}

export interface ScoringWeights {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  threePointersMade: number;
}

export interface TeamInfo {
  name: string;
  abbr: string;
  city: string;
  conference: string;
  color: string;
}

export type SortField =
  | "rank"
  | "name"
  | "team"
  | "position"
  | "fantasyPoints"
  | "pointsPerGame"
  | "reboundsPerGame"
  | "assistsPerGame"
  | "stealsPerGame"
  | "blocksPerGame"
  | "turnoversPerGame"
  | "threePMPerGame";

export type SortDirection = "asc" | "desc";
