# Forecast Monitoring Application + Wind Generation Analysis

This project contains:
- A responsive Next.js dashboard for comparing UK wind actual generation vs forecast generation.
- A Jupyter notebook for January 2024 forecast error analysis and wind reliability recommendation.

## Project Structure

- `app/`, `components/`, `lib/`: Next.js TypeScript dashboard (pnpm)
- `data/scripts/`: ingestion and processing scripts
- `data/processed/`: curated dataset used by dashboard and notebook
- `analysis/wind_forecast_analysis.ipynb`: analysis deliverable

## Tech Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Recharts
- Data scripts: Python, pandas, requests
- Analysis: Jupyter Notebook, matplotlib, seaborn

## Setup

1. Install frontend dependencies:
   - `pnpm install`
2. Start the app from the repository root:
   - `pnpm dev`
3. Open `http://localhost:3000`

Note: Running `pnpm dev` from the empty `web/` folder can show:
`Failed to benchmark file I/O: No such file or directory (os error 2)`.
Run commands from the repository root to avoid this warning.

## Data Workflow

The app and notebook read from:
- `data/processed/curated_jan2024.json`

This repository now uses real BMRS data only.

1. Install Python deps:
   - `pip install -r data/requirements.txt`
2. Fetch and process January 2024 BMRS data:
   - `python3 data/scripts/fetch_bmrs.py`
   - `python3 data/scripts/normalize_data.py`
   - `python3 data/scripts/build_curated_table.py`


## Forecast Horizon Logic

For each target time `T` and selected horizon `H` hours:
- Eligible forecasts satisfy `publishTime <= T - H`.
- Eligible forecasts are additionally constrained to forecast age `<= 48h` (i.e., `publishTime >= T - 48h`).
- If multiple forecasts are eligible, select the latest by publish time.
- If none are eligible, the forecast value is missing and is not plotted.

Example:
- Target time: `2024-05-24 18:00`
- Horizon: `4h`
- Latest valid forecast must have `publishTime <= 2024-05-24 14:00`.

## Analysis Notebook

Open and run:
- `analysis/wind_forecast_analysis.ipynb`

Notebook sections include:
- Data loading and cleaning
- Forecast matching logic
- Error metrics: mean, median, std, p95, p99, MAE, RMSE
- Error vs horizon analysis
- Error vs time-of-day analysis
- Reliability analysis (distribution, variability, min, p50, p90, p95)
- Final reliable MW recommendation

## Deployment


Deployment link:

https://forecast-uk-2024.vercel.app/


## Requirements Coverage (Non-Deployment)

- January 2024 BMRS data ingestion for WIND actuals and WINDFOR forecasts: implemented.
- Forecast horizon control (0-48h): implemented.
- Latest-eligible forecast selection at horizon H: implemented.
- Missing forecasts ignored (no interpolation for display): implemented.
- Desktop + mobile responsive web UI: implemented.
- Analysis notebook with error characteristics + reliability recommendation and documented assumptions/trade-offs: implemented.

## AI Tool Usage Disclosure

AI tools were used for:
- Architecture planning
- Code scaffolding
- Refactoring and documentation support

