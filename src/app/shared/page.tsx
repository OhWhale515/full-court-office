"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { WNBA_PLAYERS } from "@/data/players";
import { rankPlayers, getValueColor, getValueCategory } from "@/lib/scoring";
import Link from "next/link";

function SharedLineupContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") ?? "Shared Lineup";
  const playerIds = (searchParams.get("players") ?? "").split(",").filter(Boolean);

  const rankedPlayers = useMemo(() => rankPlayers(WNBA_PLAYERS), []);
  const lineup = useMemo(
    () => playerIds.map((id) => rankedPlayers.find((p) => p.id === id)).filter(Boolean),
    [playerIds, rankedPlayers]
  );

  const totalFP = lineup.reduce((sum, p) => sum + (p?.fantasyPoints ?? 0), 0);

  if (lineup.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-2">No Lineup Found</h1>
        <p className="text-muted text-sm mb-6">This link doesn't contain a valid lineup.</p>
        <Link href="/" className="text-accent hover:text-accent/80 text-sm">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <p className="text-xs text-accent uppercase tracking-wider mb-1">Shared Lineup</p>
        <h1 className="text-2xl font-bold mb-1">{name}</h1>
        <p className="text-muted text-sm">{lineup.length} players | {totalFP.toFixed(1)} total fantasy points</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Roster</h2>
          <span className="text-lg font-bold text-accent">{totalFP.toFixed(1)} FP</span>
        </div>
        <div className="space-y-2">
          {lineup.map((player, i) => {
            if (!player) return null;
            const fp = player.fantasyPoints ?? 0;
            return (
              <div key={player.id} className="flex items-center justify-between p-3 rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted w-5">{i + 1}</span>
                  <div>
                    <p className="text-sm font-semibold">{player.name}</p>
                    <p className="text-xs text-muted">{player.teamAbbr} | {player.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: getValueColor(fp) }}>{fp.toFixed(1)}</p>
                  <p className="text-xs text-muted">{getValueCategory(fp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center animate-fade-in">
        <p className="text-sm text-muted mb-3">Want to build your own lineup?</p>
        <Link
          href="/matchup"
          className="inline-block px-6 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
        >
          Open Matchup Analyzer
        </Link>
      </div>
    </div>
  );
}

export default function SharedPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted">Loading lineup...</div>}>
      <SharedLineupContent />
    </Suspense>
  );
}
