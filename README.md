# Alberta Electricity Price Predictor ⚡

**Live app:** https://spectacular-compassion-production-9e0c.up.railway.app  
**GitHub:** https://github.com/jojoakoun/alberta-electricity-predictor  
**Built by:** Joel-Hervé Akoun · Edmonton, Alberta

---

## Why I built this

In Alberta, the price of electricity changes every single hour. It can go from $5 at 3 a.m. to $1,000 during a cold winter evening. That is a 200x difference in one day.

The organization that runs Alberta's power grid — the AESO, or Alberta Electric System Operator — publishes an official hourly price forecast for 4.3 million Albertans. Their forecast is good. But it consistently misses the most expensive spikes, which are exactly the hours that cost families the most.

Most Albertans on variable-rate plans have no simple way to know when those spikes are coming. So they cannot shift their laundry, dishwasher, or EV charging to cheaper hours. They just pay whatever the market charges.

This project builds a predictor that beats the AESO forecast, and wraps it in a simple app that any family can use.

---

## Results

| Model | Overall accuracy | Spike accuracy (above $300/MWh) |
|-------|-----------------|--------------------------------|
| Naive guess (historical mean) | 81.98 $/MWh error | — |
| Last hour price | 29.22 $/MWh error | — |
| **AESO official forecast** | **22.68 $/MWh error** | **207.83 $/MWh error** |
| **Our Hybrid XGBoost** | **15.06 $/MWh error** | **189.99 $/MWh error** |
| **Improvement over AESO** | **+33.6% more accurate** | **+8.6% more accurate** |

Trained on 43,673 hours of data from January 2020 to December 2024.  
Tested on 10,746 hours from January 2025 to March 2026.

---

## Who this is for

Families on variable-rate plans in Alberta who want to know when to run their dryer, dishwasher, or charge their EV. Shifting even 10 kWh from a $500/MWh hour to a $30/MWh hour saves about $4.70 — that adds up to $50 to $200 per month.

---

## What it does

The app shows you a 24-hour price forecast, highlights the cheapest and most expensive hours, and compares our AI prediction with the AESO's official forecast hour by hour. It is fully bilingual in English and French, works on mobile, and updates automatically every hour.

---

## How it works

Every hour, the app fetches the latest prices from the AESO API, rebuilds the features, and serves fresh predictions through a FastAPI backend. The model is a hybrid XGBoost — a standard model for normal hours, and an Optuna-tuned spike specialist for expensive periods.
```
AESO historical CSV (2020 to 2025)
AESO real-time API (2025 to now)
        ↓
PostgreSQL database (54,590 hourly rows)
        ↓
Feature engineering (20 features)
        ↓
Hybrid XGBoost model
        ↓
FastAPI backend
        ↓
React dashboard (EN / FR)
```

---

## Tech stack

| Layer | What I used |
|-------|-------------|
| Data | AESO Historical CSV and AESO REST API |
| Database | PostgreSQL |
| Machine learning | XGBoost with Optuna hyperparameter tuning |
| Backend | FastAPI on Python 3.12 |
| Frontend | React with Recharts and Tailwind CSS |
| Fonts | Veneer for display, Open Sans for body |
| Languages | English and French (custom LanguageContext) |
| Deployment | Railway for backend, database, and scheduler. Railway for frontend. |

---

## The model in more detail

The two most important features are the AESO's own forecast (70.7% of the model's importance) and the price from the previous hour (12.3%). Everything else — time of day, rolling averages, imports and exports — contributes the remaining 17%.

The model uses a hybrid routing strategy. When the AESO forecast is below $100/MWh, the standard XGBoost model handles the prediction. When the forecast signals tension above $100/MWh, a spike specialist model takes over. That specialist was tuned with Optuna using 50 trials, with spike hours weighted 10x more heavily during training.

---

## API
```
GET /health                    Returns model status and accuracy metrics
GET /predict?date=YYYY-MM-DD   Returns 24-hour predictions for any date
GET /latest                    Returns the latest 24 hours of predictions
GET /model/info                Returns full model metadata
GET /docs                      Interactive Swagger UI
```

---

## Project structure
```
alberta-electricity-predictor/
│
├── main.py                    Orchestrator for the update pipeline
├── Procfile                   Railway backend configuration
├── .python-version            Locks Python 3.12 for XGBoost compatibility
├── requirements.txt
│
├── models/
│   ├── xgboost_v1.pkl         Standard model for normal hours
│   ├── xgboost_tuned.pkl      Spike specialist model
│   ├── best_params.json       Best Optuna parameters
│   └── metadata.json          Metrics and configuration
│
├── notebooks/
│   ├── eda.ipynb              Exploratory data analysis
│   └── model.ipynb            Model training and evaluation
│
├── src/
│   ├── fetch_aeso.py          Loads historical CSV
│   ├── fetch_aeso_api.py      Fetches real-time prices from AESO
│   ├── database.py            PostgreSQL client
│   ├── load_historical.py     CSV to PostgreSQL pipeline
│   ├── ingest_api.py          API to PostgreSQL pipeline
│   └── build_features.py      Feature engineering
│
└── app/
    ├── backend/main.py        FastAPI application
    └── frontend/src/
        ├── App.jsx
        ├── context/LanguageContext.jsx
        ├── i18n/translations.js
        ├── components/
        └── utils/
```

---

## Running it locally
```bash
# Clone the repo
git clone https://github.com/jojoakoun/alberta-electricity-predictor.git
cd alberta-electricity-predictor

# Create a Python 3.12 virtual environment
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Add your AESO API key and PostgreSQL credentials

# Load historical data and build features
python main.py update

# Train the model
# Open and run notebooks/model.ipynb

# Start the backend
uvicorn app.backend.main:app --reload --port 8000

# Start the frontend
cd app/frontend
npm install
npm run dev
```

---

## Environment variables
```
AESO_API_KEY      Your AESO API key
DB_HOST           PostgreSQL host
DB_PORT           5432
DB_NAME           alberta_electricity
DB_USER           Your database user
DB_PASSWORD       Your database password
```

---

## Deployment

Everything runs on Railway's free tier. The backend and frontend are separate services. A cron job runs `python main.py update` every hour to keep the data fresh. The model itself is retrained manually every month using the notebook, then committed to the repo for Railway to pick up on the next deploy.

---

## Status

- [x] Data pipeline — CSV and API to PostgreSQL
- [x] Exploratory data analysis
- [x] Feature engineering — 20 features
- [x] XGBoost baseline model
- [x] Optuna tuning and spike weighting
- [x] Hybrid model — 33.6% better than AESO overall
- [x] FastAPI backend
- [x] React frontend — bilingual EN/FR, mobile responsive
- [x] Production deployment on Railway
- [x] Automated hourly data pipeline

---

Built by Joel-Hervé Akoun in Edmonton, Alberta.  
Inspired by the builder philosophy at [manylatents](https://github.com/latent-reasoning-works/manylatents).  
LinkedIn: https://www.linkedin.com/in/joelakoun/