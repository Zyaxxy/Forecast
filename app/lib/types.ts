export type CuratedForecastRow = {
  targetTime: string;
  publishTime: string | null;
  actualGeneration: number | null;
  forecastGeneration: number | null;
};

export type TargetForecastCandidate = {
  publishTime: string;
  generation: number;
};

export type SeriesPoint = {
  targetTime: string;
  actualGeneration: number | null;
  forecastGeneration: number | null;
  forecastPublishTime: string | null;
  error: number | null;
};

export type SeriesResponse = {
  startTime: string;
  endTime: string;
  horizonHours: number;
  points: SeriesPoint[];
};
