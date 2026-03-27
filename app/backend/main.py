"""
app/backend/main.py
-------------------
🎯 FastAPI backend — serves predictions from the hybrid XGBoost model.
📥 Reads features from PostgreSQL.
📤 Returns hourly price predictions as JSON.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
  title       = "Alberta Electricity Price Predictor",
  description = "Predicts hourly pool prices — beats AESO by 33%",
  version     = "1.0.0",
)

# 🌐 CORS — allow React frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Database connection ────────────────────────────────────────────────────────
engine = create_engine(
    f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)

# ── Load models ────────────────────────────────────────────────────────────────
print("🤖 Loading models...")
model_v1    = joblib.load("models/xgboost_v1.pkl")
model_tuned = joblib.load("models/xgboost_tuned.pkl")

with open("models/metadata.json") as f:
  metadata = json.load(f)

FEATURES         = metadata["features"]
SPIKE_THRESHOLD  = metadata["spike_threshold"]
print("✅ Models loaded")


# ── Hybrid prediction ─────────────────────────────────────────────────────────
def predict_hybrid(X: pd.DataFrame) -> np.ndarray:
  """🔀 Route predictions to the right specialist."""
  X = X.copy()
  X = X.apply(pd.to_numeric, errors="coerce").astype(float)
  pred_v1    = model_v1.predict(X)
  pred_tuned = model_tuned.predict(X)
  is_spike   = X["price_forecast"].values >= SPIKE_THRESHOLD
  return np.where(is_spike, pred_tuned, pred_v1)


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
  """✅ Health check — verify API is running."""
  return {
    "status"      : "ok",
    "model"       : "hybrid_xgboost",
    "mae_overall" : metadata["mae_overall"],
    "mae_spikes"  : metadata["mae_spikes"],
  }


@app.get("/latest")
def latest():
  """
  📊 Get today's hours in Edmonton time.
  Falls back to last 24h if today is incomplete.
  """
  # 🎯 Try today Edmonton first
  query_today = text("""
    SELECT *
    FROM features
    WHERE (timestamp_utc AT TIME ZONE 'America/Edmonton')::date =
          (NOW() AT TIME ZONE 'America/Edmonton')::date
    ORDER BY timestamp_utc ASC
  """)

  with engine.connect() as conn:
    df = pd.read_sql(query_today, conn)

  # 🔁 Fallback — last 24 available hours
  if len(df) < 6:
    query_fallback = text("""
      SELECT *
      FROM features
      ORDER BY timestamp_utc DESC
      LIMIT 24
    """)
    with engine.connect() as conn:
      df = pd.read_sql(query_fallback, conn)

  if df.empty:
    raise HTTPException(status_code=404, detail="No data available")

  df["timestamp_utc"] = pd.to_datetime(df["timestamp_utc"], utc=True)
  df = df.set_index("timestamp_utc")
  df = df.sort_index()

  X           = df[FEATURES].apply(pd.to_numeric, errors="coerce")
  predictions = predict_hybrid(X)

  results = []
  for i, (ts, row) in enumerate(df.iterrows()):
    results.append({
      "timestamp_utc"  : ts.isoformat(),
      "hour_local"     : int(row["hour_local"]),
      "prediction"     : round(float(predictions[i]), 2),
      "price_forecast" : round(float(row["price_forecast"]), 2),
      "price_actual"   : round(float(row["price_actual"]), 2) if not pd.isna(row["price_actual"]) else None,
    })

  return {
    "hours"       : len(results),
    "predictions" : results,
  }


@app.get("/predict")
def predict(date: str):
  """
  📊 Get hourly predictions for a specific date.
  Example : /predict?date=2026-03-26
  """
  query = text("""
    SELECT *
    FROM features
    WHERE timestamp_utc::date = :date
    ORDER BY timestamp_utc ASC
  """)

  with engine.connect() as conn:
    df = pd.read_sql(query, conn, params={"date": date})

  if df.empty:
    raise HTTPException(
      status_code = 404,
      detail      = f"No data found for date {date} — run 'python main.py update' first"
    )

  df["timestamp_utc"] = pd.to_datetime(df["timestamp_utc"], utc=True)
  df = df.set_index("timestamp_utc")

  X           = df[FEATURES].apply(pd.to_numeric, errors="coerce")
  predictions = predict_hybrid(X)

  results = []
  for i, (ts, row) in enumerate(df.iterrows()):
    results.append({
      "timestamp_utc"  : ts.isoformat(),
      "hour_local"     : int(row["hour_local"]),
      "prediction"     : round(float(predictions[i]), 2),
      "price_forecast" : round(float(row["price_forecast"]), 2),
      "price_actual"   : round(float(row["price_actual"]), 2) if not pd.isna(row["price_actual"]) else None,
    })

  return {
    "date"        : date,
    "hours"       : len(results),
    "predictions" : results,
  }


@app.get("/model/info")
def model_info():
  """📋 Get model metadata and performance metrics."""
  return metadata