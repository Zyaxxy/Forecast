import { NextRequest, NextResponse } from "next/server";

import { JAN_END_UTC, JAN_START_UTC, MIN_HORIZON_HOURS } from "@/lib/constants";
import { getSeries } from "@/lib/dataAccess";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const start = searchParams.get("start") ?? JAN_START_UTC;
  const end = searchParams.get("end") ?? JAN_END_UTC;
  const horizonRaw = searchParams.get("horizon") ?? String(MIN_HORIZON_HOURS);

  const horizon = Number(horizonRaw);

  try {
    const payload = await getSeries(start, end, horizon);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to build series payload.",
        detail: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
