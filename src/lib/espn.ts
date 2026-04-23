export interface ESPNLeagueConfig {
  leagueId: string;
  seasonId: string;
  espnS2?: string;
  swid?: string;
}

export interface ESPNTeam {
  id: number;
  name: string;
  abbrev: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  roster: ESPNRosterEntry[];
}

export interface ESPNRosterEntry {
  playerId: number;
  playerName: string;
  position: string;
  team: string;
  lineupSlot: string;
}

export interface ESPNMatchup {
  week: number;
  homeTeamId: number;
  homeScore: number;
  awayTeamId: number;
  awayScore: number;
}

export interface ESPNLeagueData {
  leagueName: string;
  seasonId: number;
  teams: ESPNTeam[];
  matchups: ESPNMatchup[];
  scoringPeriodId: number;
}

const ESPN_BASE = "https://lm-api-reads.fantasy.espn.com/apis/v3/games";

export async function fetchESPNLeague(config: ESPNLeagueConfig): Promise<ESPNLeagueData> {
  const url = `${ESPN_BASE}/wnba/seasons/${config.seasonId}/segments/0/leagues/${config.leagueId}?view=mTeam&view=mRoster&view=mMatchup&view=mStandings&view=mSettings`;

  const headers: Record<string, string> = {
    "Accept": "application/json",
  };

  if (config.espnS2 && config.swid) {
    headers["Cookie"] = `espn_s2=${config.espnS2}; SWID=${config.swid}`;
  }

  const res = await fetch(url, { headers, next: { revalidate: 300 } });

  if (!res.ok) {
    throw new Error(`ESPN API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return parseESPNResponse(data);
}

function parseESPNResponse(data: Record<string, unknown>): ESPNLeagueData {
  const settings = data.settings as Record<string, unknown> | undefined;
  const leagueName = (settings?.name as string) ?? "Unknown League";
  const seasonId = (data.seasonId as number) ?? 2025;
  const scoringPeriodId = (data.scoringPeriodId as number) ?? 1;

  const rawTeams = (data.teams as Array<Record<string, unknown>>) ?? [];
  const teams: ESPNTeam[] = rawTeams.map((t) => {
    const record = t.record as Record<string, unknown> | undefined;
    const overall = (record?.overall as Record<string, unknown>) ?? {};
    const roster = t.roster as Record<string, unknown> | undefined;
    const entries = (roster?.entries as Array<Record<string, unknown>>) ?? [];

    return {
      id: (t.id as number) ?? 0,
      name: `${t.location ?? ""} ${t.nickname ?? ""}`.trim(),
      abbrev: (t.abbrev as string) ?? "",
      wins: (overall.wins as number) ?? 0,
      losses: (overall.losses as number) ?? 0,
      ties: (overall.ties as number) ?? 0,
      pointsFor: (overall.pointsFor as number) ?? (t.points as number) ?? 0,
      pointsAgainst: (overall.pointsAgainst as number) ?? 0,
      roster: entries.map((e) => {
        const playerInfo = e.playerPoolEntry as Record<string, unknown> | undefined;
        const player = (playerInfo?.player as Record<string, unknown>) ?? {};
        return {
          playerId: (e.playerId as number) ?? 0,
          playerName: (player.fullName as string) ?? "Unknown",
          position: getPositionName((player.defaultPositionId as number) ?? 0),
          team: getTeamAbbrev((player.proTeamId as number) ?? 0),
          lineupSlot: getSlotName((e.lineupSlotId as number) ?? 0),
        };
      }),
    };
  });

  const rawSchedule = (data.schedule as Array<Record<string, unknown>>) ?? [];
  const matchups: ESPNMatchup[] = rawSchedule
    .filter((m) => (m.home as Record<string, unknown>) && (m.away as Record<string, unknown>))
    .map((m) => {
      const home = m.home as Record<string, unknown>;
      const away = m.away as Record<string, unknown>;
      return {
        week: (m.matchupPeriodId as number) ?? 0,
        homeTeamId: (home.teamId as number) ?? 0,
        homeScore: (home.totalPoints as number) ?? 0,
        awayTeamId: (away.teamId as number) ?? 0,
        awayScore: (away.totalPoints as number) ?? 0,
      };
    });

  return { leagueName, seasonId, teams, matchups, scoringPeriodId };
}

function getPositionName(id: number): string {
  const map: Record<number, string> = { 1: "G", 2: "G", 3: "F", 4: "F", 5: "C" };
  return map[id] ?? "UTIL";
}

function getTeamAbbrev(id: number): string {
  const map: Record<number, string> = {
    1: "ATL", 2: "CHI", 3: "CON", 4: "DAL", 5: "IND",
    6: "LAS", 7: "LVA", 8: "MIN", 9: "NYL", 10: "PHX",
    11: "SEA", 12: "WAS", 13: "GSV",
  };
  return map[id] ?? "UNK";
}

function getSlotName(id: number): string {
  const map: Record<number, string> = {
    0: "G", 1: "G", 2: "F", 3: "F", 4: "C", 5: "UTIL", 6: "UTIL", 12: "BENCH", 13: "IR",
  };
  return map[id] ?? "BENCH";
}
