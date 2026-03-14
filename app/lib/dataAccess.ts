import fs from "node:fs/promises";
import path from "node:path";

import { clampHorizon, JAN_END_UTC, JAN_START_UTC } from "./constants";
import { selectLatestForecastAtHorizon } from "./horizonMatcher";
import { CuratedForecastRow, SeriesPoint, SeriesResponse, TargetForecastCandidate } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "processed", "curated_jan2024.json");

let cachedRows: CuratedForecastRow[] | null = null;

async function loadRows(): Promise<CuratedForecastRow[]> {
  if (cachedRows) {
    return cachedRows;
  }

  const raw = await fs.readFile(DATA_PATH, "utf8");
  const parsed = JSON.parse(raw) as { rows: CuratedForecastRow[] };
  cachedRows = parsed.rows;
  return parsed.rows;
}

function toMs(value: string): number {
  return Date.parse(value);
}

export async function getSeries(
  startTimeIso: string,
  endTimeIso: string,
  horizonHours: number,
): Promise<SeriesResponse> {
  const rows = await loadRows();
  const janStartMs = toMs(JAN_START_UTC);
  const janEndMs = toMs(JAN_END_UTC);

  const safeHorizon = clampHorizon(horizonHours);
  const requestedStartMs = Number.isNaN(toMs(startTimeIso)) ? janStartMs : toMs(startTimeIso);
  const requestedEndMs = Number.isNaN(toMs(endTimeIso)) ? janEndMs : toMs(endTimeIso);

  const startMs = Math.max(janStartMs, Math.min(requestedStartMs, requestedEndMs));
  const endMs = Math.min(janEndMs, Math.max(requestedStartMs, requestedEndMs));

  const grouped = new Map<
    string,
    { actualGeneration: number | null; candidates: TargetForecastCandidate[] }
  >();

  for (const row of rows) {
    const targetMs = toMs(row.targetTime);
    if (Number.isNaN(targetMs) || targetMs < startMs || targetMs > endMs) {
      continue;
    }

    const current = grouped.get(row.targetTime) ?? {
      actualGeneration: row.actualGeneration,
      candidates: [],
    };

    if (current.actualGeneration === null && row.actualGeneration !== null) {
      current.actualGeneration = row.actualGeneration;
    }

    if (row.forecastGeneration !== null && row.publishTime) {
      current.candidates.push({
        publishTime: row.publishTime,
        generation: row.forecastGeneration,
      });
    }

    grouped.set(row.targetTime, current);
  }

  const points: SeriesPoint[] = Array.from(grouped.entries())
    .sort((a, b) => toMs(a[0]) - toMs(b[0]))
    .map(([targetTime, data]) => {
      const matched = selectLatestForecastAtHorizon(targetTime, safeHorizon, data.candidates);
      const forecastGeneration = matched?.generation ?? null;
      const actualGeneration = data.actualGeneration;

      return {
        targetTime,
        actualGeneration,
        forecastGeneration,
        forecastPublishTime: matched?.publishTime ?? null,
        error:
          forecastGeneration !== null && actualGeneration !== null
            ? forecastGeneration - actualGeneration
            : null,
      };
    });

  return {
    startTime: new Date(startMs).toISOString(),
    endTime: new Date(endMs).toISOString(),
    horizonHours: safeHorizon,
    points,
  };
}
