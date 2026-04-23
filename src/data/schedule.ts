export interface WeekSchedule {
  week: number;
  startDate: string;
  endDate: string;
  games: GameSlot[];
}

export interface GameSlot {
  date: string;
  away: string;
  home: string;
}

export function getGamesForTeam(teamAbbr: string, week: number): GameSlot[] {
  const weekData = WNBA_SCHEDULE.find((w) => w.week === week);
  if (!weekData) return [];
  return weekData.games.filter((g) => g.away === teamAbbr || g.home === teamAbbr);
}

export function getTeamGameCounts(week: number): Record<string, number> {
  const weekData = WNBA_SCHEDULE.find((w) => w.week === week);
  if (!weekData) return {};
  const counts: Record<string, number> = {};
  for (const game of weekData.games) {
    counts[game.away] = (counts[game.away] ?? 0) + 1;
    counts[game.home] = (counts[game.home] ?? 0) + 1;
  }
  return counts;
}

export const WNBA_SCHEDULE: WeekSchedule[] = [
  {
    week: 1,
    startDate: "2025-05-16",
    endDate: "2025-05-22",
    games: [
      { date: "2025-05-16", away: "IND", home: "CON" },
      { date: "2025-05-16", away: "DAL", home: "LVA" },
      { date: "2025-05-16", away: "CHI", home: "MIN" },
      { date: "2025-05-17", away: "NYL", home: "ATL" },
      { date: "2025-05-17", away: "SEA", home: "PHX" },
      { date: "2025-05-17", away: "WAS", home: "LAS" },
      { date: "2025-05-17", away: "GSV", home: "DAL" },
      { date: "2025-05-18", away: "LVA", home: "MIN" },
      { date: "2025-05-18", away: "CON", home: "CHI" },
      { date: "2025-05-18", away: "IND", home: "NYL" },
      { date: "2025-05-20", away: "ATL", home: "WAS" },
      { date: "2025-05-20", away: "PHX", home: "SEA" },
      { date: "2025-05-20", away: "LAS", home: "GSV" },
      { date: "2025-05-21", away: "MIN", home: "CON" },
      { date: "2025-05-21", away: "DAL", home: "IND" },
      { date: "2025-05-21", away: "CHI", home: "NYL" },
      { date: "2025-05-22", away: "LVA", home: "PHX" },
      { date: "2025-05-22", away: "SEA", home: "ATL" },
    ],
  },
  {
    week: 2,
    startDate: "2025-05-23",
    endDate: "2025-05-29",
    games: [
      { date: "2025-05-23", away: "CON", home: "IND" },
      { date: "2025-05-23", away: "NYL", home: "CHI" },
      { date: "2025-05-23", away: "GSV", home: "LVA" },
      { date: "2025-05-24", away: "WAS", home: "ATL" },
      { date: "2025-05-24", away: "PHX", home: "DAL" },
      { date: "2025-05-24", away: "MIN", home: "SEA" },
      { date: "2025-05-25", away: "LAS", home: "NYL" },
      { date: "2025-05-25", away: "CHI", home: "CON" },
      { date: "2025-05-25", away: "IND", home: "WAS" },
      { date: "2025-05-27", away: "LVA", home: "GSV" },
      { date: "2025-05-27", away: "ATL", home: "MIN" },
      { date: "2025-05-27", away: "DAL", home: "PHX" },
      { date: "2025-05-28", away: "SEA", home: "LAS" },
      { date: "2025-05-28", away: "NYL", home: "IND" },
      { date: "2025-05-29", away: "CON", home: "ATL" },
      { date: "2025-05-29", away: "CHI", home: "WAS" },
      { date: "2025-05-29", away: "MIN", home: "DAL" },
    ],
  },
  {
    week: 3,
    startDate: "2025-05-30",
    endDate: "2025-06-05",
    games: [
      { date: "2025-05-30", away: "LVA", home: "SEA" },
      { date: "2025-05-30", away: "GSV", home: "PHX" },
      { date: "2025-05-30", away: "IND", home: "CHI" },
      { date: "2025-05-31", away: "NYL", home: "CON" },
      { date: "2025-05-31", away: "ATL", home: "DAL" },
      { date: "2025-05-31", away: "WAS", home: "MIN" },
      { date: "2025-06-01", away: "LAS", home: "LVA" },
      { date: "2025-06-01", away: "SEA", home: "GSV" },
      { date: "2025-06-01", away: "PHX", home: "IND" },
      { date: "2025-06-03", away: "CON", home: "NYL" },
      { date: "2025-06-03", away: "CHI", home: "ATL" },
      { date: "2025-06-03", away: "DAL", home: "WAS" },
      { date: "2025-06-04", away: "MIN", home: "LAS" },
      { date: "2025-06-04", away: "LVA", home: "CHI" },
      { date: "2025-06-05", away: "GSV", home: "CON" },
      { date: "2025-06-05", away: "IND", home: "SEA" },
      { date: "2025-06-05", away: "PHX", home: "NYL" },
    ],
  },
  {
    week: 4,
    startDate: "2025-06-06",
    endDate: "2025-06-12",
    games: [
      { date: "2025-06-06", away: "ATL", home: "IND" },
      { date: "2025-06-06", away: "WAS", home: "CON" },
      { date: "2025-06-06", away: "DAL", home: "CHI" },
      { date: "2025-06-07", away: "NYL", home: "LVA" },
      { date: "2025-06-07", away: "MIN", home: "GSV" },
      { date: "2025-06-07", away: "SEA", home: "LAS" },
      { date: "2025-06-08", away: "PHX", home: "ATL" },
      { date: "2025-06-08", away: "CON", home: "WAS" },
      { date: "2025-06-08", away: "CHI", home: "DAL" },
      { date: "2025-06-10", away: "LVA", home: "NYL" },
      { date: "2025-06-10", away: "GSV", home: "MIN" },
      { date: "2025-06-10", away: "LAS", home: "SEA" },
      { date: "2025-06-11", away: "IND", home: "PHX" },
      { date: "2025-06-11", away: "ATL", home: "CON" },
      { date: "2025-06-12", away: "DAL", home: "NYL" },
      { date: "2025-06-12", away: "WAS", home: "CHI" },
    ],
  },
];

export const CURRENT_WEEK = 1;
