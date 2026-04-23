"use client";

import { useState, useMemo } from "react";
import { WNBA_PLAYERS } from "@/data/players";
import { WNBA_TEAMS } from "@/data/teams";
import { rankPlayers, getValueCategory, getValueColor, getPointsBreakdown, DEFAULT_WEIGHTS } from "@/lib/scoring";
import type { SortField, SortDirection, Player } from "@/lib/types";

export default function RankingsPage() {
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState<string>("ALL");
  const [teamFilter, setTeamFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("fantasyPoints");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const rankedPlayers = useMemo(() => rankPlayers(WNBA_PLAYERS), []);

  const filtered = useMemo(() => {
    let result = [...rankedPlayers];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.team.toLowerCase().includes(q) ||
          p.teamAbbr.toLowerCase().includes(q)
      );
    }

    if (posFilter !== "ALL") {
      result = result.filter((p) => p.position.includes(posFilter));
    }

    if (teamFilter !== "ALL") {
      result = result.filter((p) => p.teamAbbr === teamFilter);
    }

    if (sortField !== "fantasyPoints" || sortDir !== "desc") {
      result.sort((a, b) => {
        let aVal: number | string = 0;
        let bVal: number | string = 0;

        switch (sortField) {
          case "rank": aVal = a.rank ?? 0; bVal = b.rank ?? 0; break;
          case "name": aVal = a.name; bVal = b.name; break;
          case "team": aVal = a.teamAbbr; bVal = b.teamAbbr; break;
          case "position": aVal = a.position; bVal = b.position; break;
          case "fantasyPoints": aVal = a.fantasyPoints ?? 0; bVal = b.fantasyPoints ?? 0; break;
          case "pointsPerGame": aVal = a.stats.pointsPerGame; bVal = b.stats.pointsPerGame; break;
          case "reboundsPerGame": aVal = a.stats.reboundsPerGame; bVal = b.stats.reboundsPerGame; break;
          case "assistsPerGame": aVal = a.stats.assistsPerGame; bVal = b.stats.assistsPerGame; break;
          case "stealsPerGame": aVal = a.stats.stealsPerGame; bVal = b.stats.stealsPerGame; break;
          case "blocksPerGame": aVal = a.stats.blocksPerGame; bVal = b.stats.blocksPerGame; break;
          case "turnoversPerGame": aVal = a.stats.turnoversPerGame; bVal = b.stats.turnoversPerGame; break;
          case "threePMPerGame": aVal = a.stats.threePMPerGame; bVal = b.stats.threePMPerGame; break;
        }

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });
    }

    return result;
  }, [rankedPlayers, search, posFilter, teamFilter, sortField, sortDir]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 text-xs">
      {sortField === field ? (sortDir === "desc" ? "▼" : "▲") : ""}
    </span>
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-1">Player Rankings</h1>
        <p className="text-muted text-sm">All WNBA players ranked by custom scoring weights</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 animate-fade-in">
        <input
          type="text"
          placeholder="Search players or teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card border border-border rounded-lg px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:border-accent transition-colors"
        />
        <select
          value={posFilter}
          onChange={(e) => setPosFilter(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
        >
          <option value="ALL">All Positions</option>
          <option value="G">Guards</option>
          <option value="F">Forwards</option>
          <option value="C">Centers</option>
        </select>
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
        >
          <option value="ALL">All Teams</option>
          {WNBA_TEAMS.map((t) => (
            <option key={t.abbr} value={t.abbr}>{t.abbr} - {t.name}</option>
          ))}
        </select>
        <div className="text-sm text-muted self-center ml-auto">
          {filtered.length} player{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("rank")}>
                  Rank<SortIcon field="rank" />
                </th>
                <th className="px-4 py-3 text-left cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("name")}>
                  Player<SortIcon field="name" />
                </th>
                <th className="px-4 py-3 text-left cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("position")}>
                  Pos<SortIcon field="position" />
                </th>
                <th className="px-4 py-3 text-left cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("team")}>
                  Team<SortIcon field="team" />
                </th>
                <th className="px-4 py-3 text-right cursor-pointer hover:text-foreground transition-colors font-semibold text-accent" onClick={() => handleSort("fantasyPoints")}>
                  FP<SortIcon field="fantasyPoints" />
                </th>
                <th className="px-4 py-3 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("pointsPerGame")}>
                  PTS<SortIcon field="pointsPerGame" />
                </th>
                <th className="px-4 py-3 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("reboundsPerGame")}>
                  REB<SortIcon field="reboundsPerGame" />
                </th>
                <th className="px-4 py-3 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("assistsPerGame")}>
                  AST<SortIcon field="assistsPerGame" />
                </th>
                <th className="px-4 py-3 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("stealsPerGame")}>
                  STL<SortIcon field="stealsPerGame" />
                </th>
                <th className="px-4 py-3 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("blocksPerGame")}>
                  BLK<SortIcon field="blocksPerGame" />
                </th>
                <th className="px-4 py-3 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("turnoversPerGame")}>
                  TO<SortIcon field="turnoversPerGame" />
                </th>
                <th className="px-4 py-3 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("threePMPerGame")}>
                  3PM<SortIcon field="threePMPerGame" />
                </th>
                <th className="px-4 py-3 text-center">Tier</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((player) => {
                const fp = player.fantasyPoints ?? 0;
                return (
                  <tr
                    key={player.id}
                    className="border-b border-border/50 hover:bg-card-hover transition-colors cursor-pointer"
                    onClick={() => setSelectedPlayer(selectedPlayer?.id === player.id ? null : player)}
                  >
                    <td className="px-4 py-3 font-bold text-muted">{player.rank}</td>
                    <td className="px-4 py-3 font-semibold">{player.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 rounded bg-background text-xs text-muted">{player.position}</span>
                    </td>
                    <td className="px-4 py-3 text-muted">{player.teamAbbr}</td>
                    <td className="px-4 py-3 text-right font-bold" style={{ color: getValueColor(fp) }}>{fp.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right text-muted">{player.stats.pointsPerGame.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right text-muted">{player.stats.reboundsPerGame.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right text-muted">{player.stats.assistsPerGame.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right text-muted">{player.stats.stealsPerGame.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right text-muted">{player.stats.blocksPerGame.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right text-muted">{player.stats.turnoversPerGame.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right text-muted">{player.stats.threePMPerGame.toFixed(1)}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getValueColor(fp) }}
                        title={getValueCategory(fp)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Player Detail Breakdown */}
      {selectedPlayer && <PlayerBreakdown player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
    </div>
  );
}

function PlayerBreakdown({ player, onClose }: { player: Player; onClose: () => void }) {
  const breakdown = getPointsBreakdown(player.stats);
  const fp = player.fantasyPoints ?? 0;
  const categories = [
    { label: "Scoring", value: breakdown.scoring, weight: `${DEFAULT_WEIGHTS.points}x`, raw: player.stats.pointsPerGame },
    { label: "Rebounds", value: breakdown.rebounds, weight: `${DEFAULT_WEIGHTS.rebounds}x`, raw: player.stats.reboundsPerGame },
    { label: "Assists", value: breakdown.assists, weight: `${DEFAULT_WEIGHTS.assists}x`, raw: player.stats.assistsPerGame },
    { label: "Steals", value: breakdown.steals, weight: `${DEFAULT_WEIGHTS.steals}x`, raw: player.stats.stealsPerGame },
    { label: "Blocks", value: breakdown.blocks, weight: `${DEFAULT_WEIGHTS.blocks}x`, raw: player.stats.blocksPerGame },
    { label: "Turnovers", value: breakdown.turnovers, weight: `${DEFAULT_WEIGHTS.turnovers}`, raw: player.stats.turnoversPerGame },
    { label: "3-Pointers", value: breakdown.threePointers, weight: `${DEFAULT_WEIGHTS.threePointersMade}x`, raw: player.stats.threePMPerGame },
  ];

  const maxCat = Math.max(...categories.map((c) => Math.abs(c.value)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">{player.name}</h2>
            <p className="text-sm text-muted">{player.team} | {player.position} | #{player.number}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: getValueColor(fp) }}>{fp.toFixed(1)}</p>
            <p className="text-xs text-muted">{getValueCategory(fp)} | Rank #{player.rank}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center gap-3">
              <span className="text-xs text-muted w-20">{cat.label}</span>
              <span className="text-xs text-muted/60 w-8">{cat.weight}</span>
              <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                {cat.value >= 0 ? (
                  <div
                    className="h-full rounded-full stat-bar bg-accent"
                    style={{ width: `${(cat.value / maxCat) * 100}%` }}
                  />
                ) : (
                  <div
                    className="h-full rounded-full stat-bar bg-red"
                    style={{ width: `${(Math.abs(cat.value) / maxCat) * 100}%` }}
                  />
                )}
              </div>
              <span className="text-xs w-10 text-right text-muted">{cat.raw.toFixed(1)}</span>
              <span className={`text-xs w-12 text-right font-semibold ${cat.value < 0 ? "text-red" : "text-foreground"}`}>
                {cat.value >= 0 ? "+" : ""}{cat.value.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
          <MiniStat label="GP" value={player.stats.gamesPlayed.toString()} />
          <MiniStat label="MPG" value={player.stats.minutesPerGame.toFixed(1)} />
          <MiniStat label="FG%" value={`${(player.stats.fgPercent * 100).toFixed(1)}%`} />
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-muted hover:text-foreground bg-background rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-2 rounded-lg bg-background">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
