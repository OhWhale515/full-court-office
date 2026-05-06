"use client";

import { useEffect, useState, useMemo } from "react";
import { WNBA_PLAYERS } from "@/data/players";
import { WNBA_SCHEDULE, CURRENT_WEEK, getTeamGameCounts } from "@/data/schedule";
import { rankPlayers, getValueCategory, getValueColor, DEFAULT_WEIGHTS } from "@/lib/scoring";
import { getStoredLeagueData, getStoredConfig } from "@/lib/league-store";
import { ESPNLeagueData } from "@/lib/espn";
import Link from "next/link";

import CourtScene from "@/components/Court";

export default function Dashboard() {
  const rankedPlayers = useMemo(() => rankPlayers(WNBA_PLAYERS), []);
  const top5 = rankedPlayers.slice(0, 5);
  const topGuards = rankedPlayers.filter((p) => p.position.includes("G")).slice(0, 3);
  const topForwards = rankedPlayers.filter((p) => p.position.includes("F")).slice(0, 3);
  const topCenters = rankedPlayers.filter((p) => p.position.includes("C")).slice(0, 3);
  const avgFP = rankedPlayers.reduce((sum, p) => sum + (p.fantasyPoints ?? 0), 0) / rankedPlayers.length;

  const gameCounts = useMemo(() => getTeamGameCounts(CURRENT_WEEK), []);
  const hotTeams = Object.entries(gameCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const [leagueData, setLeagueData] = useState<ESPNLeagueData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const data = getStoredLeagueData();
    if (data) {
      setTimeout(() => {
        setLeagueData(data);
        const config = getStoredConfig();
        setIsConnected(!!config?.lastSync);
      }, 0);
    }
  }, []);

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto">
      {/* Hero Section / 3D Court */}
      <div className="mb-12 animate-fade-in">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-accent text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Protocol 04-WNBA</span>
              <span className="text-muted text-[10px] font-bold uppercase tracking-widest animate-pulse">Syncing...</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.8] mb-6">
              Full<br />
              Court<br />
              <span className="text-accent italic">Office</span>
            </h1>
            <p className="text-muted font-bold text-sm uppercase tracking-widest max-w-sm leading-relaxed border-l-2 border-accent pl-4">
              High-fidelity analytical dashboard for elite fantasy competition. Powered by neural-weighted scoring and real-time schedule synthesis.
            </p>
          </div>
          <div className="lg:w-3/5">
            <CourtScene />
          </div>
        </div>
      </div>

      {/* ESPN League Standings (if connected) */}
      {isConnected && leagueData && (
        <div className="brutalist-card p-6 mb-8 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5">
             <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"/></svg>
          </div>
          <div className="flex items-center justify-between mb-6 border-b-2 border-border-heavy pb-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-green animate-pulse" />
              <h2 className="text-xl font-black uppercase tracking-tighter text-green">{leagueData.leagueName}</h2>
            </div>
            <div className="bg-border-heavy px-3 py-1 font-black text-xs uppercase tracking-widest">
              Week {leagueData.scoringPeriodId}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leagueData.teams
              .sort((a, b) => b.wins - a.wins || a.losses - b.losses)
              .map((team, i) => (
                <div key={team.id} className="flex items-center justify-between p-4 border-2 border-border-heavy bg-background hover:border-accent transition-colors group">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-muted/30 group-hover:text-accent/30">{i + 1}</span>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">{team.name}</p>
                      <p className="text-[10px] text-muted font-bold uppercase">{team.roster.length} Active Roster</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black font-mono">{team.wins}-{team.losses}</p>
                    <p className="text-[10px] text-muted font-bold uppercase">{team.pointsFor.toFixed(1)} PF</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Not connected prompt */}
      {!isConnected && (
        <div className="brutalist-card border-accent/40 p-8 mb-8 animate-fade-in flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-2xl font-black uppercase tracking-tighter mb-1 italic">Roster Sync Offline</p>
            <p className="text-xs text-muted font-bold uppercase tracking-widest">Connect ESPN credentials to initialize live data stream</p>
          </div>
          <Link href="/settings" className="brutalist-button px-8">
            Initialize Link
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Pool" value={rankedPlayers.length.toString()} />
        <StatCard label="Global Avg FP" value={avgFP.toFixed(1)} />
        <StatCard label="Apex Scorer" value={top5[0]?.name.split(" ").pop()?.toUpperCase() ?? ""} sub={`${top5[0]?.fantasyPoints?.toFixed(1)} FP PER GAME`} />
        <StatCard label="Current Period" value={`WEEK ${CURRENT_WEEK}`} sub={WNBA_SCHEDULE[0]?.startDate.slice(5) ?? ""} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Schedule Snapshot */}
        <div className="lg:col-span-1 brutalist-card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-black text-muted uppercase tracking-[0.2em]">Combat Schedule</h2>
            <Link href="/streaming" className="text-[10px] font-black text-accent hover:underline uppercase tracking-widest">
              Full Intel &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {hotTeams.map(([team, games]) => (
              <div key={team} className="flex items-center justify-between p-3 border-2 border-border-heavy bg-background">
                <span className="text-sm font-black uppercase tracking-tight">{team}</span>
                <span className={`text-sm font-black font-mono ${games >= 4 ? "text-green" : games >= 3 ? "text-accent" : "text-muted"}`}>
                  {games} SESSIONS
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring Weights */}
        <div className="lg:col-span-2 brutalist-card p-6 animate-fade-in">
          <h2 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-6">Scoring Multipliers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <WeightBadge label="Points" value={DEFAULT_WEIGHTS.points} />
            <WeightBadge label="Rebounds" value={DEFAULT_WEIGHTS.rebounds} />
            <WeightBadge label="Assists" value={DEFAULT_WEIGHTS.assists} />
            <WeightBadge label="Steals" value={DEFAULT_WEIGHTS.steals} accent />
            <WeightBadge label="Blocks" value={DEFAULT_WEIGHTS.blocks} accent />
            <WeightBadge label="Turnovers" value={DEFAULT_WEIGHTS.turnovers} negative />
            <WeightBadge label="3P Made" value={DEFAULT_WEIGHTS.threePointersMade} />
          </div>
        </div>
      </div>

      {/* Top Players Table Header */}
      <div className="flex items-center justify-between mb-4 px-2">
         <h2 className="text-xs font-black text-muted uppercase tracking-[0.2em]">Top Rated Operators</h2>
         <Link href="/rankings" className="text-[10px] font-black text-accent hover:underline uppercase tracking-widest">
            Detailed Dossiers &rarr;
         </Link>
      </div>

      {/* Top 5 Overall */}
      <div className="brutalist-card p-2 mb-8 animate-fade-in">
        <div className="space-y-1">
          {top5.map((player, i) => (
            <PlayerRow key={player.id} player={player} index={i} />
          ))}
        </div>
      </div>

      {/* Position Leaders */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <PositionLeaders title="Guard Division" players={topGuards} />
        <PositionLeaders title="Forward Division" players={topForwards} />
        <PositionLeaders title="Center Division" players={topCenters} />
      </div>

      {/* Industrial Footer Links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        <QuickLink href="/matchup" label="Matchup Engine" desc="Predictive win probability analysis" />
        <QuickLink href="/streaming" label="Stream Guide" desc="Schedule-optimized waiver targets" />
        <QuickLink href="/trade" label="Trade Vault" desc="Differential value evaluation" />
        <QuickLink href="/rankings" label="Full Index" desc="Custom weighted player rankings" />
      </div>
    </div>
  );
}

function QuickLink({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <Link href={href} className="brutalist-card p-6 hover:border-accent group">
      <p className="text-sm font-black uppercase tracking-tighter mb-2 group-hover:text-accent transition-colors">{label}</p>
      <p className="text-[10px] text-muted font-bold uppercase tracking-wide leading-relaxed">{desc}</p>
    </Link>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="brutalist-card p-6">
      <p className="text-[10px] text-muted font-black uppercase tracking-[0.15em] mb-2">{label}</p>
      <p className="text-3xl font-black font-mono tracking-tighter uppercase">{value}</p>
      {sub && <p className="text-[10px] text-accent font-bold uppercase tracking-widest mt-2">{sub}</p>}
    </div>
  );
}

function WeightBadge({ label, value, accent, negative }: { label: string; value: number; accent?: boolean; negative?: boolean }) {
  return (
    <div className={`text-center p-4 border-2 ${accent ? "border-accent bg-accent/5" : negative ? "border-red bg-red/5" : "border-border-heavy bg-background"}`}>
      <p className={`text-2xl font-black font-mono ${accent ? "text-accent" : negative ? "text-red" : ""}`}>
        {value > 0 ? `${value}X` : `${value}`}
      </p>
      <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

function PlayerRow({ player, index }: { player: (typeof WNBA_PLAYERS)[0] & { fantasyPoints?: number; rank?: number }; index: number }) {
  const fp = player.fantasyPoints ?? 0;
  const maxFP = 55;
  const barWidth = Math.min((fp / maxFP) * 100, 100);

  return (
    <div className="flex items-center gap-6 p-4 border-2 border-transparent hover:border-border-heavy hover:bg-card transition-all group">
      <span className="text-3xl font-black text-muted/20 w-8 text-right font-mono italic">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-black text-lg uppercase tracking-tighter truncate">{player.name}</span>
          <span className="text-[10px] font-black px-2 py-0.5 bg-border-heavy text-muted uppercase tracking-widest">{player.teamAbbr}</span>
          <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{player.position}</span>
        </div>
        <div className="h-3 bg-background border border-border-heavy overflow-hidden">
          <div className="h-full stat-bar bg-accent" style={{ width: `${barWidth}%`, filter: `brightness(${0.5 + (fp/maxFP)*0.5})` }} />
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-2xl font-black font-mono tracking-tighter italic" style={{ color: getValueColor(fp) }}>{fp.toFixed(1)}</p>
        <p className="text-[10px] text-muted font-black uppercase tracking-widest">{getValueCategory(fp)}</p>
      </div>
    </div>
  );
}

function PositionLeaders({ title, players }: { title: string; players: (typeof WNBA_PLAYERS[0] & { fantasyPoints?: number })[] }) {
  return (
    <div className="brutalist-card p-6">
      <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-6 border-b-2 border-border-heavy pb-2">{title}</h3>
      <div className="space-y-4">
        {players.map((player, i) => {
          const fp = player.fantasyPoints ?? 0;
          return (
            <div key={player.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <span className="text-sm font-black text-muted/40 font-mono italic">{i + 1}</span>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight group-hover:text-accent transition-colors">{player.name}</p>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{player.teamAbbr}</p>
                </div>
              </div>
              <span className="text-lg font-black font-mono italic" style={{ color: getValueColor(fp) }}>{fp.toFixed(1)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
