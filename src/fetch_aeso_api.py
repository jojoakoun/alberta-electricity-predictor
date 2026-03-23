"""
fetch_aeso_api.py
-----------------
🎯 Fetch real-time pool price and AIL data from the AESO API.
📥 Receives a start date and end date as strings.
📤 Returns a clean pandas DataFrame ready for PostgreSQL.
"""

import os, requests
import pandas as pd
from dotenv import load_dotenv

# 🔑 Load API key from .env
load_dotenv()


class AESOClient:
  """📡 Fetches real-time data from the AESO public API."""

  # 🌐 API endpoints
  POOL_PRICE_URL = "https://apimgw.aeso.ca/public/poolprice-api/v1.1/price/poolPrice"
  AIL_URL        = "https://apimgw.aeso.ca/public/actualforecast-api/v1/load/albertaInternalLoad"

  def __init__(self):
    """🔧 Initialize with API key from .env."""
    # 🔑 Load API key — never hardcode this
    self.api_key = os.getenv("AESO_API_KEY")
    if not self.api_key:
      raise ValueError("❌ AESO_API_KEY not found in .env")
    
  def fetch(self, start_date: str, end_date: str) -> pd.DataFrame:
    """
    📥 Fetch pool prices and AIL for a date range.
    Returns a clean DataFrame ready for PostgreSQL.
    """
    print(f"📡 Fetching AESO data from {start_date} to {end_date}...")
    
    # 📥 Step 1 — Fetch both endpoints
    df_prices = self._fetch_pool_prices(start_date, end_date)
    df_ail = self._fetch_ail(start_date, end_date)
    
    # 🔗 Step 2 — Join on timestamp
    df = self._merge(df_prices, df_ail)
    
    # 📊 Summary
    print(f"✅ Clean shape    : {df.shape}")
    print(f"📅 Date range     : {df['timestamp_utc'].min()} → {df['timestamp_utc'].max()}")
    print(f"❓ Missing values : {df.isnull().sum().sum()}")
    
    return df
    
    
  def _fetch_pool_prices(self, start_date: str, end_date: str) -> pd.DataFrame:
    """💰 Fetch hourly pool prices from AESO API."""
    print("   💰 Fetching pool prices...")
    
    response = requests.get(
      self.POOL_PRICE_URL,
      headers={"API-KEY": self.api_key},
      params={"startDate": start_date, "endDate": end_date},
    )
    response.raise_for_status()

    # 📦 Parse JSON - extract the list of hourly records
    records = response.json()["return"]["Pool Price Report"]
    
    df = pd.DataFrame(records)
    
    # ✅ Keep and rename only what we need
    df = df[["begin_datetime_utc", "pool_price", "forecast_pool_price"]]
    df = df.rename(columns={
      "begin_datetime_utc" : "timestamp_utc",
      "pool_price" : "price_actual",
      "forecast_pool_price" : "price_forecast",
    })
    
    # 🔢 Convert strings to numbers
    df["price_actual"]   = pd.to_numeric(df["price_actual"])
    df["price_forecast"] = pd.to_numeric(df["price_forecast"])
    
    print(f"   ✅ {len(df):,} price rows fetched")
    return df
  
  def _fetch_ail(self, start_date: str, end_date: str) -> pd.DataFrame:
    """⚡ Fetch hourly Alberta Internal Load and forecast from AESO API."""
    print("   ⚡ Fetching Alberta Internal Load...")

    response = requests.get(
      self.AIL_URL,
      headers={"API-KEY": self.api_key},
      params={"startDate": start_date, "endDate": end_date},
    )
    
    response.raise_for_status()

    # 📦 Parse JSON — extract the list of hourly records
    records = response.json()["return"]["Actual Forecast Report"]
    df = pd.DataFrame(records)

    # ✅ Keep and rename only what we need
    df = df[[
      "begin_datetime_utc",
      "alberta_internal_load",
      "forecast_alberta_internal_load",  # ✅ Available before the hour — useful ML feature
    ]]
    
    df = df.rename(columns={
      "begin_datetime_utc" : "timestamp_utc",
      "alberta_internal_load" : "consumption_actual",
      "forecast_alberta_internal_load" : "consumption_forecast",
    })

    # 🔢 Convert strings to numbers
    df["consumption_actual"]   = pd.to_numeric(df["consumption_actual"])
    df["consumption_forecast"] = pd.to_numeric(df["consumption_forecast"])
    
    print(f"   ✅ {len(df):,} AIL rows fetched")
    return df
  
  
  def _merge(self, df_prices: pd.DataFrame, df_ail: pd.DataFrame) -> pd.DataFrame:
    """
    🔗 Join pool prices and AIL on timestamp_utc.
    ⚠️  Inner join — only keeps hours present in both endpoints.
    """
    print("   🔗 Merging prices and AIL...")
    
    df = pd.merge(df_prices, df_ail, on="timestamp_utc", how="inner")

    # 📅 Parse timestamps as UTC
    df["timestamp_utc"] = pd.to_datetime(df["timestamp_utc"], utc=True)
    
    # ⚠️  Columns not available from API — NULL for these rows in PostgreSQL
    df["total_generation_mw"] = None
    df["export_to_bc"]        = None
    df["export_to_mt"]        = None
    df["export_to_sk"]        = None
    df["import_from_bc"]      = None
    df["import_from_mt"]      = None
    df["import_from_sk"]      = None

    return df




if __name__ == "__main__":
  print("🧪 Testing AESOClient...")

  client = AESOClient()
  df = client.fetch("2026-03-20", "2026-03-21")
  
  print("\n📊 First 3 rows :")
  print(df.head(3))
  print("\n✅ Test complete")
