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

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-accent text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Global Index</span>
          <span className="text-muted text-[10px] font-bold uppercase tracking-widest">v4.0.1</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-4">
          Player <span className="text-accent italic">Rankings</span>
        </h1>
        <p className="text-muted font-bold text-sm uppercase tracking-wide max-w-xl">
          Comprehensive data matrix. Filter and sort by neural-weighted metrics to identify high-value operators.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 animate-fade-in brutalist-card p-4">
        <input
          type="text"
          placeholder="SEARCH OPERATORS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-background border-2 border-border-heavy p-3 text-sm font-black uppercase w-full sm:w-80 focus:border-accent focus:outline-none transition-colors"
        />
        <select
          value={posFilter}
          onChange={(e) => setPosFilter(e.target.value)}
          className="bg-background border-2 border-border-heavy p-3 text-sm font-black uppercase focus:border-accent focus:outline-none transition-colors"
        >
          <option value="ALL">ALL POSITIONS</option>
          <option value="G">GUARDS</option>
          <option value="F">FORWARDS</option>
          <option value="C">CENTERS</option>
        </select>
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="bg-background border-2 border-border-heavy p-3 text-sm font-black uppercase focus:border-accent focus:outline-none transition-colors"
        >
          <option value="ALL">ALL TEAMS</option>
          {WNBA_TEAMS.map((t) => (
            <option key={t.abbr} value={t.abbr}>{t.abbr} - {t.name.toUpperCase()}</option>
          ))}
        </select>
        <div className="text-xs font-black text-muted uppercase tracking-widest self-center ml-auto">
          {filtered.length} IDENTIFIED
        </div>
      </div>

      {/* Table */}
      <div className="brutalist-card overflow-hidden animate-fade-in relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="bg-border-heavy/10 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-border-heavy">
                <SortHeader label="Rank" field="rank" current={sortField} dir={sortDir} onClick={handleSort} />
                <SortHeader label="Operator" field="name" current={sortField} dir={sortDir} onClick={handleSort} />
                <SortHeader label="Pos" field="position" current={sortField} dir={sortDir} onClick={handleSort} />
                <SortHeader label="Team" field="team" current={sortField} dir={sortDir} onClick={handleSort} />
                <SortHeader label="FP" field="fantasyPoints" current={sortField} dir={sortDir} onClick={handleSort} highlight />
                <SortHeader label="PTS" field="pointsPerGame" current={sortField} dir={sortDir} onClick={handleSort} />
                <SortHeader label="REB" field="reboundsPerGame" current={sortField} dir={sortDir} onClick={handleSort} />
                <SortHeader label="AST" field="assistsPerGame" current={sortField} dir={sortDir} onClick={handleSort} />
                <SortHeader label="STL" field="stealsPerGame" current={sortField} dir={sortDir} onClick={handleSort} />
                <SortHeader label="BLK" field="blocksPerGame" current={sortField} dir={sortDir} onClick={handleSort} />
                <SortHeader label="TO" field="turnoversPerGame" current={sortField} dir={sortDir} onClick={handleSort} />
                <SortHeader label="3PM" field="threePMPerGame" current={sortField} dir={sortDir} onClick={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((player) => {
                const fp = player.fantasyPoints ?? 0;
                return (
                  <tr
                    key={player.id}
                    className="border-b border-border-heavy hover:bg-accent/5 transition-all cursor-pointer group"
                    onClick={() => setSelectedPlayer(selectedPlayer?.id === player.id ? null : player)}
                  >
                    <td className="px-4 py-4 font-black text-muted group-hover:text-accent italic">{player.rank}</td>
                    <td className="px-4 py-4 font-black text-sm uppercase tracking-tighter">{player.name}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 bg-border-heavy text-[10px] font-black uppercase text-muted">{player.position}</span>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-muted">{player.teamAbbr}</td>
                    <td className="px-4 py-4 text-right font-black italic text-lg" style={{ color: getValueColor(fp) }}>{fp.toFixed(1)}</td>
                    <td className="px-4 py-4 text-right text-xs text-muted">{player.stats.pointsPerGame.toFixed(1)}</td>
                    <td className="px-4 py-4 text-right text-xs text-muted">{player.stats.reboundsPerGame.toFixed(1)}</td>
                    <td className="px-4 py-4 text-right text-xs text-muted">{player.stats.assistsPerGame.toFixed(1)}</td>
                    <td className="px-4 py-4 text-right text-xs text-muted">{player.stats.stealsPerGame.toFixed(1)}</td>
                    <td className="px-4 py-4 text-right text-xs text-muted">{player.stats.blocksPerGame.toFixed(1)}</td>
                    <td className="px-4 py-4 text-right text-xs text-red/60">{player.stats.turnoversPerGame.toFixed(1)}</td>
                    <td className="px-4 py-4 text-right text-xs text-muted">{player.stats.threePMPerGame.toFixed(1)}</td>
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

function SortHeader({ label, field, current, dir, onClick, highlight }: { 
  label: string; 
  field: SortField; 
  current: SortField; 
  dir: SortDirection; 
  onClick: (f: SortField) => void;
  highlight?: boolean;
}) {
  return (
    <th 
      className={`px-4 py-4 cursor-pointer hover:bg-accent/10 transition-colors ${highlight ? "text-accent" : ""}`} 
      onClick={() => onClick(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="text-[8px] font-mono opacity-40">
           {current === field ? (dir === "desc" ? "▼" : "▲") : ""}
        </span>
      </div>
    </th>
  );
}

function PlayerBreakdown({ player, onClose }: { player: Player; onClose: () => void }) {
  const breakdown = getPointsBreakdown(player.stats);
  const fp = player.fantasyPoints ?? 0;
  const categories = [
    { label: "SCORING", value: breakdown.scoring, weight: `${DEFAULT_WEIGHTS.points}X`, raw: player.stats.pointsPerGame },
    { label: "REBOUNDS", value: breakdown.rebounds, weight: `${DEFAULT_WEIGHTS.rebounds}X`, raw: player.stats.reboundsPerGame },
    { label: "ASSISTS", value: breakdown.assists, weight: `${DEFAULT_WEIGHTS.assists}X`, raw: player.stats.assistsPerGame },
    { label: "STEALS", value: breakdown.steals, weight: `${DEFAULT_WEIGHTS.steals}X`, raw: player.stats.stealsPerGame },
    { label: "BLOCKS", value: breakdown.blocks, weight: `${DEFAULT_WEIGHTS.blocks}X`, raw: player.stats.blocksPerGame },
    { label: "TURNOVERS", value: breakdown.turnovers, weight: `${DEFAULT_WEIGHTS.turnovers}`, raw: player.stats.turnoversPerGame },
    { label: "3-POINTERS", value: breakdown.threePointers, weight: `${DEFAULT_WEIGHTS.threePointersMade}X`, raw: player.stats.threePMPerGame },
  ];

  const maxCat = Math.max(...categories.map((c) => Math.abs(c.value)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card brutalist-border p-8 w-full max-w-2xl animate-fade-in relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
          <div>
            <p className="text-xs font-black text-accent uppercase tracking-[0.4em] mb-2">Operator Profile</p>
            <h2 className="text-4xl font-black uppercase tracking-tighter italic">{player.name}</h2>
            <p className="text-sm font-bold text-muted uppercase tracking-widest mt-1">
              {player.team.toUpperCase()} | {player.position} | #{player.number}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Neural Rating</p>
            <p className="text-5xl font-black font-mono italic leading-none" style={{ color: getValueColor(fp) }}>{fp.toFixed(1)}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-60">RANK #{player.rank} GLOBAL</p>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-4 border-b border-border-heavy pb-1">Scoring Synthesis</p>
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center gap-4 group">
              <span className="text-[10px] font-black text-muted w-24 tracking-widest">{cat.label}</span>
              <span className="text-[10px] font-mono text-accent w-8 italic">{cat.weight}</span>
              <div className="flex-1 h-3 bg-background border border-border-heavy overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-1000 ${cat.value < 0 ? "bg-red" : "bg-accent"}`}
                  style={{ width: `${(Math.abs(cat.value) / maxCat) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono w-10 text-right text-muted">{cat.raw.toFixed(1)}</span>
              <span className={`text-sm font-black font-mono w-16 text-right italic ${cat.value < 0 ? "text-red" : "text-foreground"}`}>
                {cat.value >= 0 ? "+" : ""}{cat.value.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 pt-8 border-t-2 border-border-heavy">
          <MiniStat label="SESSIONS" value={player.stats.gamesPlayed.toString()} />
          <MiniStat label="EFFICIENCY" value={`${(player.stats.fgPercent * 100).toFixed(1)}%`} />
          <MiniStat label="UTILIZATION" value={`${player.stats.minutesPerGame.toFixed(0)}m`} />
        </div>

        <button
          onClick={onClose}
          className="mt-10 w-full brutalist-button"
        >
          TERMINATE VIEW
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-4 bg-background border-2 border-border-heavy">
      <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black font-mono uppercase tracking-tighter">{value}</p>
    </div>
  );
}
