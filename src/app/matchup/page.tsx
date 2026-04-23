"use client";

import { useState, useMemo } from "react";
import { WNBA_PLAYERS } from "@/data/players";
import { WNBA_SCHEDULE, CURRENT_WEEK, getTeamGameCounts } from "@/data/schedule";
import { rankPlayers, getValueColor, getPointsBreakdown } from "@/lib/scoring";
import { getStartSitRecommendations, calculateWinProbability } from "@/lib/analysis";
import type { Player } from "@/lib/types";
import ShareButton from "@/components/ShareButton";
import type { ShareableLineup } from "@/lib/share";

export default function MatchupPage() {
  const rankedPlayers = useMemo(() => rankPlayers(WNBA_PLAYERS), []);
  const [teamA, setTeamA] = useState<Player[]>([]);
  const [teamB, setTeamB] = useState<Player[]>([]);
  const [activeTeam, setActiveTeam] = useState<"A" | "B">("A");
  const [search, setSearch] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(CURRENT_WEEK);

  const gameCounts = useMemo(() => getTeamGameCounts(selectedWeek), [selectedWeek]);

  const available = useMemo(() => {
    const selected = new Set([...teamA, ...teamB].map((p) => p.id));
    return rankedPlayers.filter(
      (p) => !selected.has(p.id) && (search === "" || p.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [rankedPlayers, teamA, teamB, search]);

  function addPlayer(player: Player) {
    const target = activeTeam === "A" ? teamA : teamB;
    if (target.length >= 8) return;
    if (activeTeam === "A") setTeamA([...teamA, player]);
    else setTeamB([...teamB, player]);
  }

  function removePlayer(team: "A" | "B", id: string) {
    if (team === "A") setTeamA(teamA.filter((p) => p.id !== id));
    else setTeamB(teamB.filter((p) => p.id !== id));
  }

  const recsA = useMemo(() => getStartSitRecommendations(teamA, selectedWeek), [teamA, selectedWeek]);
  const recsB = useMemo(() => getStartSitRecommendations(teamB, selectedWeek), [teamB, selectedWeek]);

  const weeklyA = recsA.reduce((sum, r) => sum + r.weeklyProjection, 0);
  const weeklyB = recsB.reduce((sum, r) => sum + r.weeklyProjection, 0);
  const winProb = useMemo(
    () => (teamA.length > 0 && teamB.length > 0 ? calculateWinProbability(teamA, teamB, selectedWeek) : null),
    [teamA, teamB, selectedWeek]
  );

  const showComparison = teamA.length > 0 && teamB.length > 0;

  function getCategoryTotals(team: Player[]) {
    return team.reduce(
      (acc, p) => {
        const b = getPointsBreakdown(p.stats);
        const games = gameCounts[p.teamAbbr] ?? 2;
        return {
          scoring: acc.scoring + b.scoring * games,
          rebounds: acc.rebounds + b.rebounds * games,
          assists: acc.assists + b.assists * games,
          steals: acc.steals + b.steals * games,
          blocks: acc.blocks + b.blocks * games,
          turnovers: acc.turnovers + b.turnovers * games,
          threePointers: acc.threePointers + b.threePointers * games,
        };
      },
      { scoring: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, threePointers: 0 }
    );
  }

  const catA = getCategoryTotals(teamA);
  const catB = getCategoryTotals(teamB);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold mb-1">Matchup Analyzer</h1>
          <p className="text-muted text-sm">Build rosters, get start/sit recs, and see win probability</p>
        </div>
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        >
          {WNBA_SCHEDULE.map((w) => (
            <option key={w.week} value={w.week}>
              Week {w.week} ({w.startDate.slice(5)} - {w.endDate.slice(5)})
            </option>
          ))}
        </select>
      </div>

      {/* Win Probability Banner */}
      {winProb !== null && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-blue">Your Team</span>
            <span className="text-sm font-semibold uppercase tracking-wider text-muted">Win Probability</span>
            <span className="text-sm font-semibold text-accent">Opponent</span>
          </div>
          <div className="relative h-8 bg-background rounded-full overflow-hidden mb-3">
            <div
              className="absolute inset-y-0 left-0 bg-blue/80 rounded-l-full transition-all duration-700"
              style={{ width: `${winProb}%` }}
            />
            <div
              className="absolute inset-y-0 right-0 bg-accent/80 rounded-r-full transition-all duration-700"
              style={{ width: `${100 - winProb}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white drop-shadow-md">
                {winProb}% - {100 - winProb}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Projected: {weeklyA.toFixed(0)} FP (Week {selectedWeek})</span>
            <span>Projected: {weeklyB.toFixed(0)} FP (Week {selectedWeek})</span>
          </div>
        </div>
      )}

      {/* Team selector tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTeam("A")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTeam === "A" ? "bg-blue text-white" : "bg-card text-muted hover:text-foreground"}`}
        >
          Your Team ({teamA.length}/8)
        </button>
        <button
          onClick={() => setActiveTeam("B")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTeam === "B" ? "bg-accent text-white" : "bg-card text-muted hover:text-foreground"}`}
        >
          Opponent ({teamB.length}/8)
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Team A with Start/Sit */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-blue">Your Team</h2>
            <span className="text-lg font-bold">{weeklyA.toFixed(0)} <span className="text-xs text-muted">wk</span></span>
          </div>
          {teamA.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">Select players from the pool</p>
          ) : (
            <div className="space-y-2">
              {recsA.map((rec) => (
                <RosterSlotEnhanced
                  key={rec.player.id}
                  rec={rec}
                  games={gameCounts[rec.player.teamAbbr] ?? 0}
                  onRemove={() => removePlayer("A", rec.player.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Player Pool */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
            Player Pool <span className="text-xs font-normal">({activeTeam === "A" ? "Your Team" : "Opponent"})</span>
          </h2>
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-accent"
          />
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {available.slice(0, 40).map((p) => {
              const games = gameCounts[p.teamAbbr] ?? 0;
              return (
                <button
                  key={p.id}
                  onClick={() => addPlayer(p)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-card-hover transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-xs text-muted">{p.teamAbbr}</span>
                    <span className="text-xs px-1 rounded bg-background text-muted">{p.position}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {games >= 3 && <span className="text-xs text-green font-medium">{games}G</span>}
                    {games <= 1 && games > 0 && <span className="text-xs text-red font-medium">{games}G</span>}
                    <span className="text-xs font-bold" style={{ color: getValueColor(p.fantasyPoints ?? 0) }}>
                      {(p.fantasyPoints ?? 0).toFixed(1)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Team B with Start/Sit */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">Opponent</h2>
            <span className="text-lg font-bold">{weeklyB.toFixed(0)} <span className="text-xs text-muted">wk</span></span>
          </div>
          {teamB.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">Select players from the pool</p>
          ) : (
            <div className="space-y-2">
              {recsB.map((rec) => (
                <RosterSlotEnhanced
                  key={rec.player.id}
                  rec={rec}
                  games={gameCounts[rec.player.teamAbbr] ?? 0}
                  onRemove={() => removePlayer("B", rec.player.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share Buttons */}
      {teamA.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex items-center gap-2">
            {teamA.length > 0 && (
              <ShareButton
                lineup={{
                  name: "My Team",
                  players: teamA,
                  totalFP: weeklyA,
                  createdAt: new Date().toISOString(),
                }}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {teamB.length > 0 && (
              <ShareButton
                lineup={{
                  name: "Opponent",
                  players: teamB,
                  totalFP: weeklyB,
                  createdAt: new Date().toISOString(),
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Weekly Category Comparison */}
      {showComparison && (
        <div className="bg-card border border-border rounded-xl p-5 mt-6 animate-fade-in">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
            Week {selectedWeek} Category Projection
          </h2>
          <div className="space-y-4">
            {(["scoring", "rebounds", "assists", "steals", "blocks", "threePointers", "turnovers"] as const).map((cat) => {
              const a = catA[cat];
              const b = catB[cat];
              const max = Math.max(Math.abs(a), Math.abs(b), 1);
              const label = cat === "threePointers" ? "3-Pointers" : cat === "turnovers" ? "Turnovers" : cat.charAt(0).toUpperCase() + cat.slice(1);

              return (
                <div key={cat} className="flex items-center gap-4">
                  <div className="w-16 text-right">
                    <span className={`text-sm font-bold ${cat !== "turnovers" && a > b ? "text-blue" : cat === "turnovers" && a < b ? "text-blue" : "text-muted"}`}>
                      {a.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center gap-1">
                    <div className="flex-1 h-2 bg-background rounded-full overflow-hidden flex justify-end">
                      <div className="h-full rounded-full bg-blue stat-bar" style={{ width: `${(Math.abs(a) / max) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted w-20 text-center">{label}</span>
                    <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-accent stat-bar" style={{ width: `${(Math.abs(b) / max) * 100}%` }} />
                    </div>
                  </div>
                  <div className="w-16">
                    <span className={`text-sm font-bold ${cat !== "turnovers" && b > a ? "text-accent" : cat === "turnovers" && b < a ? "text-accent" : "text-muted"}`}>
                      {b.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-blue">{weeklyA.toFixed(0)}</p>
              <p className="text-xs text-muted">Your Week {selectedWeek} Total</p>
            </div>
            <div className="text-center px-4">
              <p className={`text-lg font-bold ${winProb !== null && winProb >= 50 ? "text-blue" : "text-accent"}`}>
                {winProb !== null ? `${Math.max(winProb, 100 - winProb)}%` : "vs"}
              </p>
              <p className="text-xs text-muted">
                {winProb !== null ? (winProb >= 50 ? "favors you" : "favors opponent") : ""}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-accent">{weeklyB.toFixed(0)}</p>
              <p className="text-xs text-muted">Opponent Week {selectedWeek} Total</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RosterSlotEnhanced({
  rec,
  games,
  onRemove,
}: {
  rec: ReturnType<typeof getStartSitRecommendations>[0];
  games: number;
  onRemove: () => void;
}) {
  const fp = rec.player.fantasyPoints ?? 0;
  const recColor =
    rec.recommendation === "START" ? "text-green" : rec.recommendation === "SIT" ? "text-red" : "text-gold";
  const recBg =
    rec.recommendation === "START" ? "bg-green/10" : rec.recommendation === "SIT" ? "bg-red/10" : "bg-gold/10";

  return (
    <div className="p-2.5 rounded-lg bg-background group">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${recColor} ${recBg}`}>
            {rec.recommendation}
          </span>
          <span className="text-sm font-medium">{rec.player.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: getValueColor(fp) }}>{rec.weeklyProjection.toFixed(1)}</span>
          <button
            onClick={onRemove}
            className="text-muted hover:text-red opacity-0 group-hover:opacity-100 transition-opacity text-xs"
          >
            x
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted">
        <span>{rec.player.teamAbbr}</span>
        <span>{rec.player.position}</span>
        <span>{games}G this week</span>
        <span className="ml-auto">{rec.confidence}% confidence</span>
      </div>
      <p className="text-xs text-muted/70 mt-1">{rec.reason}</p>
    </div>
  );
}
