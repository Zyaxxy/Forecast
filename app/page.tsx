import { DashboardClient } from "./components/DashboardClient";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--paper)] px-4 py-8 text-slate-900 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -top-12 -right-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,_#a7f3d0,_transparent_60%)] blur-2xl" />
        <div className="absolute bottom-12 -left-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_#bfdbfe,_transparent_60%)] blur-2xl" />
      </div>

      <main className="relative mx-auto grid w-full max-w-6xl gap-6">
        <header className="rounded-3xl border border-slate-300/60 bg-white/80 p-6 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">January 2024 Dataset</p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight text-slate-900 md:text-4xl">
            UK Wind Forecast Monitoring Dashboard
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-700 md:text-base">
            Compare actual and forecasted wind generation with a strict publish-time horizon rule.
            Use the controls below to inspect forecast performance over any January 2024 window.
          </p>
        </header>

        <DashboardClient />
      </main>
    </div>
  );
}
