"use client";

import { ESPNLeagueData } from "./espn";

const STORAGE_KEY = "fco-espn-config";
const LEAGUE_DATA_KEY = "fco-league-data";

export interface StoredConfig {
  leagueId: string;
  seasonId: string;
  espnS2: string;
  swid: string;
  lastSync?: string;
}

export function getStoredConfig(): StoredConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveConfig(config: StoredConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearConfig() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEAGUE_DATA_KEY);
}

export function getStoredLeagueData(): ESPNLeagueData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LEAGUE_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLeagueData(data: ESPNLeagueData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEAGUE_DATA_KEY, JSON.stringify(data));
}
