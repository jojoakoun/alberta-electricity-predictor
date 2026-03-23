# Alberta Electricity Price Predictor ⚡

> Predicting Alberta's hourly electricity prices to help families,
> industrials, and producers make better energy decisions.

---

## The Problem

600,000 to 700,000 Albertans on variable-rate plans receive
unpredictable electricity bills. Without knowing when prices will
spike, they cannot shift their consumption to save money.

The AESO publishes hourly price forecasts — but consistently
misses the most critical spikes.

**This project builds a predictor that beats the AESO forecast,
especially during price spikes.**

---

## Who This Is For

| User | Decision | Value |
|------|----------|-------|
| 🏠 Family on variable rate | When to run appliances | Save 30–200$/month |
| 🏭 Industrial consumer | When to run production | Save thousands $/day |
| 🔥 Gas / battery producer | When to sell electricity | Maximize revenue |

---

## Data Sources

- **AESO Historical CSV** — Hourly pool prices, AIL, generation (2020–2025)
- **AESO API** — Real-time prices and forecasts
- **AESO API** — Alberta Internal Load (demand) forecasts

---

## Architecture
```
AESO CSV (historical) ──→ PostgreSQL ──→ ML Model ──→ FastAPI ──→ Web App
AESO API (real-time)  ──→ PostgreSQL ──→ ML Model ──→ FastAPI ──→ Web App
```

## Project Structure
```
src/
├── fetch_aeso.py       # Load historical CSV + fetch from API
├── build_features.py   # Build ML features from raw data
├── train_model.py      # Train and evaluate the model
└── predict.py          # Generate hourly predictions

app/
├── backend/            # FastAPI — serves predictions
└── frontend/           # Web interface for end users
```

---

## Setup
```bash
# Clone the repository
git clone https://github.com/jojoakoun/alberta-electricity-predictor.git
cd alberta-electricity-predictor

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Add your AESO API key
echo "AESO_API_KEY=your_key_here" > .env
```

---

## Status

- [x] Project structure
- [x] Historical data loader (48,935 hours — 2020 to 2025)
- [ ] PostgreSQL database schema
- [ ] AESO API pipeline
- [ ] Feature engineering
- [ ] Model training
- [ ] REST API
- [ ] Web application

---


*Joel-Hervé Akoun · Edmonton, Alberta*