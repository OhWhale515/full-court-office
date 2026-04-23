"use client";

import { useEffect, useState, useMemo } from "react";
import { WNBA_PLAYERS } from "@/data/players";
import { WNBA_SCHEDULE, CURRENT_WEEK, getTeamGameCounts } from "@/data/schedule";
import { rankPlayers, getValueCategory, getValueColor, DEFAULT_WEIGHTS } from "@/lib/scoring";
import { getStoredLeagueData, getStoredConfig } from "@/lib/league-store";
import { ESPNLeagueData } from "@/lib/espn";
import Link from "next/link";

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
    const config = getStoredConfig();
    if (data) {
      setLeagueData(data);
      setIsConnected(!!config?.lastSync);
    }
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted text-sm">Full Court Office overview and league intelligence</p>
      </div>

      {/* ESPN League Standings (if connected) */}
      {isConnected && leagueData && (
        <div className="bg-card border border-green/30 rounded-xl p-5 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-green">{leagueData.leagueName}</h2>
            </div>
            <span className="text-xs text-muted">Week {leagueData.scoringPeriodId}</span>
          </div>
          <div className="space-y-2">
            {leagueData.teams
              .sort((a, b) => b.wins - a.wins || a.losses - b.losses)
              .map((team, i) => (
                <div key={team.id} className="flex items-center justify-between p-3 rounded-lg bg-background">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted w-5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold">{team.name}</p>
                      <p className="text-xs text-muted">{team.roster.length} players</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{team.wins}-{team.losses}</p>
                    <p className="text-xs text-muted">{team.pointsFor.toFixed(1)} PF</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Not connected prompt */}
      {!isConnected && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1">Connect your ESPN league for live standings</p>
              <p className="text-xs text-muted">Sync rosters, matchups, and standings from ESPN Fantasy</p>
            </div>
            <Link href="/settings" className="px-4 py-2 rounded-lg text-sm bg-accent text-white hover:bg-accent/90 transition-colors">
              Connect
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Players" value={rankedPlayers.length.toString()} />
        <StatCard label="Avg Fantasy Pts" value={avgFP.toFixed(1)} />
        <StatCard label="Top Scorer" value={top5[0]?.name.split(" ").pop() ?? ""} sub={`${top5[0]?.fantasyPoints?.toFixed(1)} FP`} />
        <StatCard label="Current Week" value={`Week ${CURRENT_WEEK}`} sub={WNBA_SCHEDULE[0]?.startDate.slice(5) ?? ""} />
      </div>

      {/* Week Schedule + Scoring Weights side by side */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Schedule Snapshot */}
        <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Week {CURRENT_WEEK} Schedule</h2>
            <Link href="/streaming" className="text-xs text-accent hover:text-accent/80 transition-colors">
              Full guide &rarr;
            </Link>
          </div>
          <div className="space-y-2">
            {hotTeams.map(([team, games]) => (
              <div key={team} className="flex items-center justify-between p-2 rounded-lg bg-background">
                <span className="text-sm font-medium">{team}</span>
                <span className={`text-sm font-bold ${games >= 4 ? "text-green" : games >= 3 ? "text-accent" : "text-muted"}`}>
                  {games} games
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring Weights */}
        <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
          <h2 className="text-sm font-semibold mb-4 text-muted uppercase tracking-wider">League Scoring Weights</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <WeightBadge label="Points" value={DEFAULT_WEIGHTS.points} />
            <WeightBadge label="Rebounds" value={DEFAULT_WEIGHTS.rebounds} />
            <WeightBadge label="Assists" value={DEFAULT_WEIGHTS.assists} />
            <WeightBadge label="Steals" value={DEFAULT_WEIGHTS.steals} accent />
            <WeightBadge label="Blocks" value={DEFAULT_WEIGHTS.blocks} accent />
            <WeightBadge label="Turnovers" value={DEFAULT_WEIGHTS.turnovers} negative />
            <WeightBadge label="3PM" value={DEFAULT_WEIGHTS.threePointersMade} />
          </div>
        </div>
      </div>

      {/* Top 5 Overall */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Top 5 Overall</h2>
          <Link href="/rankings" className="text-xs text-accent hover:text-accent/80 transition-colors">
            View all rankings &rarr;
          </Link>
        </div>
        <div className="space-y-3">
          {top5.map((player, i) => (
            <PlayerRow key={player.id} player={player} index={i} />
          ))}
        </div>
      </div>

      {/* Position Leaders */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <PositionLeaders title="Top Guards" players={topGuards} />
        <PositionLeaders title="Top Forwards" players={topForwards} />
        <PositionLeaders title="Top Centers" players={topCenters} />
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        <QuickLink href="/matchup" label="Matchup Analyzer" desc="Start/sit recs + win probability" />
        <QuickLink href="/streaming" label="Streaming Guide" desc="Schedule-based waiver targets" />
        <QuickLink href="/trade" label="Trade Evaluator" desc="Category-level trade impact" />
        <QuickLink href="/rankings" label="Full Rankings" desc="Custom scoring player rankings" />
      </div>
    </div>
  );
}

function QuickLink({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <Link href={href} className="bg-card border border-border rounded-xl p-4 hover:border-accent/50 transition-colors group">
      <p className="text-sm font-semibold group-hover:text-accent transition-colors">{label}</p>
      <p className="text-xs text-muted mt-1">{desc}</p>
    </Link>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 animate-fade-in">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

function WeightBadge({ label, value, accent, negative }: { label: string; value: number; accent?: boolean; negative?: boolean }) {
  return (
    <div className={`text-center p-3 rounded-lg ${accent ? "bg-accent/10 border border-accent/20" : negative ? "bg-red/10 border border-red/20" : "bg-background border border-border"}`}>
      <p className={`text-lg font-bold ${accent ? "text-accent" : negative ? "text-red" : ""}`}>
        {value > 0 ? `${value}x` : `${value}`}
      </p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
    </div>
  );
}

function PlayerRow({ player, index }: { player: (typeof WNBA_PLAYERS)[0] & { fantasyPoints?: number; rank?: number }; index: number }) {
  const fp = player.fantasyPoints ?? 0;
  const maxFP = 55;
  const barWidth = Math.min((fp / maxFP) * 100, 100);

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-card-hover transition-colors group">
      <span className="text-lg font-bold text-muted w-6 text-right">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm truncate">{player.name}</span>
          <span className="text-xs text-muted">{player.teamAbbr}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-background text-muted">{player.position}</span>
        </div>
        <div className="h-1.5 bg-background rounded-full overflow-hidden">
          <div className="h-full rounded-full stat-bar" style={{ width: `${barWidth}%`, backgroundColor: getValueColor(fp) }} />
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold" style={{ color: getValueColor(fp) }}>{fp.toFixed(1)}</p>
        <p className="text-xs text-muted">{getValueCategory(fp)}</p>
      </div>
    </div>
  );
}

function PositionLeaders({ title, players }: { title: string; players: (typeof WNBA_PLAYERS[0] & { fantasyPoints?: number })[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">{title}</h3>
      <div className="space-y-3">
        {players.map((player, i) => {
          const fp = player.fantasyPoints ?? 0;
          return (
            <div key={player.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-card-hover transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-muted w-5">{i + 1}</span>
                <div>
                  <p className="text-sm font-medium">{player.name}</p>
                  <p className="text-xs text-muted">{player.teamAbbr}</p>
                </div>
              </div>
              <span className="text-sm font-bold" style={{ color: getValueColor(fp) }}>{fp.toFixed(1)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
