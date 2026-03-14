"use client";

type HorizonSliderProps = {
  value: number;
  onChange: (next: number) => void;
};

export function HorizonSlider({ value, onChange }: HorizonSliderProps) {
  return (
    <section className="rounded-2xl border border-slate-300/60 bg-white/85 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Forecast Horizon</h2>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
          {value}h
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={48}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-emerald-600"
      />
      <p className="mt-2 text-xs text-slate-600">
        Latest forecast where publish time is at least {value} hours before target time.
      </p>
    </section>
  );
}
