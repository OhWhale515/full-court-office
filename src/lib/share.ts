import type { Player } from "./types";
import { getValueCategory } from "./scoring";

export interface ShareableLineup {
  name: string;
  players: Player[];
  totalFP: number;
  createdAt: string;
}

export function generateLineupText(lineup: ShareableLineup): string {
  const lines = [
    `${lineup.name} | Full Court Office`,
    `Total: ${lineup.totalFP.toFixed(1)} FP`,
    "",
    ...lineup.players.map(
      (p, i) =>
        `${i + 1}. ${p.name} (${p.teamAbbr}) - ${(p.fantasyPoints ?? 0).toFixed(1)} FP`
    ),
    "",
    "Built with Full Court Office - WNBA Fantasy Companion",
  ];
  return lines.join("\n");
}

export function generateLineupURL(lineup: ShareableLineup): string {
  const ids = lineup.players.map((p) => p.id).join(",");
  const params = new URLSearchParams({
    name: lineup.name,
    players: ids,
  });
  return `${typeof window !== "undefined" ? window.location.origin : ""}/shared?${params.toString()}`;
}

export async function shareLineup(lineup: ShareableLineup, method: "native" | "copy" | "twitter" | "sms" | "email") {
  const text = generateLineupText(lineup);
  const url = generateLineupURL(lineup);

  switch (method) {
    case "native": {
      if (navigator.share) {
        await navigator.share({
          title: `${lineup.name} | Full Court Office`,
          text: text,
          url: url,
        });
        return true;
      }
      return false;
    }
    case "copy": {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      return true;
    }
    case "twitter": {
      const tweetText = encodeURIComponent(
        `My WNBA Fantasy Lineup (${lineup.totalFP.toFixed(1)} FP):\n${lineup.players.map((p) => p.name).join(", ")}\n\nBuilt with Full Court Office`
      );
      window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(url)}`, "_blank");
      return true;
    }
    case "sms": {
      const smsBody = encodeURIComponent(`${text}\n${url}`);
      window.open(`sms:?body=${smsBody}`, "_self");
      return true;
    }
    case "email": {
      const subject = encodeURIComponent(`${lineup.name} | Full Court Office`);
      const body = encodeURIComponent(`${text}\n\n${url}`);
      window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
      return true;
    }
  }
}

const SAVED_LINEUPS_KEY = "fco-saved-lineups";

export function getSavedLineups(): ShareableLineup[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_LINEUPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLineup(lineup: ShareableLineup) {
  const existing = getSavedLineups();
  const updated = [lineup, ...existing.filter((l) => l.name !== lineup.name)].slice(0, 20);
  localStorage.setItem(SAVED_LINEUPS_KEY, JSON.stringify(updated));
}

export function deleteLineup(name: string) {
  const existing = getSavedLineups();
  localStorage.setItem(SAVED_LINEUPS_KEY, JSON.stringify(existing.filter((l) => l.name !== name)));
}
