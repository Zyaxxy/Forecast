"use client";

import { JAN_END_UTC, JAN_START_UTC } from "@/lib/constants";

type TimeRangeControlsProps = {
  startTime: string;
  endTime: string;
  onStartTimeChange: (next: string) => void;
  onEndTimeChange: (next: string) => void;
};

function isoToDatetimeInput(value: string): string {
  return value.slice(0, 16);
}

function datetimeInputToIso(value: string): string {
  return `${value}:00Z`;
}

export function TimeRangeControls({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: TimeRangeControlsProps) {
  const minValue = isoToDatetimeInput(JAN_START_UTC);
  const maxValue = isoToDatetimeInput(JAN_END_UTC);

  return (
    <section className="grid gap-3 rounded-2xl border border-slate-300/60 bg-white/85 p-4 shadow-sm backdrop-blur md:grid-cols-2">
      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Start Time (UTC)</span>
        <input
          type="datetime-local"
          min={minValue}
          max={maxValue}
          step={1800}
          value={isoToDatetimeInput(startTime)}
          onChange={(event) => onStartTimeChange(datetimeInputToIso(event.target.value))}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">End Time (UTC)</span>
        <input
          type="datetime-local"
          min={minValue}
          max={maxValue}
          step={1800}
          value={isoToDatetimeInput(endTime)}
          onChange={(event) => onEndTimeChange(datetimeInputToIso(event.target.value))}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
      </label>
    </section>
  );
}
