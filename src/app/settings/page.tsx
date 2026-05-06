"use client";

import { useState, useEffect } from "react";
import { DEFAULT_WEIGHTS } from "@/lib/scoring";
import { getStoredConfig, saveConfig, clearConfig, saveLeagueData, type StoredConfig } from "@/lib/league-store";

export default function SettingsPage() {
  const [config, setConfig] = useState<StoredConfig>({ leagueId: "", seasonId: "2025", espnS2: "", swid: "" });
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const stored = getStoredConfig();
    if (stored) {
      setTimeout(() => {
        setConfig(stored);
        setIsConnected(!!stored.lastSync);
      }, 0);
    }
  }, []);

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);

    try {
      const res = await fetch("/api/espn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sync");
      }

      const updatedConfig = { ...config, lastSync: new Date().toISOString() };
      saveConfig(updatedConfig);
      saveLeagueData(data);
      setConfig(updatedConfig);
      setIsConnected(true);
      setSyncResult({ success: true, message: `Synced "${data.leagueName}" with ${data.teams.length} teams` });
    } catch (error) {
      setSyncResult({ success: false, message: error instanceof Error ? error.message : "Sync failed" });
    } finally {
      setSyncing(false);
    }
  }

  function handleDisconnect() {
    clearConfig();
    setConfig({ leagueId: "", seasonId: "2025", espnS2: "", swid: "" });
    setIsConnected(false);
    setSyncResult(null);
  }

  return (
    <div className="p-6 lg:p-12 max-w-5xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-accent text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Configuration</span>
          <span className="text-muted text-[10px] font-bold uppercase tracking-widest">System Params</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-4">
          Control <span className="text-accent italic">Panel</span>
        </h1>
        <p className="text-muted font-bold text-sm uppercase tracking-wide max-w-md">
          Authentication and synchronization settings for live ESPN data integration.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* ESPN Integration */}
          <div className="brutalist-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 font-black text-6xl opacity-[0.03] pointer-events-none italic">SYNC</div>
            <div className="flex items-center justify-between mb-8 border-b-2 border-border-heavy pb-4">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted">ESPN Data Interface</h2>
              {isConnected && (
                <span className="flex items-center gap-2 text-[10px] font-black uppercase text-green">
                  <span className="w-2 h-2 bg-green animate-pulse" />
                  Live Stream Active
                </span>
              )}
            </div>

            <div className="space-y-6 mb-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">League ID</label>
                  <input
                    type="text"
                    value={config.leagueId}
                    onChange={(e) => setConfig({ ...config, leagueId: e.target.value })}
                    placeholder="E.G. 12345678"
                    className="w-full bg-background border-2 border-border-heavy p-4 text-sm font-black uppercase focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">Season</label>
                  <select
                    value={config.seasonId}
                    onChange={(e) => setConfig({ ...config, seasonId: e.target.value })}
                    className="w-full bg-background border-2 border-border-heavy p-4 text-sm font-black uppercase focus:border-accent focus:outline-none transition-colors"
                  >
                    <option value="2025">2025 SESSION</option>
                    <option value="2024">2024 SESSION</option>
                  </select>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-border-heavy pt-6">
                <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-4 italic underline decoration-2">Auth Cookies (Private Only)</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">espn_s2</label>
                    <input
                      type="password"
                      value={config.espnS2}
                      onChange={(e) => setConfig({ ...config, espnS2: e.target.value })}
                      placeholder="AUTH_TOKEN_STRING..."
                      className="w-full bg-background border-2 border-border-heavy p-4 text-xs font-mono focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">SWID</label>
                    <input
                      type="password"
                      value={config.swid}
                      onChange={(e) => setConfig({ ...config, swid: e.target.value })}
                      placeholder="{UUID-FORMAT-STRING}"
                      className="w-full bg-background border-2 border-border-heavy p-4 text-xs font-mono focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSync}
                disabled={!config.leagueId || syncing}
                className="brutalist-button py-4 px-10 flex-1"
              >
                {syncing ? "SYNCHRONIZING..." : isConnected ? "REFRESH CONNECTION" : "ESTABLISH LINK"}
              </button>
              {isConnected && (
                <button
                  onClick={handleDisconnect}
                  className="p-4 border-2 border-border-heavy font-black uppercase text-xs text-muted hover:border-red hover:text-red transition-all"
                >
                  DISCONNECT
                </button>
              )}
            </div>

            {syncResult && (
              <div className={`mt-6 p-4 border-2 font-black text-xs uppercase tracking-widest ${syncResult.success ? "bg-green/10 border-green text-green" : "bg-red/10 border-red text-red"}`}>
                {syncResult.message}
              </div>
            )}

            {config.lastSync && (
              <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-6 italic">
                Last integrity check: {new Date(config.lastSync).toLocaleString().toUpperCase()}
              </p>
            )}
          </div>

          {/* Scoring Weights */}
          <div className="brutalist-card p-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted mb-8 border-b-2 border-border-heavy pb-4">Multipliers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <WeightBox label="PTS" value={DEFAULT_WEIGHTS.points} />
              <WeightBox label="REB" value={DEFAULT_WEIGHTS.rebounds} />
              <WeightBox label="AST" value={DEFAULT_WEIGHTS.assists} />
              <WeightBox label="STL" value={DEFAULT_WEIGHTS.steals} accent />
              <WeightBox label="BLK" value={DEFAULT_WEIGHTS.blocks} accent />
              <WeightBox label="TO" value={DEFAULT_WEIGHTS.turnovers} negative />
              <WeightBox label="3PM" value={DEFAULT_WEIGHTS.threePointersMade} />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* League Meta */}
          <div className="brutalist-card p-6 bg-accent/5">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-6 border-b-2 border-accent/20 pb-2 italic">Institutional Meta</h2>
            <div className="space-y-4">
              <MetaRow label="Platform" value="ESPN" />
              <MetaRow label="Format" value="H2H Points" />
              <MetaRow label="Teams" value="4 (Active)" />
              <MetaRow label="Roster" value="8 Slots" />
              <MetaRow label="Draft" value="Snake" />
              <MetaRow label="Waivers" value="Rolling" />
            </div>
          </div>

          {/* Weekly Protocol */}
          <div className="brutalist-card p-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted mb-6 border-b-2 border-border-heavy pb-2">Weekly Protocol</h2>
            <div className="space-y-4">
              {[
                "Initialize ESPN lineups",
                "Execute neural startup analysis",
                "Execute schedule heat-map review",
                "Identify high-volume swap targets",
                "Evaluate trade vault differentials",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="text-xs font-black text-accent italic font-mono">0{i + 1}</span>
                  <span className="text-[11px] font-black uppercase tracking-tight text-muted leading-tight">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-2 border-dashed border-border-heavy">
             <p className="text-[10px] font-black text-muted uppercase tracking-widest leading-relaxed">
                System is optimized for the <span className="text-accent">WNBA 2025</span> regular season cycle. Neural weights are subject to commissioner adjustment.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeightBox({ label, value, accent, negative }: { label: string; value: number; accent?: boolean; negative?: boolean }) {
  return (
    <div className={`text-center p-4 border-2 ${accent ? "border-accent bg-accent/5" : negative ? "border-red/50 bg-red/5" : "border-border-heavy"}`}>
      <p className={`text-xl font-black font-mono italic ${accent ? "text-accent" : negative ? "text-red" : ""}`}>
        {value > 0 ? `${value}X` : `${value}`}
      </p>
      <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-border-heavy/20">
      <span className="text-[10px] font-black text-muted uppercase tracking-widest">{label}</span>
      <span className="text-xs font-black uppercase tracking-tighter italic">{value}</span>
    </div>
  );
}
