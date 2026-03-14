export const JAN_START_UTC = "2024-01-01T00:00:00Z";
export const JAN_END_UTC = "2024-01-31T23:30:00Z";
export const MIN_HORIZON_HOURS = 0;
export const MAX_HORIZON_HOURS = 48;

export function clampHorizon(hours: number): number {
  if (Number.isNaN(hours)) {
    return MIN_HORIZON_HOURS;
  }
  return Math.min(MAX_HORIZON_HOURS, Math.max(MIN_HORIZON_HOURS, Math.round(hours)));
}
