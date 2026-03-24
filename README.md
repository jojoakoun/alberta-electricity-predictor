# Alberta Electricity Price Predictor ⚡

> Predicting Alberta's hourly electricity prices to help families,
> industrials, and producers make better energy decisions.

---

## The Problem

600,000 to 700,000 Albertans on variable-rate plans receive unpredictable
electricity bills. Without knowing when prices will spike, they cannot shift
their consumption to save money.

The AESO publishes hourly price forecasts — but consistently misses the most
critical spikes.

**This project builds a predictor that beats the AESO forecast.**

---

## Results

| Model | Overall MAE | Spike MAE (>300$/MWh) |
|-------|-------------|----------------------|
| Naive (mean price) | 81.98 $/MWh | — |
| Lag 1h (last price) | 29.22 $/MWh | — |
| **AESO forecast** | **22.68 $/MWh** | **207.83 $/MWh** |
| **Hybrid XGBoost** | **15.80 $/MWh** | **188.71 $/MWh** |
| **vs AESO** | **+30.4% better** | **+9.2% better** |

- Trained on : 2020-01-08 → 2024-12-31 (43,673 hours)
- Tested on  : 2025-01-01 → 2026-03-24 (10,746 hours)

---

## Who This Is For

| User | Decision | Value |
|------|----------|-------|
| 🏠 Family on variable rate | When to run appliances | Save 30–200$/month |
| 🏭 Industrial consumer | When to run production | Save thousands $/day |
| 🔥 Gas / battery producer | When to sell electricity | Maximize revenue |

---

## Architecture

```
AESO CSV (historical) ──→ PostgreSQL ──→ Feature Engineering ──→ Hybrid XGBoost ──→ FastAPI ──→ Web App
AESO API (real-time)  ──→ PostgreSQL ──→ Feature Engineering ──→ Hybrid XGBoost ──→ FastAPI ──→ Web App
```

### Hybrid Model Strategy

```
price_forecast < 100$/MWh  → XGBoost v1     (normal hours specialist)
price_forecast >= 100$/MWh → XGBoost tuned  (spike specialist — Optuna + spike weighting)
```

---

## Data Sources

- **AESO Historical CSV** — Hourly pool prices, AIL, generation (2020–2025)
- **AESO API** — Real-time prices, AIL forecasts (2025–present)

```
PostgreSQL
├── pool_prices   → 54,590 raw hourly rows
│   ├── source = "csv"  → 48,935 rows (2020–2025)
│   └── source = "api"  →  5,655 rows (2025–2026)
└── features      → 54,420 ML-ready rows (20 features)
```

---

## Features (20 total)

| Category | Features |
|----------|---------|
| 🔮 AESO forecast | `price_forecast` |
| ⚡ Demand | `consumption_actual` |
| 📅 Temporal | `hour_local`, `month`, `day_of_week`, `is_weekend` |
| 📈 Lag | `price_lag_1h`, `price_lag_2h`, `price_lag_24h`, `price_lag_168h` |
| 📊 Rolling | `price_rolling_24h`, `price_rolling_7d`, `price_rolling_30d` |
| 🏭 Generation | `total_generation_mw` |
| 🔌 Trade | `export_to_bc/mt/sk`, `import_from_bc/mt/sk` |

**Top 2 features by importance :**
- `price_forecast` → 70.7% (AESO forecast dominates)
- `price_lag_1h`   → 12.3% (spikes last multiple hours)

---

## Project Structure

```
alberta-electricity-predictor/
│
├── main.py                  # 🚀 Main entry point
├── data/                    # 📥 Raw CSV (gitignored)
├── models/                  # 🤖 Trained models (gitignored)
├── notebooks/
│   ├── eda.ipynb            # 🔍 Exploratory Data Analysis
│   └── model.ipynb          # 🤖 Model training and evaluation
├── src/
│   ├── fetch_aeso.py        # Load historical CSV
│   ├── fetch_aeso_api.py    # Fetch real-time API
│   ├── database.py          # PostgreSQL client
│   ├── load_historical.py   # CSV → PostgreSQL pipeline
│   ├── ingest_api.py        # API → PostgreSQL pipeline
│   └── build_features.py    # Feature engineering
├── app/
│   ├── backend/             # FastAPI (coming soon)
│   └── frontend/            # Web interface (coming soon)
└── requirements.txt
```

---

## Setup

```bash
# Clone the repository
git clone https://github.com/jojoakoun/alberta-electricity-predictor.git
cd alberta-electricity-predictor

# Create virtual environment (Python 3.12 required)
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your AESO API key and PostgreSQL credentials
```

---

## Usage

```bash
# Full database update (CSV + API + features)
python main.py update

# Individual commands
python main.py csv       # Load historical CSV only
python main.py api       # Fetch API data only
python main.py features  # Rebuild features only
python main.py report    # Print database status
```

---

## Environment Variables

```bash
# AESO API
AESO_API_KEY=your_key_here

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alberta_electricity
DB_USER=your_user
DB_PASSWORD=your_password
```

---

## Key EDA Findings

- **Evening peak** : 16h–20h Alberta time is 3x more expensive than night
- **AESO worst hours** : MAE ~40$/MWh at 17h–19h (vs ~6$/MWh at night)
- **AESO bias** : systematic overestimation on extreme events
- **Spike duration** : spikes last multiple hours — lag features are powerful

---

## Status

- [x] Project structure and Git setup
- [x] Historical data pipeline (48,935 hours — 2020 to 2025)
- [x] Real-time API pipeline (auto-detects latest timestamp)
- [x] PostgreSQL database (pool_prices + features tables)
- [x] Exploratory Data Analysis (11 key questions answered)
- [x] Feature engineering (20 features)
- [x] XGBoost v1 — MAE 13.87$/MWh overall
- [x] Optuna tuning + spike weighting
- [x] Hybrid model — MAE 15.80$/MWh overall, 188.71$/MWh on spikes
- [ ] FastAPI backend
- [ ] Web application
- [ ] Public deployment

---


*Joel-Hervé Akoun · Edmonton, Alberta*
*Solving a real problem for 600,000+ Albertans on variable-rate electricity plans.*
