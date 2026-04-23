import { Player, ScoringWeights } from "./types";
import { calculateFantasyPoints, DEFAULT_WEIGHTS, getPointsBreakdown } from "./scoring";
import { getTeamGameCounts } from "@/data/schedule";

export interface StartSitRecommendation {
  player: Player;
  recommendation: "START" | "SIT" | "FLEX";
  reason: string;
  confidence: number;
  weeklyProjection: number;
}

export function getStartSitRecommendations(
  roster: Player[],
  week: number,
  rosterSize: number = 8
): StartSitRecommendation[] {
  const gameCounts = getTeamGameCounts(week);

  const recommendations = roster.map((player) => {
    const fp = player.fantasyPoints ?? calculateFantasyPoints(player.stats);
    const games = gameCounts[player.teamAbbr] ?? 2;
    const weeklyProjection = fp * games;
    const avgGames = 2.5;
    const scheduleBoost = games / avgGames;

    let confidence = 0;
    let recommendation: "START" | "SIT" | "FLEX" = "FLEX";
    const reasons: string[] = [];

    if (fp >= 35) {
      recommendation = "START";
      confidence = 95;
      reasons.push("Elite producer");
    } else if (fp >= 25) {
      recommendation = "START";
      confidence = 80;
      reasons.push("Strong starter");
    } else if (fp >= 18) {
      recommendation = "FLEX";
      confidence = 55;
      reasons.push("Matchup dependent");
    } else {
      recommendation = "SIT";
      confidence = 70;
      reasons.push("Below replacement value");
    }

    if (games >= 4) {
      confidence = Math.min(confidence + 15, 99);
      reasons.push(`${games} games this week`);
      if (recommendation === "SIT" && fp >= 14) recommendation = "FLEX";
      if (recommendation === "FLEX") recommendation = "START";
    } else if (games >= 3) {
      confidence = Math.min(confidence + 8, 99);
      reasons.push(`${games} games this week`);
    } else if (games <= 1) {
      confidence = Math.max(confidence - 15, 20);
      reasons.push(`Only ${games} game this week`);
      if (recommendation === "FLEX") recommendation = "SIT";
      if (recommendation === "START" && fp < 35) recommendation = "FLEX";
    }

    if (player.stats.minutesPerGame >= 32) {
      confidence = Math.min(confidence + 5, 99);
      reasons.push("High minutes");
    }

    return {
      player,
      recommendation,
      reason: reasons.join(" + "),
      confidence,
      weeklyProjection,
    };
  });

  recommendations.sort((a, b) => b.weeklyProjection - a.weeklyProjection);
  return recommendations;
}

export function calculateWinProbability(teamA: Player[], teamB: Player[], week: number): number {
  const gameCounts = getTeamGameCounts(week);

  function weeklyTotal(team: Player[]) {
    return team.reduce((sum, p) => {
      const fp = p.fantasyPoints ?? calculateFantasyPoints(p.stats);
      const games = gameCounts[p.teamAbbr] ?? 2;
      return sum + fp * games;
    }, 0);
  }

  const projA = weeklyTotal(teamA);
  const projB = weeklyTotal(teamB);

  if (projA === 0 && projB === 0) return 50;

  const variance = 0.15;
  const diff = projA - projB;
  const pooled = (projA + projB) / 2;
  const stdDev = pooled * variance;

  if (stdDev === 0) return projA > projB ? 95 : 5;

  const z = diff / (stdDev * Math.sqrt(2));
  const probability = 0.5 * (1 + erf(z));

  return Math.round(Math.min(Math.max(probability * 100, 2), 98));
}

function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const result = 1 - poly * Math.exp(-x * x);
  return x >= 0 ? result : -result;
}

export interface TradeImpact {
  netFP: number;
  categoryImpacts: {
    category: string;
    before: number;
    after: number;
    change: number;
  }[];
  verdict: {
    label: string;
    color: string;
    detail: string;
  };
  suggestedCounterValue: number;
}

export function analyzeTradeImpact(
  currentRoster: Player[],
  giving: Player[],
  receiving: Player[]
): TradeImpact {
  const givingFP = giving.reduce((sum, p) => sum + (p.fantasyPoints ?? 0), 0);
  const receivingFP = receiving.reduce((sum, p) => sum + (p.fantasyPoints ?? 0), 0);
  const netFP = receivingFP - givingFP;

  const categories = ["scoring", "rebounds", "assists", "steals", "blocks", "turnovers", "threePointers"] as const;
  const categoryLabels: Record<string, string> = {
    scoring: "Scoring", rebounds: "Rebounds", assists: "Assists",
    steals: "Steals", blocks: "Blocks", turnovers: "Turnovers", threePointers: "3-Pointers",
  };

  function getCatTotals(players: Player[]) {
    return players.reduce(
      (acc, p) => {
        const b = getPointsBreakdown(p.stats);
        categories.forEach((c) => { acc[c] = (acc[c] ?? 0) + b[c]; });
        return acc;
      },
      {} as Record<string, number>
    );
  }

  const beforeCats = getCatTotals(currentRoster);
  const afterRoster = currentRoster.filter((p) => !giving.some((g) => g.id === p.id)).concat(receiving);
  const afterCats = getCatTotals(afterRoster);

  const categoryImpacts = categories.map((cat) => ({
    category: categoryLabels[cat],
    before: beforeCats[cat] ?? 0,
    after: afterCats[cat] ?? 0,
    change: (afterCats[cat] ?? 0) - (beforeCats[cat] ?? 0),
  }));

  const pct = givingFP > 0 ? (netFP / givingFP) * 100 : 0;
  let verdict: TradeImpact["verdict"];

  if (Math.abs(pct) < 5) {
    verdict = { label: "Fair Trade", color: "#10b981", detail: "Within 5% of equal value" };
  } else if (pct > 15) {
    verdict = { label: "Strong Win", color: "#f59e0b", detail: `You gain ${netFP.toFixed(1)} FP per game` };
  } else if (pct > 5) {
    verdict = { label: "Slight Win", color: "#3b82f6", detail: `You gain ${netFP.toFixed(1)} FP per game` };
  } else if (pct < -15) {
    verdict = { label: "Bad Deal", color: "#ef4444", detail: `You lose ${Math.abs(netFP).toFixed(1)} FP per game` };
  } else {
    verdict = { label: "Slight Loss", color: "#f97316", detail: `You lose ${Math.abs(netFP).toFixed(1)} FP per game` };
  }

  return {
    netFP,
    categoryImpacts,
    verdict,
    suggestedCounterValue: givingFP,
  };
}
