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

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-accent text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Waiver Protocol</span>
          <span className="text-muted text-[10px] font-bold uppercase tracking-widest">Active Week {selectedWeek}</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 animate-fade-in">
          <div>
            <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-4">
              Streaming <span className="text-accent italic">Guide</span>
            </h1>
            <p className="text-muted font-bold text-sm uppercase tracking-wide max-w-md">
              Schedule-optimized player acquisition. Maximizing volume through weekly variance analysis.
            </p>
          </div>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            className="bg-background border-2 border-accent text-accent font-black uppercase tracking-widest p-4 text-xs focus:outline-none focus:ring-4 ring-accent/20"
          >
            {WNBA_SCHEDULE.map((w) => (
              <option key={w.week} value={w.week}>
                WEEK {w.week} ({w.startDate.slice(5)} - {w.endDate.slice(5)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule Heat Map */}
      <div className="brutalist-card p-8 mb-12 animate-fade-in">
        <h2 className="text-xs font-black text-muted uppercase tracking-[0.3em] mb-8 border-b-2 border-border-heavy pb-4">Volume Distribution Map</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {teamScheduleView.map((team) => (
            <div
              key={team.abbr}
              className={`p-4 border-2 transition-all group ${
                team.games >= 4
                  ? "bg-green/10 border-green"
                  : team.games >= 3
                  ? "bg-accent/10 border-accent"
                  : team.games <= 1
                  ? "bg-red/10 border-red opacity-50"
                  : "bg-background border-border-heavy"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-black italic">{team.abbr}</span>
                <span className={`text-2xl font-black font-mono ${
                    team.games >= 4 ? "text-green" : team.games >= 3 ? "text-accent" : team.games <= 1 ? "text-red" : "text-muted"
                  }`}>
                  {team.games}G
                </span>
              </div>
              <div className="space-y-1">
                {team.schedule.map((g, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter text-muted group-hover:text-foreground">
                    <span>{g.date.slice(5)}</span>
                    <span className="font-mono">{g.home === team.abbr ? "VS" : "@"} {g.home === team.abbr ? g.away : g.home}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Neural Swap Logic */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div className="brutalist-card p-8 bg-blue/5 border-blue">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue flex items-center justify-center text-white">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeWidth={2} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter italic">Neural Swap Protocol</h2>
           </div>
           <p className="text-xs text-muted font-bold uppercase tracking-widest leading-relaxed mb-6">
              High-frequency roster churning. Swapping low-volume starters for high-volume streamers results in a projected <span className="text-green">+18.5% weekly gain</span>.
           </p>
           <div className="space-y-4">
              <div className="p-4 border-2 border-blue bg-background">
                 <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1 italic">Optimization Target</p>
                 <p className="text-sm font-black uppercase tracking-tight">Drop 2-Game Star for 4-Game Utility</p>
              </div>
           </div>
        </div>

          <div className="brutalist-card p-8 bg-purple/5 border-purple">
           <h2 className="text-xs font-black text-purple uppercase tracking-[0.3em] mb-4">Scoring System Edge</h2>
           <p className="text-sm text-foreground font-bold uppercase leading-relaxed italic">
              &quot;Steals and Blocks are worth 2X. Ignore standard rankings—target defensive anchors who rack up volume.&quot;
           </p>
           <div className="mt-6 flex gap-4">
              <div className="text-center flex-1 p-3 border-2 border-purple/30 bg-background">
                 <p className="text-xl font-black font-mono">2.0X</p>
                 <p className="text-[10px] text-muted font-black uppercase tracking-widest">STL/BLK</p>
              </div>
              <div className="text-center flex-1 p-3 border-2 border-purple/30 bg-background">
                 <p className="text-xl font-black font-mono">1.5X</p>
                 <p className="text-[10px] text-muted font-black uppercase tracking-widest">AST</p>
              </div>
           </div>
        </div>
      </div>

      {/* Schedule-Based Streaming Targets */}
      <div className="brutalist-card p-8 mb-12 animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 font-black text-[120px] opacity-[0.03] leading-none pointer-events-none italic">STREAM</div>
        <h2 className="text-xs font-black text-accent uppercase tracking-[0.3em] mb-8 border-b-2 border-border-heavy pb-4">Apex Streaming Targets (3+ Games)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {streamingTargets.slice(0, 12).map((p, i) => (
            <div key={p.id} className="flex items-center justify-between p-4 border-2 border-border-heavy bg-background hover:border-accent transition-all group">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-muted/30 font-mono italic">{i + 1}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black uppercase tracking-tight group-hover:text-accent transition-colors">{p.name}</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 bg-green text-black uppercase">{p.games}G WK{selectedWeek}</span>
                  </div>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{p.teamAbbr} | {p.position}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black font-mono italic text-accent">
                  {p.weeklyProjection.toFixed(1)}
                </p>
                <p className="text-[10px] text-muted font-black uppercase tracking-widest">PROJ WK FP</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Specialists */}
      <div className="grid lg:grid-cols-2 gap-8">
        <CategoryList title="Steal Specialists" subtitle="Neural weight: 2.0x" players={stealSpecialists} statKey="stealsPerGame" statLabel="STL" gameCounts={gameCounts} highlight />
        <CategoryList title="Block Specialists" subtitle="Neural weight: 2.0x" players={blockSpecialists} statKey="blocksPerGame" statLabel="BLK" gameCounts={gameCounts} highlight />
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
    <div className={`brutalist-card p-8 animate-fade-in ${highlight ? "border-accent/40" : ""}`}>
      <h3 className="text-xs font-black text-muted uppercase tracking-[0.3em] mb-1">{title}</h3>
      <p className="text-[10px] text-accent font-black uppercase tracking-widest mb-8 italic">{subtitle}</p>
      <div className="space-y-3">
        {players.map((p, i) => {
          const fp = p.fantasyPoints ?? 0;
          const stat = p.stats[statKey];
          const games = gameCounts[p.teamAbbr] ?? 0;
          return (
            <div key={p.id} className="flex items-center justify-between p-3 border-2 border-border-heavy bg-background hover:border-accent transition-all group">
              <div className="flex items-center gap-4">
                <span className="text-sm font-black text-muted/30 font-mono italic">{i + 1}</span>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight group-hover:text-accent transition-colors">{p.name}</p>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{p.teamAbbr}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className={`text-lg font-black font-mono italic ${highlight ? "text-accent" : invert ? "text-green" : ""}`}>
                    {stat.toFixed(1)} <span className="text-[10px] opacity-60 font-black uppercase">{statLabel}</span>
                  </p>
                </div>
                <div className="text-right w-16">
                   <p className="text-sm font-black font-mono italic">{fp.toFixed(1)}</p>
                   <p className="text-[8px] text-muted font-black uppercase">FP/G</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
