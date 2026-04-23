"use client";

import { useState, useMemo } from "react";
import { WNBA_PLAYERS } from "@/data/players";
import { rankPlayers, getValueColor, getPointsBreakdown, getValueCategory, DEFAULT_WEIGHTS } from "@/lib/scoring";
import type { Player } from "@/lib/types";

export default function ComparePage() {
  const rankedPlayers = useMemo(() => rankPlayers(WNBA_PLAYERS), []);
  const [playerA, setPlayerA] = useState<Player | null>(null);
  const [playerB, setPlayerB] = useState<Player | null>(null);
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");

  const filteredA = rankedPlayers.filter(
    (p) => p.id !== playerB?.id && (searchA === "" || p.name.toLowerCase().includes(searchA.toLowerCase()))
  );
  const filteredB = rankedPlayers.filter(
    (p) => p.id !== playerA?.id && (searchB === "" || p.name.toLowerCase().includes(searchB.toLowerCase()))
  );

  const fpA = playerA?.fantasyPoints ?? 0;
  const fpB = playerB?.fantasyPoints ?? 0;
  const breakdownA = playerA ? getPointsBreakdown(playerA.stats) : null;
  const breakdownB = playerB ? getPointsBreakdown(playerB.stats) : null;

  const categories: { key: string; label: string; weight: string; invert?: boolean }[] = [
    { key: "scoring", label: "Scoring", weight: `${DEFAULT_WEIGHTS.points}x` },
    { key: "rebounds", label: "Rebounds", weight: `${DEFAULT_WEIGHTS.rebounds}x` },
    { key: "assists", label: "Assists", weight: `${DEFAULT_WEIGHTS.assists}x` },
    { key: "steals", label: "Steals", weight: `${DEFAULT_WEIGHTS.steals}x` },
    { key: "blocks", label: "Blocks", weight: `${DEFAULT_WEIGHTS.blocks}x` },
    { key: "threePointers", label: "3-Pointers", weight: `${DEFAULT_WEIGHTS.threePointersMade}x` },
    { key: "turnovers", label: "Turnovers", weight: `${DEFAULT_WEIGHTS.turnovers}`, invert: true },
  ];

  function getBreakdownVal(b: ReturnType<typeof getPointsBreakdown> | null, key: string) {
    if (!b) return 0;
    return b[key as keyof typeof b] ?? 0;
  }

  const rawStats: { label: string; key: string; invert?: boolean; pct?: boolean }[] = [
    { label: "PPG", key: "pointsPerGame" },
    { label: "RPG", key: "reboundsPerGame" },
    { label: "APG", key: "assistsPerGame" },
    { label: "SPG", key: "stealsPerGame" },
    { label: "BPG", key: "blocksPerGame" },
    { label: "TPG", key: "turnoversPerGame", invert: true },
    { label: "3PM", key: "threePMPerGame" },
    { label: "MPG", key: "minutesPerGame" },
    { label: "FG%", key: "fgPercent", pct: true },
    { label: "FT%", key: "ftPercent", pct: true },
  ];

  let winsA = 0;
  let winsB = 0;
  if (breakdownA && breakdownB) {
    categories.forEach((cat) => {
      const a = getBreakdownVal(breakdownA, cat.key);
      const b = getBreakdownVal(breakdownB, cat.key);
      if (cat.invert) {
        if (a < b) winsA++;
        else if (b < a) winsB++;
      } else {
        if (a > b) winsA++;
        else if (b > a) winsB++;
      }
    });
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-1">Player Comparison</h1>
        <p className="text-muted text-sm">Head-to-head fantasy value breakdown</p>
      </div>

      {/* Player Selectors */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <PlayerSelector
          label="Player A"
          color="blue"
          selected={playerA}
          search={searchA}
          onSearch={setSearchA}
          onSelect={setPlayerA}
          players={filteredA}
        />
        <PlayerSelector
          label="Player B"
          color="accent"
          selected={playerB}
          search={searchB}
          onSearch={setSearchB}
          onSelect={setPlayerB}
          players={filteredB}
        />
      </div>

      {playerA && playerB && (
        <>
          {/* Headline Verdict */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-3xl font-bold text-blue">{fpA.toFixed(1)}</p>
                <p className="text-xs text-muted mt-1">{getValueCategory(fpA)} | Rank #{playerA.rank}</p>
              </div>
              <div className="text-center px-6">
                <p className="text-sm text-muted mb-1">Category Wins</p>
                <p className="text-lg font-bold">
                  <span className={winsA > winsB ? "text-blue" : "text-muted"}>{winsA}</span>
                  <span className="text-muted mx-2">-</span>
                  <span className={winsB > winsA ? "text-accent" : "text-muted"}>{winsB}</span>
                </p>
                <p className={`text-xs font-semibold mt-1 ${winsA > winsB ? "text-blue" : winsB > winsA ? "text-accent" : "text-muted"}`}>
                  {winsA > winsB ? `${playerA.name.split(" ").pop()} wins` : winsB > winsA ? `${playerB.name.split(" ").pop()} wins` : "Tied"}
                </p>
              </div>
              <div className="text-center flex-1">
                <p className="text-3xl font-bold text-accent">{fpB.toFixed(1)}</p>
                <p className="text-xs text-muted mt-1">{getValueCategory(fpB)} | Rank #{playerB.rank}</p>
              </div>
            </div>
          </div>

          {/* Fantasy Point Breakdown */}
          <div className="bg-card border border-border rounded-xl p-5 mb-6 animate-fade-in">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">Fantasy Point Breakdown</h2>
            <div className="space-y-3">
              {categories.map((cat) => {
                const a = getBreakdownVal(breakdownA, cat.key);
                const b = getBreakdownVal(breakdownB, cat.key);
                const max = Math.max(Math.abs(a), Math.abs(b), 0.1);
                const aWins = cat.invert ? a < b : a > b;
                const bWins = cat.invert ? b < a : b > a;

                return (
                  <div key={cat.key} className="flex items-center gap-3">
                    <span className={`text-sm font-bold w-12 text-right ${aWins ? "text-blue" : "text-muted"}`}>
                      {a >= 0 ? "+" : ""}{a.toFixed(1)}
                    </span>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="flex-1 h-4 bg-background rounded-l-full overflow-hidden flex justify-end">
                        <div
                          className="h-full rounded-l-full transition-all duration-700"
                          style={{
                            width: `${(Math.abs(a) / max) * 100}%`,
                            backgroundColor: cat.key === "turnovers" ? "#ef4444" : "#3b82f6",
                          }}
                        />
                      </div>
                      <div className="text-center w-24 shrink-0">
                        <p className="text-xs font-medium">{cat.label}</p>
                        <p className="text-xs text-muted/60">{cat.weight}</p>
                      </div>
                      <div className="flex-1 h-4 bg-background rounded-r-full overflow-hidden">
                        <div
                          className="h-full rounded-r-full transition-all duration-700"
                          style={{
                            width: `${(Math.abs(b) / max) * 100}%`,
                            backgroundColor: cat.key === "turnovers" ? "#ef4444" : "#f97316",
                          }}
                        />
                      </div>
                    </div>
                    <span className={`text-sm font-bold w-12 ${bWins ? "text-accent" : "text-muted"}`}>
                      {b >= 0 ? "+" : ""}{b.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Raw Stats Table */}
          <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">Raw Stats</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted uppercase tracking-wider border-b border-border">
                    <th className="py-2 text-right pr-4"><span className="text-blue">{playerA.name}</span></th>
                    <th className="py-2 text-center">Stat</th>
                    <th className="py-2 text-left pl-4"><span className="text-accent">{playerB.name}</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rawStats.map((stat) => {
                    const a = playerA.stats[stat.key as keyof typeof playerA.stats] as number;
                    const b = playerB.stats[stat.key as keyof typeof playerB.stats] as number;
                    const aWins = stat.invert ? a < b : a > b;
                    const bWins = stat.invert ? b < a : b > a;

                    return (
                      <tr key={stat.label} className="border-b border-border/30">
                        <td className={`py-2.5 text-right pr-4 ${aWins ? "text-blue font-semibold" : "text-muted"}`}>
                          {stat.pct ? `${(a * 100).toFixed(1)}%` : a.toFixed(1)}
                        </td>
                        <td className="py-2.5 text-center text-muted text-xs">{stat.label}</td>
                        <td className={`py-2.5 text-left pl-4 ${bWins ? "text-accent font-semibold" : "text-muted"}`}>
                          {stat.pct ? `${(b * 100).toFixed(1)}%` : b.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {(!playerA || !playerB) && (
        <div className="bg-card border border-border rounded-xl p-12 text-center animate-fade-in">
          <p className="text-muted">Select two players above to see the full comparison</p>
        </div>
      )}
    </div>
  );
}

function PlayerSelector({
  label,
  color,
  selected,
  search,
  onSearch,
  onSelect,
  players,
}: {
  label: string;
  color: string;
  selected: Player | null;
  search: string;
  onSearch: (s: string) => void;
  onSelect: (p: Player | null) => void;
  players: Player[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className={`text-sm font-semibold uppercase tracking-wider text-${color} mb-2`}>{label}</h3>
      {selected ? (
        <div className="flex items-center justify-between p-3 rounded-lg bg-background">
          <div>
            <p className="text-sm font-semibold">{selected.name}</p>
            <p className="text-xs text-muted">{selected.teamAbbr} | {selected.position}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold" style={{ color: getValueColor(selected.fantasyPoints ?? 0) }}>
              {(selected.fantasyPoints ?? 0).toFixed(1)}
            </span>
            <button onClick={() => onSelect(null)} className="text-xs text-muted hover:text-red transition-colors">change</button>
          </div>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => { onSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-accent"
          />
          {open && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {players.slice(0, 15).map((p) => (
                <button
                  key={p.id}
                  onClick={() => { onSelect(p); setOpen(false); onSearch(""); }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-card-hover transition-colors text-left"
                >
                  <span className="text-sm">{p.name} <span className="text-xs text-muted">{p.teamAbbr}</span></span>
                  <span className="text-xs font-bold" style={{ color: getValueColor(p.fantasyPoints ?? 0) }}>
                    {(p.fantasyPoints ?? 0).toFixed(1)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
