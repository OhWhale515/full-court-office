"use client";

import { useState, useMemo } from "react";
import { WNBA_PLAYERS } from "@/data/players";
import { rankPlayers, getValueColor, getPointsBreakdown, DEFAULT_WEIGHTS } from "@/lib/scoring";
import type { Player } from "@/lib/types";

export default function TradePage() {
  const rankedPlayers = useMemo(() => rankPlayers(WNBA_PLAYERS), []);
  const [giving, setGiving] = useState<Player[]>([]);
  const [receiving, setReceiving] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [activeSide, setActiveSide] = useState<"give" | "receive">("give");

  const selected = new Set([...giving, ...receiving].map((p) => p.id));
  const available = rankedPlayers.filter(
    (p) => !selected.has(p.id) && (search === "" || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  function addPlayer(player: Player) {
    if (activeSide === "give") setGiving([...giving, player]);
    else setReceiving([...receiving, player]);
  }

  const totalGive = giving.reduce((sum, p) => sum + (p.fantasyPoints ?? 0), 0);
  const totalReceive = receiving.reduce((sum, p) => sum + (p.fantasyPoints ?? 0), 0);
  const diff = totalReceive - totalGive;
  const hasTrade = giving.length > 0 && receiving.length > 0;

  const categoryImpact = useMemo(() => {
    if (!hasTrade) return null;

    function getCatTotals(players: Player[]) {
      return players.reduce(
        (acc, p) => {
          const b = getPointsBreakdown(p.stats);
          return {
            scoring: acc.scoring + b.scoring,
            rebounds: acc.rebounds + b.rebounds,
            assists: acc.assists + b.assists,
            steals: acc.steals + b.steals,
            blocks: acc.blocks + b.blocks,
            turnovers: acc.turnovers + b.turnovers,
            threePointers: acc.threePointers + b.threePointers,
          };
        },
        { scoring: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, threePointers: 0 }
      );
    }

    const giveCats = getCatTotals(giving);
    const receiveCats = getCatTotals(receiving);

    const categories = [
      { label: "Scoring", weight: `${DEFAULT_WEIGHTS.points}x`, give: giveCats.scoring, receive: receiveCats.scoring },
      { label: "Rebounds", weight: `${DEFAULT_WEIGHTS.rebounds}x`, give: giveCats.rebounds, receive: receiveCats.rebounds },
      { label: "Assists", weight: `${DEFAULT_WEIGHTS.assists}x`, give: giveCats.assists, receive: receiveCats.assists },
      { label: "Steals", weight: `${DEFAULT_WEIGHTS.steals}x`, give: giveCats.steals, receive: receiveCats.steals },
      { label: "Blocks", weight: `${DEFAULT_WEIGHTS.blocks}x`, give: giveCats.blocks, receive: receiveCats.blocks },
      { label: "Turnovers", weight: `${DEFAULT_WEIGHTS.turnovers}`, give: giveCats.turnovers, receive: receiveCats.turnovers },
      { label: "3-Pointers", weight: `${DEFAULT_WEIGHTS.threePointersMade}x`, give: giveCats.threePointers, receive: receiveCats.threePointers },
    ];

    return categories.map((c) => ({
      ...c,
      change: c.receive - c.give,
    }));
  }, [giving, receiving, hasTrade]);

  function getVerdict() {
    if (!hasTrade) return null;
    const pct = totalGive > 0 ? (diff / totalGive) * 100 : 0;
    if (Math.abs(pct) < 5) return { label: "Fair Trade", color: "#10b981", detail: "Within 5% of equal value", emoji: "=" };
    if (pct > 15) return { label: "Strong Win", color: "#f59e0b", detail: `You gain ${diff.toFixed(1)} FP per game`, emoji: "W" };
    if (pct > 5) return { label: "Slight Win", color: "#3b82f6", detail: `You gain ${diff.toFixed(1)} FP per game`, emoji: "W" };
    if (pct < -15) return { label: "Bad Deal", color: "#ef4444", detail: `You lose ${Math.abs(diff).toFixed(1)} FP per game`, emoji: "L" };
    return { label: "Slight Loss", color: "#f97316", detail: `You lose ${Math.abs(diff).toFixed(1)} FP per game`, emoji: "L" };
  }

  const verdict = getVerdict();

  const fairSuggestion = useMemo(() => {
    if (!hasTrade || Math.abs(diff) < 2) return null;
    if (diff > 0) {
      const needed = available.filter((p) => {
        const pfp = p.fantasyPoints ?? 0;
        return pfp >= diff * 0.7 && pfp <= diff * 1.3;
      }).slice(0, 3);
      return { side: "give" as const, players: needed, target: diff };
    } else {
      const needed = available.filter((p) => {
        const pfp = p.fantasyPoints ?? 0;
        return pfp >= Math.abs(diff) * 0.7 && pfp <= Math.abs(diff) * 1.3;
      }).slice(0, 3);
      return { side: "receive" as const, players: needed, target: Math.abs(diff) };
    }
  }, [hasTrade, diff, available]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-1">Trade Evaluator</h1>
        <p className="text-muted text-sm">Analyze trade value with category-level impact</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Giving */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-red">You Give</h2>
            <span className="text-lg font-bold text-red">{totalGive.toFixed(1)} FP</span>
          </div>
          <button
            onClick={() => setActiveSide("give")}
            className={`w-full py-2 rounded-lg text-sm mb-3 transition-colors ${activeSide === "give" ? "bg-red/20 text-red" : "bg-background text-muted hover:text-foreground"}`}
          >
            + Add player to give
          </button>
          {giving.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-background mb-1.5 group">
              <div>
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-xs text-muted ml-2">{p.teamAbbr} | {p.position}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: getValueColor(p.fantasyPoints ?? 0) }}>{(p.fantasyPoints ?? 0).toFixed(1)}</span>
                <button onClick={() => setGiving(giving.filter((x) => x.id !== p.id))} className="text-xs text-muted hover:text-red opacity-0 group-hover:opacity-100">x</button>
              </div>
            </div>
          ))}
        </div>

        {/* Player search */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
            Adding to: <span className={activeSide === "give" ? "text-red" : "text-green"}>{activeSide === "give" ? "Give" : "Receive"}</span>
          </h2>
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-accent"
          />
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {available.slice(0, 30).map((p) => (
              <button
                key={p.id}
                onClick={() => addPlayer(p)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-card-hover transition-colors text-left"
              >
                <div>
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-xs text-muted ml-2">{p.teamAbbr}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: getValueColor(p.fantasyPoints ?? 0) }}>{(p.fantasyPoints ?? 0).toFixed(1)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Receiving */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-green">You Receive</h2>
            <span className="text-lg font-bold text-green">{totalReceive.toFixed(1)} FP</span>
          </div>
          <button
            onClick={() => setActiveSide("receive")}
            className={`w-full py-2 rounded-lg text-sm mb-3 transition-colors ${activeSide === "receive" ? "bg-green/20 text-green" : "bg-background text-muted hover:text-foreground"}`}
          >
            + Add player to receive
          </button>
          {receiving.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-background mb-1.5 group">
              <div>
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-xs text-muted ml-2">{p.teamAbbr} | {p.position}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: getValueColor(p.fantasyPoints ?? 0) }}>{(p.fantasyPoints ?? 0).toFixed(1)}</span>
                <button onClick={() => setReceiving(receiving.filter((x) => x.id !== p.id))} className="text-xs text-muted hover:text-red opacity-0 group-hover:opacity-100">x</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verdict */}
      {verdict && (
        <div className="bg-card border border-border rounded-xl p-6 mt-6 animate-fade-in">
          <div className="text-center mb-6">
            <p className="text-3xl font-bold mb-1" style={{ color: verdict.color }}>{verdict.label}</p>
            <p className="text-sm text-muted">{verdict.detail}</p>
          </div>

          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-xl font-bold text-red">{totalGive.toFixed(1)}</p>
              <p className="text-xs text-muted">Giving Up</p>
            </div>
            <div className="text-2xl text-muted">&rarr;</div>
            <div className="text-center">
              <p className="text-xl font-bold text-green">{totalReceive.toFixed(1)}</p>
              <p className="text-xs text-muted">Receiving</p>
            </div>
            <div className="text-center border-l border-border pl-8">
              <p className={`text-xl font-bold ${diff >= 0 ? "text-green" : "text-red"}`}>
                {diff >= 0 ? "+" : ""}{diff.toFixed(1)}
              </p>
              <p className="text-xs text-muted">Net FP/game</p>
            </div>
          </div>

          {/* Category Impact */}
          {categoryImpact && (
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">Category Impact</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {categoryImpact.map((cat) => (
                  <div key={cat.label} className="p-3 rounded-lg bg-background">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted">{cat.label}</span>
                      <span className="text-xs text-muted/60">{cat.weight}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red">{cat.give.toFixed(1)}</span>
                        <span className="text-xs text-muted">&rarr;</span>
                        <span className="text-xs text-green">{cat.receive.toFixed(1)}</span>
                      </div>
                      <span className={`text-sm font-bold ${
                        cat.label === "Turnovers"
                          ? cat.change < 0 ? "text-green" : cat.change > 0 ? "text-red" : "text-muted"
                          : cat.change > 0 ? "text-green" : cat.change < 0 ? "text-red" : "text-muted"
                      }`}>
                        {cat.change >= 0 ? "+" : ""}{cat.change.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fair Trade Suggestions */}
          {fairSuggestion && fairSuggestion.players.length > 0 && (
            <div className="border-t border-border pt-4 mt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
                To make it fair, {fairSuggestion.side === "give" ? "add to your give side" : "ask for"}:
              </h3>
              <div className="flex flex-wrap gap-2">
                {fairSuggestion.players.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border">
                    <span className="text-sm">{p.name}</span>
                    <span className="text-xs text-muted">{p.teamAbbr}</span>
                    <span className="text-xs font-bold" style={{ color: getValueColor(p.fantasyPoints ?? 0) }}>
                      {(p.fantasyPoints ?? 0).toFixed(1)} FP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
