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
      <div className="p-12 lg:p-24 max-w-3xl mx-auto text-center">
        <div className="brutalist-card p-12">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Zero Pool Identified</h1>
          <p className="text-muted font-bold text-sm uppercase tracking-widest mb-8">This access link does not contain a valid operator lineup.</p>
          <Link href="/" className="brutalist-button px-10">
            RETURN TO COMMAND
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-12 max-w-3xl mx-auto">
      <div className="mb-12 relative">
        <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-accent opacity-30" />
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-accent text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest italic">External Transmission</span>
          <span className="text-muted text-[10px] font-bold uppercase tracking-widest">Protocol 04-WNBA</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-4 italic text-accent">{name}</h1>
        <p className="text-muted font-black text-sm uppercase tracking-wide border-l-2 border-border-heavy pl-4">
          External intelligence snapshot. {lineup.length} active operators synchronized.
        </p>
      </div>

      <div className="brutalist-card p-8 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 font-black text-6xl opacity-[0.05] pointer-events-none italic uppercase">Roster</div>
        <div className="flex items-center justify-between mb-8 border-b-2 border-border-heavy pb-4">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted italic">Deep Scan Roster</h2>
          <div className="text-right">
             <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Cumulative Value</p>
             <p className="text-3xl font-black font-mono italic text-accent">{totalFP.toFixed(1)} FP</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {lineup.map((player, i) => {
            if (!player) return null;
            const fp = player.fantasyPoints ?? 0;
            return (
              <div key={player.id} className="flex items-center justify-between p-4 border-2 border-border-heavy bg-background group hover:border-accent transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-black text-muted/30 font-mono italic group-hover:text-accent/30">{i + 1}</span>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight group-hover:text-foreground transition-colors">{player.name}</p>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{player.teamAbbr} | {player.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black font-mono italic" style={{ color: getValueColor(fp) }}>{fp.toFixed(1)}</p>
                  <p className="text-[10px] text-muted font-black uppercase tracking-widest">{getValueCategory(fp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="brutalist-card p-8 text-center bg-accent/5">
        <p className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-6 italic">Neural optimization ready for deployment.</p>
        <Link
          href="/matchup"
          className="brutalist-button px-12"
        >
          INITIALIZE ANALYZER
        </Link>
      </div>
    </div>
  );
}

export default function SharedPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-black uppercase tracking-[0.4em] animate-pulse">Initializing Neural Link...</div>}>
      <SharedLineupContent />
    </Suspense>
  );
}
