"use client";

import { useEffect, useMemo, useState } from "react";

import { JAN_END_UTC, JAN_START_UTC } from "@/lib/constants";
import { SeriesPoint, SeriesResponse } from "@/lib/types";

import { ForecastChart } from "./ForecastChart";
import { HorizonSlider } from "./HorizonSlider";
import { TimeRangeControls } from "./TimeRangeControls";

const DEFAULT_END = "2024-01-03T23:30:00Z";

export function DashboardClient() {
  const [startTime, setStartTime] = useState(JAN_START_UTC);
  const [endTime, setEndTime] = useState(DEFAULT_END);
  const [horizonHours, setHorizonHours] = useState(4);
  const [points, setPoints] = useState<SeriesPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSeries() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const params = new URLSearchParams({
          start: startTime,
          end: endTime,
          horizon: String(horizonHours),
        });

        const response = await fetch(`/api/series?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as SeriesResponse;
        setPoints(payload.points);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setErrorMessage("Unable to load BMRS-backed dashboard data. Rebuild the processed January 2024 dataset.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadSeries();

    return () => controller.abort();
  }, [startTime, endTime, horizonHours]);

  const summary = useMemo(() => {
    const available = points.filter((point) => point.forecastGeneration !== null).length;
    return `${points.length} target points, ${available} with valid forecast for selected horizon.`;
  }, [points]);

  return (
    <div className="grid gap-4">
      <TimeRangeControls
        startTime={startTime}
        endTime={endTime}
        onStartTimeChange={setStartTime}
        onEndTimeChange={setEndTime}
      />
      <HorizonSlider value={horizonHours} onChange={setHorizonHours} />
      {errorMessage ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p> : null}
      <p className="text-sm text-slate-700">{summary}</p>
      <ForecastChart points={points} loading={loading} />
      <p className="text-xs text-slate-500">
        Source: Elexon BMRS January 2024 data. Date limits are fixed to January 2024 ({JAN_START_UTC} to {JAN_END_UTC}).
      </p>
    </div>
  );
}
