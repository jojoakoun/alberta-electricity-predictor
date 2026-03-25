# Alberta Electricity Price Predictor ⚡

> Predicting Alberta's hourly electricity prices to help families save money
> on their variable-rate electricity bills.

**Live app :** coming soon
**Built by :** Joel-Hervé Akoun · Edmonton, Alberta

---

## The Problem

600,000+ Albertans on variable-rate plans receive unpredictable electricity
bills. The price changes every hour — from $5/MWh at 3AM to $1,000/MWh
during a winter evening spike. Without knowing when prices will spike,
families cannot shift their consumption to save money.

The AESO (Alberta Electric System Operator) publishes official hourly
forecasts — but consistently misses the most critical spikes.

**This project builds a predictor that beats the AESO forecast.**

---

## Results

| Model | Overall MAE | Spike MAE (>300$/MWh) |
|-------|-------------|----------------------|
| Naive (mean price) | 81.98 $/MWh | — |
| Lag 1h (last price) | 29.22 $/MWh | — |
| **AESO official forecast** | **22.68 $/MWh** | **207.83 $/MWh** |
| **Our Hybrid XGBoost** | **15.06 $/MWh** | **189.99 $/MWh** |
| **vs AESO** | **+33.6% better** | **+8.6% better** |

- Trained on : 2020-01-08 → 2024-12-31 (43,673 hours)
- Tested on  : 2025-01-01 → 2026-03-24 (10,746 hours)

---

## Who This Is For

| User | Decision | Value |
|------|----------|-------|
| 🏠 Family on variable rate | When to run appliances | Save $30–200/month |
| 🏭 Industrial consumer | When to run production | Save thousands $/day |
| 🔥 Gas / battery producer | When to sell electricity | Maximize revenue per MWh |

---

## Architecture
```
AESO CSV (historical) ──→
                          PostgreSQL ──→ Feature Engineering ──→ Hybrid XGBoost ──→ FastAPI ──→ React App
AESO API (real-time)  ──→
```

### Hybrid Model Strategy
```
price_forecast < 100$/MWh  → XGBoost v1     (normal hours — lowest overall MAE)
price_forecast >= 100$/MWh → XGBoost tuned  (spike hours — Optuna + spike weighting)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Data | AESO Historical CSV + AESO REST API |
| Database | PostgreSQL |
| ML | XGBoost + Optuna hyperparameter tuning |
| Backend | FastAPI (Python) |
| Frontend | React + Recharts |
| Deployment | Railway (backend + DB) + Vercel (frontend) |

---

## Data Pipeline
```
PostgreSQL
├── pool_prices   → 54,590 raw hourly rows
│   ├── source = "csv"  → 48,935 rows (2020–2025)
│   └── source = "api"  →  5,655 rows (2025–2026)
└── features      → 54,420 ML-ready rows (20 features)
```

Incremental update — detects latest timestamp automatically :
```bash
python main.py update   # fetch new data + rebuild features
```

---

## Features (20 total)

| Category | Features |
|----------|---------|
| 🔮 AESO forecast | `price_forecast` — 70.7% importance |
| 📈 Lag | `price_lag_1h` — 12.3% importance |
| 📅 Temporal | `hour_local`, `month`, `day_of_week`, `is_weekend` |
| 📈 More lags | `price_lag_2h`, `price_lag_24h`, `price_lag_168h` |
| 📊 Rolling | `price_rolling_24h`, `price_rolling_7d`, `price_rolling_30d` |
| ⚡ Demand | `consumption_actual`, `total_generation_mw` |
| 🔌 Trade | `export_to_bc/mt/sk`, `import_from_bc/mt/sk` |

---

## API Endpoints
```
GET /health              → API status + model accuracy
GET /predict?date=YYYY-MM-DD → 24h predictions for a specific date
GET /latest              → Latest 24h predictions
GET /model/info          → Full model metadata and metrics
GET /docs                → Interactive Swagger UI
```

---

## Project Structure
```
alberta-electricity-predictor/
│
├── main.py                  # 🚀 Orchestrator — update pipeline
├── Procfile                 # Railway deployment config
├── requirements.txt
│
├── data/                    # Raw CSV (gitignored)
├── models/                  # Trained models (gitignored)
│   ├── xgboost_v1.pkl
│   ├── xgboost_tuned.pkl
│   ├── best_params.json
│   └── metadata.json
│
├── notebooks/
│   ├── eda.ipynb            # Exploratory Data Analysis
│   └── model.ipynb          # Model training + evaluation
│
├── src/
│   ├── fetch_aeso.py        # Load historical CSV
│   ├── fetch_aeso_api.py    # Fetch real-time API
│   ├── database.py          # PostgreSQL client
│   ├── load_historical.py   # CSV → PostgreSQL
│   ├── ingest_api.py        # API → PostgreSQL
│   └── build_features.py    # Feature engineering
│
└── app/
    ├── backend/main.py      # FastAPI
    └── frontend/            # React app
        └── src/
            ├── App.jsx
            ├── components/
            │   ├── Header.jsx
            │   ├── HeroSection.jsx
            │   ├── ForecastChart.jsx
            │   ├── HourlyTable.jsx
            │   ├── ComparePanel.jsx
            │   ├── TrustBanner.jsx
            │   └── ExplainerSection.jsx
            └── utils/
                ├── insights.js
                └── formatters.js
```

---

## Setup
```bash
# 1. Clone
git clone https://github.com/jojoakoun/alberta-electricity-predictor.git
cd alberta-electricity-predictor

# 2. Python environment (Python 3.12 required — XGBoost incompatible with 3.14)
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Environment variables
cp .env.example .env
# Edit .env with your AESO API key and PostgreSQL credentials

# 4. Load data and train model
python main.py update        # load data + build features
# Then run notebooks/model.ipynb to train the model

# 5. Start backend
uvicorn app.backend.main:app --reload --port 8000

# 6. Start frontend
cd app/frontend
npm install
npm run dev
```

---

## Environment Variables
```bash
AESO_API_KEY=your_key_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alberta_electricity
DB_USER=your_user
DB_PASSWORD=your_password
```

---

## Key EDA Findings

- **83%** of hours are below 100$/MWh — only **2%** are spikes above 300$
- **Evening peak 16h–20h** is 3x more expensive than nighttime
- **AESO worst hours** : MAE ~40$/MWh at 17h–19h vs ~6$ at night
- **AESO systematic bias** : overestimates on extreme events
- **Spikes last multiple hours** — lag features are powerful signals

---

## Deployment

| Service | Platform | Cost |
|---------|----------|------|
| PostgreSQL | Railway | Free (1GB) |
| FastAPI backend | Railway | Free (750h/month) |
| React frontend | Vercel | Free |
| Cron scheduler | Railway | Free |

---

## Status

- [x] Data pipeline (CSV + API + PostgreSQL)
- [x] Exploratory Data Analysis
- [x] Feature engineering (20 features)
- [x] XGBoost v1 baseline — MAE 13.87$/MWh
- [x] Optuna tuning + spike weighting
- [x] Hybrid model — MAE 15.06$/MWh, beats AESO by 33.6%
- [x] FastAPI backend — 4 endpoints
- [x] React frontend — dashboard with chart, table, comparison
- [ ] Production deployment
- [ ] Automated hourly scheduler

---

*Joel-Hervé Akoun · Edmonton, Alberta*
*Built to solve a real problem for 600,000+ Albertans on variable-rate electricity plans.*
*Inspired by the builder philosophy at [manylatents](https://github.com/latent-reasoning-works/manylatents)*