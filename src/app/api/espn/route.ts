import { NextRequest, NextResponse } from "next/server";
import { fetchESPNLeague } from "@/lib/espn";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leagueId, seasonId, espnS2, swid } = body;

    if (!leagueId) {
      return NextResponse.json({ error: "League ID is required" }, { status: 400 });
    }

    const data = await fetchESPNLeague({
      leagueId: String(leagueId),
      seasonId: String(seasonId ?? 2025),
      espnS2,
      swid,
    });

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch league data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
