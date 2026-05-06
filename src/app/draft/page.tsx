"use client";

import { useState, useMemo } from "react";
import { WNBA_PLAYERS } from "@/data/players";
import { rankPlayers, getValueColor, DEFAULT_WEIGHTS } from "@/lib/scoring";
import type { Player } from "@/lib/types";

export default function DraftPage() {
  const [drafted, setDrafted] = useState<Set<string>>(new Set());
  const [teams, setTeams] = useState<Player[][]>([[], [], [], []]);
  const [currentPick, setCurrentPick] = useState(1);
  const [search, setSearch] = useState("");

  const rankedPlayers = useMemo(() => rankPlayers(WNBA_PLAYERS), []);

  const available = useMemo(() => {
    return rankedPlayers.filter(p => !drafted.has(p.id) && (search === "" || p.name.toLowerCase().includes(search.toLowerCase())));
  }, [rankedPlayers, drafted, search]);

  // VORP Logic: FP minus the FP of the Nth player at that position
  // N = (teams * slots per position) + 1
  const vorpMap = useMemo(() => {
    const posCounts = { "G": 8, "F": 8, "C": 4 }; // Rough estimate for 4 teams
    const results: Record<string, number> = {};

    ["G", "F", "C"].forEach(pos => {
      const posPlayers = rankedPlayers.filter(p => p.position.includes(pos));
      const replacementIndex = posCounts[pos as keyof typeof posCounts];
      const replacementValue = posPlayers[replacementIndex]?.fantasyPoints ?? 15;
      
      posPlayers.forEach(p => {
        if (!results[p.id] || (p.fantasyPoints ?? 0) - replacementValue > results[p.id]) {
          results[p.id] = (p.fantasyPoints ?? 0) - replacementValue;
        }
      });
    });

    return results;
  }, [rankedPlayers]);

  const numTeams = 4;
  const isSnakeForward = Math.floor((currentPick - 1) / numTeams) % 2 === 0;
  const currentTeamIndex = isSnakeForward 
    ? (currentPick - 1) % numTeams 
    : numTeams - 1 - ((currentPick - 1) % numTeams);

  function pickPlayer(player: Player) {
    if (drafted.has(player.id)) return;
    
    const newDrafted = new Set(drafted);
    newDrafted.add(player.id);
    setDrafted(newDrafted);

    const newTeams = [...teams];
    newTeams[currentTeamIndex] = [...newTeams[currentTeamIndex], player];
    setTeams(newTeams);

    setCurrentPick(currentPick + 1);
  }

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-accent text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Draft Operation</span>
          <span className="text-muted text-[10px] font-bold uppercase tracking-widest">Active Session</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-4">
          Snake <span className="text-accent italic">Draft</span>
        </h1>
        <p className="text-muted font-bold text-sm uppercase tracking-wide max-w-xl">
          Strategic player acquisition module. Real-time VORP (Value Over Replacement Player) calculation and roster balancing.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Column: Player Pool */}
        <div className="lg:col-span-2 space-y-6">
          <div className="brutalist-card p-6">
            <h2 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-4 border-b-2 border-border-heavy pb-2">Available Operators</h2>
            <input 
              type="text" 
              placeholder="SEARCH BY NAME..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border-2 border-border-heavy p-3 font-black uppercase text-sm mb-6 focus:border-accent focus:outline-none transition-colors"
            />
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {available.slice(0, 50).map((p) => {
                const vorp = vorpMap[p.id] ?? 0;
                return (
                  <button 
                    key={p.id}
                    onClick={() => pickPlayer(p)}
                    className="w-full flex items-center justify-between p-4 border-2 border-border-heavy bg-background hover:border-accent hover:translate-x-1 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-muted group-hover:text-accent font-mono">#{p.rank}</span>
                      <div className="text-left">
                        <p className="text-sm font-black uppercase tracking-tight">{p.name}</p>
                        <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{p.teamAbbr} | {p.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black font-mono italic" style={{ color: getValueColor(p.fantasyPoints ?? 0) }}>
                        {p.fantasyPoints?.toFixed(1)}
                      </p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${vorp > 0 ? "text-green" : "text-muted"}`}>
                        VORP: {vorp > 0 ? "+" : ""}{vorp.toFixed(1)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Draft State & Teams */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Pick Status */}
          <div className="brutalist-card p-8 bg-accent text-black border-black shadow-[8px_8px_0px_#000]">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">Now Selecting</p>
                   <p className="text-4xl font-black uppercase tracking-tighter italic leading-none">TEAM {currentTeamIndex + 1}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">Global Pick</p>
                   <p className="text-4xl font-black font-mono italic leading-none">#{currentPick}</p>
                </div>
             </div>
             <div className="flex items-center gap-4 border-t-2 border-black/20 pt-6">
                <div className="flex-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Round Progression</p>
                   <div className="h-4 bg-black/10 border border-black/20 relative">
                      <div 
                        className="h-full bg-black transition-all duration-500" 
                        style={{ width: `${((currentPick - 1) % numTeams) / numTeams * 100}%` }} 
                      />
                   </div>
                </div>
                <div className="bg-black text-accent px-4 py-2 font-black text-xs uppercase tracking-widest">
                   {isSnakeForward ? "FORWARD" : "REVERSE"}
                </div>
             </div>
          </div>

          {/* Teams Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {teams.map((team, idx) => (
              <div key={idx} className={`brutalist-card p-4 ${idx === currentTeamIndex ? "border-accent ring-2 ring-accent/20" : ""}`}>
                <div className="flex justify-between items-center mb-4 border-b-2 border-border-heavy pb-2">
                   <h3 className="text-xs font-black uppercase tracking-widest italic">TEAM {idx + 1}</h3>
                   <span className="text-[10px] font-black font-mono text-muted">{team.length}/8</span>
                </div>
                <div className="space-y-1.5">
                   {team.map((p, i) => (
                     <div key={p.id} className="flex justify-between items-center text-[11px] font-bold uppercase tracking-tight">
                        <span className="text-muted w-3">{i+1}</span>
                        <span className="flex-1 truncate">{p.name}</span>
                        <span className="text-accent ml-2 font-mono">{p.fantasyPoints?.toFixed(0)}</span>
                     </div>
                   ))}
                   {Array.from({ length: 8 - team.length }).map((_, i) => (
                     <div key={i} className="h-6 border border-dashed border-border-heavy flex items-center justify-center opacity-20">
                        <span className="text-[8px] font-black uppercase tracking-widest">Slot Open</span>
                     </div>
                   ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
