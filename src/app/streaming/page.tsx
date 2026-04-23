"use client";

import { useState, useMemo } from "react";
import { WNBA_PLAYERS } from "@/data/players";
import { WNBA_SCHEDULE, CURRENT_WEEK, getTeamGameCounts, getGamesForTeam } from "@/data/schedule";
import { WNBA_TEAMS } from "@/data/teams";
import { rankPlayers, getValueColor } from "@/lib/scoring";

export default function StreamingPage() {
  const [selectedWeek, setSelectedWeek] = useState(CURRENT_WEEK);
  const rankedPlayers = useMemo(() => rankPlayers(WNBA_PLAYERS), []);
  const gameCounts = useMemo(() => getTeamGameCounts(selectedWeek), [selectedWeek]);

  const streamingTargets = useMemo(() => {
    return rankedPlayers
      .map((p) => {
        const games = gameCounts[p.teamAbbr] ?? 0;
        const fp = p.fantasyPoints ?? 0;
        const weeklyProjection = fp * games;
        const streamValue = weeklyProjection * (games >= 3 ? 1.2 : 1);
        return { ...p, games, weeklyProjection, streamValue };
      })
      .filter((p) => p.games >= 3)
      .sort((a, b) => b.streamValue - a.streamValue);
  }, [rankedPlayers, gameCounts]);

  const teamScheduleView = useMemo(() => {
    return WNBA_TEAMS.map((team) => {
      const games = gameCounts[team.abbr] ?? 0;
      const teamGames = getGamesForTeam(team.abbr, selectedWeek);
      return { ...team, games, schedule: teamGames };
    }).sort((a, b) => b.games - a.games);
  }, [gameCounts, selectedWeek]);

  const sleepers = rankedPlayers.filter(
    (p) => (p.fantasyPoints ?? 0) >= 18 && (p.fantasyPoints ?? 0) < 30
  );

  const stealSpecialists = [...rankedPlayers]
    .sort((a, b) => b.stats.stealsPerGame - a.stats.stealsPerGame)
    .slice(0, 10);

  const blockSpecialists = [...rankedPlayers]
    .sort((a, b) => b.stats.blocksPerGame - a.stats.blocksPerGame)
    .slice(0, 10);

  const assistLeaders = [...rankedPlayers]
    .sort((a, b) => b.stats.assistsPerGame - a.stats.assistsPerGame)
    .slice(0, 10);

  const lowTurnover = [...rankedPlayers]
    .filter((p) => (p.fantasyPoints ?? 0) >= 20)
    .sort((a, b) => a.stats.turnoversPerGame - b.stats.turnoversPerGame)
    .slice(0, 10);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold mb-1">Streaming Guide</h1>
          <p className="text-muted text-sm">Schedule-based pickups and category specialists</p>
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

      {/* Team Schedule Grid */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6 animate-fade-in">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
          Week {selectedWeek} Team Schedule
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {teamScheduleView.map((team) => (
            <div
              key={team.abbr}
              className={`p-3 rounded-lg border transition-colors ${
                team.games >= 4
                  ? "bg-green/5 border-green/30"
                  : team.games >= 3
                  ? "bg-accent/5 border-accent/30"
                  : team.games <= 1
                  ? "bg-red/5 border-red/30"
                  : "bg-background border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold">{team.abbr}</span>
                <span
                  className={`text-lg font-bold ${
                    team.games >= 4 ? "text-green" : team.games >= 3 ? "text-accent" : team.games <= 1 ? "text-red" : "text-muted"
                  }`}
                >
                  {team.games}G
                </span>
              </div>
              <p className="text-xs text-muted truncate">{team.name}</p>
              <div className="mt-1.5 space-y-0.5">
                {team.schedule.map((g, i) => (
                  <p key={i} className="text-xs text-muted/70">
                    {g.date.slice(5)} {g.home === team.abbr ? "vs" : "@"} {g.home === team.abbr ? g.away : g.home}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule-Based Streaming Targets */}
      {streamingTargets.length > 0 && (
        <div className="bg-card border border-accent/30 rounded-xl p-5 mb-6 animate-fade-in">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent mb-1">
            Week {selectedWeek} Streaming Targets
          </h2>
          <p className="text-xs text-muted mb-4">Players with 3+ games this week, sorted by weekly projection</p>
          <div className="space-y-2">
            {streamingTargets.slice(0, 15).map((p, i) => {
              const fp = p.fantasyPoints ?? 0;
              return (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-card-hover transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted w-5">{i + 1}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{p.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-green/10 text-green font-medium">
                          {p.games}G
                        </span>
                      </div>
                      <p className="text-xs text-muted">{p.teamAbbr} | {p.position} | {fp.toFixed(1)} FP/game</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: getValueColor(fp) }}>
                      {p.weeklyProjection.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted">weekly FP</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scoring System Edge */}
      <div className="bg-card border border-purple/30 rounded-xl p-5 mb-6 animate-fade-in">
        <h2 className="text-sm font-semibold text-purple mb-2">Scoring System Edge</h2>
        <p className="text-sm text-muted">
          Steals and Blocks are worth 2x in this league. Players who rack up defensive stats
          are undervalued by standard rankings. Target these players on the waiver wire for maximum edge.
        </p>
      </div>

      {/* Waiver Wire Sleepers */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6 animate-fade-in">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">Waiver Wire Sleepers</h2>
        <p className="text-xs text-muted mb-4">Solid producers often available in shallow leagues</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sleepers.map((p) => {
            const fp = p.fantasyPoints ?? 0;
            const games = gameCounts[p.teamAbbr] ?? 0;
            return (
              <div key={p.id} className="p-3 rounded-lg bg-background hover:bg-card-hover transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="text-sm font-bold" style={{ color: getValueColor(fp) }}>{fp.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>{p.teamAbbr}</span>
                  <span>{p.position}</span>
                  <span>#{p.rank}</span>
                  <span className={`ml-auto font-medium ${games >= 3 ? "text-green" : games <= 1 ? "text-red" : ""}`}>
                    {games}G wk{selectedWeek}
                  </span>
                </div>
                <div className="mt-2 flex gap-2 text-xs">
                  <span>STL: {p.stats.stealsPerGame}</span>
                  <span>BLK: {p.stats.blocksPerGame}</span>
                  <span>AST: {p.stats.assistsPerGame}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Specialists */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CategoryList title="Steal Specialists" subtitle="2x value in this scoring" players={stealSpecialists} statKey="stealsPerGame" statLabel="STL" gameCounts={gameCounts} highlight />
        <CategoryList title="Block Specialists" subtitle="2x value in this scoring" players={blockSpecialists} statKey="blocksPerGame" statLabel="BLK" gameCounts={gameCounts} highlight />
        <CategoryList title="Assist Leaders" subtitle="1.5x value in this scoring" players={assistLeaders} statKey="assistsPerGame" statLabel="AST" gameCounts={gameCounts} />
        <CategoryList title="Low Turnover + Production" subtitle="Efficient fantasy producers" players={lowTurnover} statKey="turnoversPerGame" statLabel="TO" gameCounts={gameCounts} invert />
      </div>
    </div>
  );
}

function CategoryList({
  title,
  subtitle,
  players,
  statKey,
  statLabel,
  gameCounts,
  highlight,
  invert,
}: {
  title: string;
  subtitle: string;
  players: ReturnType<typeof rankPlayers>;
  statKey: keyof ReturnType<typeof rankPlayers>[0]["stats"];
  statLabel: string;
  gameCounts: Record<string, number>;
  highlight?: boolean;
  invert?: boolean;
}) {
  return (
    <div className={`bg-card border rounded-xl p-5 animate-fade-in ${highlight ? "border-accent/30" : "border-border"}`}>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-1">{title}</h3>
      <p className="text-xs text-muted mb-4">{subtitle}</p>
      <div className="space-y-2">
        {players.map((p, i) => {
          const fp = p.fantasyPoints ?? 0;
          const stat = p.stats[statKey];
          const games = gameCounts[p.teamAbbr] ?? 0;
          return (
            <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-card-hover transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted w-5">{i + 1}</span>
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted">{p.teamAbbr} | {p.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${games >= 3 ? "text-green" : games <= 1 ? "text-red" : "text-muted"}`}>
                  {games}G
                </span>
                <div className="text-right">
                  <p className={`text-sm font-bold ${highlight ? "text-accent" : invert ? "text-green" : ""}`}>
                    {stat.toFixed(1)} {statLabel}
                  </p>
                </div>
                <span className="text-xs text-muted w-12 text-right">{fp.toFixed(1)} FP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
