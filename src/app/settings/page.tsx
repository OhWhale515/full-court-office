"use client";

import { useState, useEffect } from "react";
import { DEFAULT_WEIGHTS } from "@/lib/scoring";
import { getStoredConfig, saveConfig, clearConfig, saveLeagueData, getStoredLeagueData, type StoredConfig } from "@/lib/league-store";

export default function SettingsPage() {
  const [config, setConfig] = useState<StoredConfig>({ leagueId: "", seasonId: "2025", espnS2: "", swid: "" });
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const stored = getStoredConfig();
    if (stored) {
      setConfig(stored);
      setIsConnected(!!stored.lastSync);
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
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-muted text-sm">League configuration and ESPN sync</p>
      </div>

      {/* ESPN Integration */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">ESPN League Sync</h2>
          {isConnected && (
            <span className="flex items-center gap-1.5 text-xs text-green">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              Connected
            </span>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs text-muted block mb-1">League ID</label>
            <input
              type="text"
              value={config.leagueId}
              onChange={(e) => setConfig({ ...config, leagueId: e.target.value })}
              placeholder="e.g., 123456789"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-muted/60 mt-1">Found in your ESPN league URL</p>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Season</label>
            <select
              value={config.seasonId}
              onChange={(e) => setConfig({ ...config, seasonId: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-xs text-accent mb-2">For private leagues only:</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted block mb-1">espn_s2 Cookie</label>
                <input
                  type="password"
                  value={config.espnS2}
                  onChange={(e) => setConfig({ ...config, espnS2: e.target.value })}
                  placeholder="Paste from browser cookies"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">SWID Cookie</label>
                <input
                  type="password"
                  value={config.swid}
                  onChange={(e) => setConfig({ ...config, swid: e.target.value })}
                  placeholder="{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={!config.leagueId || syncing}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {syncing ? "Syncing..." : isConnected ? "Re-sync" : "Connect League"}
          </button>
          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2.5 rounded-lg text-sm text-muted hover:text-red bg-background transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>

        {syncResult && (
          <div className={`mt-3 p-3 rounded-lg text-sm ${syncResult.success ? "bg-green/10 text-green" : "bg-red/10 text-red"}`}>
            {syncResult.message}
          </div>
        )}

        {config.lastSync && (
          <p className="text-xs text-muted mt-3">
            Last synced: {new Date(config.lastSync).toLocaleString()}
          </p>
        )}

        <div className="mt-4 p-3 rounded-lg bg-background">
          <p className="text-xs text-muted mb-2">How to find your cookies (private leagues):</p>
          <ol className="text-xs text-muted/70 space-y-1 list-decimal list-inside">
            <li>Log in to ESPN Fantasy in your browser</li>
            <li>Open Developer Tools (F12) &gt; Application &gt; Cookies</li>
            <li>Find espn_s2 and SWID cookies</li>
            <li>Copy and paste their values above</li>
          </ol>
        </div>
      </div>

      {/* League Info */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6 animate-fade-in">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">League Info</h2>
        <div className="space-y-3">
          <InfoRow label="League Name" value="Full Court Office" />
          <InfoRow label="Commissioner" value="Commissioner Jones" />
          <InfoRow label="Platform" value="ESPN Fantasy Sports" />
          <InfoRow label="Format" value="Head-to-Head" />
          <InfoRow label="Teams" value="4 (expandable)" />
          <InfoRow label="Roster Size" value="8 players" />
          <InfoRow label="Draft Type" value="Snake Draft" />
          <InfoRow label="Waivers" value="Rolling" />
        </div>
      </div>

      {/* Scoring */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6 animate-fade-in">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">Scoring Weights</h2>
        <div className="space-y-3">
          <WeightRow label="Points" value={DEFAULT_WEIGHTS.points} />
          <WeightRow label="Rebounds" value={DEFAULT_WEIGHTS.rebounds} />
          <WeightRow label="Assists" value={DEFAULT_WEIGHTS.assists} />
          <WeightRow label="Steals" value={DEFAULT_WEIGHTS.steals} accent />
          <WeightRow label="Blocks" value={DEFAULT_WEIGHTS.blocks} accent />
          <WeightRow label="Turnovers" value={DEFAULT_WEIGHTS.turnovers} negative />
          <WeightRow label="3-Pointers Made" value={DEFAULT_WEIGHTS.threePointersMade} />
        </div>
      </div>

      {/* Weekly Flow */}
      <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">Weekly Flow</h2>
        <ol className="space-y-2">
          {[
            "Set lineup in ESPN app",
            "Use Matchup Analyzer for start/sit decisions",
            "Check Streaming Guide for waiver pickups",
            "Review matchup outcome",
            "Evaluate trades with Trade Evaluator",
            "Check Discord for weekly summaries (optional)",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <span className="text-muted">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function WeightRow({ label, value, accent, negative }: { label: string; value: number; accent?: boolean; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted">{label}</span>
      <span className={`text-sm font-bold ${accent ? "text-accent" : negative ? "text-red" : ""}`}>
        {value > 0 ? `${value}x` : `${value}`}
      </span>
    </div>
  );
}
