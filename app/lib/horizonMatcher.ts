import type { TargetForecastCandidate } from "./types";
import { MAX_HORIZON_HOURS } from "./constants";

export function selectLatestForecastAtHorizon(
  targetTimeIso: string,
  horizonHours: number,
  candidates: TargetForecastCandidate[],
): TargetForecastCandidate | null {
  if (candidates.length === 0) {
    return null;
  }

  const targetMs = Date.parse(targetTimeIso);
  if (Number.isNaN(targetMs)) {
    return null;
  }

  const cutoffMs = targetMs - horizonHours * 60 * 60 * 1000;
  const oldestAllowedMs = targetMs - MAX_HORIZON_HOURS * 60 * 60 * 1000;
  const eligible = candidates.filter((candidate) => {
    const publishMs = Date.parse(candidate.publishTime);
    return !Number.isNaN(publishMs) && publishMs <= cutoffMs && publishMs >= oldestAllowedMs;
  });

  if (eligible.length === 0) {
    return null;
  }

  eligible.sort((a, b) => Date.parse(b.publishTime) - Date.parse(a.publishTime));
  return eligible[0] ?? null;
}
