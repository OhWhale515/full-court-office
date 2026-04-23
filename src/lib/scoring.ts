import { Player, PlayerStats, ScoringWeights } from "./types";

export const DEFAULT_WEIGHTS: ScoringWeights = {
  points: 1,
  rebounds: 1.2,
  assists: 1.5,
  steals: 2,
  blocks: 2,
  turnovers: -1,
  threePointersMade: 1,
};

export function calculateFantasyPoints(
  stats: PlayerStats,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  return (
    stats.pointsPerGame * weights.points +
    stats.reboundsPerGame * weights.rebounds +
    stats.assistsPerGame * weights.assists +
    stats.stealsPerGame * weights.steals +
    stats.blocksPerGame * weights.blocks +
    stats.turnoversPerGame * weights.turnovers +
    stats.threePMPerGame * weights.threePointersMade
  );
}

export function rankPlayers(
  players: Player[],
  weights: ScoringWeights = DEFAULT_WEIGHTS
): Player[] {
  const scored = players.map((p) => ({
    ...p,
    fantasyPoints: calculateFantasyPoints(p.stats, weights),
  }));

  scored.sort((a, b) => (b.fantasyPoints ?? 0) - (a.fantasyPoints ?? 0));

  return scored.map((p, i) => ({ ...p, rank: i + 1 }));
}

export function getPointsBreakdown(
  stats: PlayerStats,
  weights: ScoringWeights = DEFAULT_WEIGHTS
) {
  return {
    scoring: stats.pointsPerGame * weights.points,
    rebounds: stats.reboundsPerGame * weights.rebounds,
    assists: stats.assistsPerGame * weights.assists,
    steals: stats.stealsPerGame * weights.steals,
    blocks: stats.blocksPerGame * weights.blocks,
    turnovers: stats.turnoversPerGame * weights.turnovers,
    threePointers: stats.threePMPerGame * weights.threePointersMade,
  };
}

export function getValueCategory(fantasyPoints: number): string {
  if (fantasyPoints >= 45) return "Elite";
  if (fantasyPoints >= 35) return "Star";
  if (fantasyPoints >= 25) return "Starter";
  if (fantasyPoints >= 18) return "Role Player";
  if (fantasyPoints >= 12) return "Bench";
  return "Deep Bench";
}

export function getValueColor(fantasyPoints: number): string {
  if (fantasyPoints >= 45) return "#f59e0b";
  if (fantasyPoints >= 35) return "#8b5cf6";
  if (fantasyPoints >= 25) return "#3b82f6";
  if (fantasyPoints >= 18) return "#10b981";
  if (fantasyPoints >= 12) return "#6b7280";
  return "#374151";
}
