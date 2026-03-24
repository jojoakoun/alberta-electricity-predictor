"""
build_features.py
-----------------
🎯 Build ML features from raw pool_prices data.
📥 Loads data from PostgreSQL pool_prices table.
📤 Inserts features into PostgreSQL features table.
"""

import pandas as pd
import psycopg2
import os
from dotenv import load_dotenv
from database import DatabaseClient

load_dotenv()

class FeatureBuilder:
  """🔧 Builds ML features from raw AESO data."""
  
  # 🎯 Target variable 
  TARGET = "price_actual"
  
  # ✅ Final feature columns for ML
  FEATURES = [
     
    # 🔮 AESO forecast — strongest signal (corr 0.905)
    "price_forecast",
    
    # ⚡ Demand
    "consumption_actual",
    
    # 📅 Temporal features
    "hour_local",
    "month",
    "day_of_week",
    "is_weekend",
    
    # 📈 Lag features — past prices at key intervals
    "price_lag_1h",
    "price_lag_2h",
    "price_lag_24h",
    "price_lag_168h",
    
    # 📊 Rolling averages — price trend context
    "price_rolling_24h",
    "price_rolling_7d",
    "price_rolling_30d",
    
    
    # 🏭 Generation and trade (CSV only — NULLs for API rows)
    "total_generation_mw",
    "export_to_bc", "export_to_mt", "export_to_sk",
    "import_from_bc", "import_from_mt", "import_from_sk",
  ]
  
  def build(self, df: pd.DataFrame) -> pd.DataFrame:
    """
    🔧 Build all features from raw DataFrame.
    Returns a DataFrame with TARGET + FEATURES columns.
    """
    print(f"🔧 Building features from {len(df):,} rows...")

    df = df.copy()
    
    # 📅 Step 1 — Temporal features
    df = self._add_temporal_features(df)
    
    # 📈 Step 2 — Lag features
    df = self._add_lag_features(df)
    
    # 📊 Step 3 — Rolling averages
    df = self._add_rolling_features(df)
    
    # 🗑️ Step 4 — Drop rows with NaN from lags
    df = self._drop_nan_rows(df)
    
    print(f"✅ Features built  : {df.shape}")
    print(f"📋 Feature columns : {len(self.FEATURES)}")
    print(f"❓ Missing values  : {df[self.FEATURES].isnull().sum().sum()}")

    return df
    
  def _add_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
    """📅 Add day of week and is_weekend features."""
    print("   📅 Adding temporal features...")
    
    # 🕐 Local Alberta time
    local_time = df.index.tz_convert("America/Edmonton")

    # ⏰ Hour of day — Alberta local time
    df["hour_local"]  = local_time.hour

    # 📅 Month — 1=January, 12=December
    df["month"]       = local_time.month

    # 🗓️ Day of week — 0=Monday, 6=Sunday
    df["day_of_week"] = local_time.dayofweek

    # 🏖️ Weekend flag — 1 if Saturday or Sunday
    df["is_weekend"]  = (local_time.dayofweek >= 5).astype(int)

    return df
  
  def _add_lag_features(self, df: pd.DataFrame) -> pd.DataFrame:
    """
    📈 Add lag features — past prices at key intervals.
    ⚠️  Requires data sorted by timestamp_utc ascending.
    """
    print("   📈 Adding lag features...")
    
    # 💰 Price 1 hour ago
    df["price_lag_1h"]   = df["price_actual"].shift(1)
    
    # 💰 Price 2 hours ago
    df["price_lag_2h"]   = df["price_actual"].shift(2)
    
    # 💰 Price 24 hours ago — same hour yesterday
    df["price_lag_24h"]  = df["price_actual"].shift(24)

    # 💰 Price 168 hours ago — same hour last week
    df["price_lag_168h"] = df["price_actual"].shift(168)

    return df

  def _add_rolling_features(self, df: pd.DataFrame) -> pd.DataFrame:
    """
    📊 Add rolling average features.
    ⚠️  shift(1) avoids data leakage — we use past prices only.
    """
    print("   📊 Adding rolling averages...")
    
    # 📊 Average price over last 24 hours
    df["price_rolling_24h"] = (
      df["price_actual"].shift(1).rolling(window=24, min_periods=1).mean()
    )
    
    # 📊 Average price over last 7 days (168 hours)
    df["price_rolling_7d"] = (
      df["price_actual"].shift(1).rolling(window=168, min_periods=1).mean()
    )

    # 📊 Average price over last 30 days (720 hours)
    df["price_rolling_30d"] = (
      df["price_actual"].shift(1).rolling(window=720, min_periods=1).mean()
    )

    return df
  
  def _drop_nan_rows(self, df: pd.DataFrame) -> pd.DataFrame:
    """
    🗑️ Drop rows where critical lag features are NaN.
    ⚠️  First 168 rows will have NaN in price_lag_168h.
    """
    before = len(df)
    
    # 🗑️ Drop only rows where lag features are NaN
    lag_cols = ["price_lag_1h", "price_lag_2h",
      "price_lag_24h", "price_lag_168h"]
    
    df = df.dropna(subset=lag_cols)

    dropped = before - len(df)
    print(f"   🗑️  Dropped {dropped:,} rows with NaN lags")

    return df

  
  
if __name__ == "__main__":
  print("🧪 Testing FeatureBuilder...")
  
  # 📥 Load from PostgreSQL
  conn = psycopg2.connect(
    host=os.getenv("DB_HOST"), port=os.getenv("DB_PORT"),
    dbname=os.getenv("DB_NAME"), user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
  )
  
  df = pd.read_sql(
    "SELECT * FROM pool_prices ORDER BY timestamp_utc ASC", conn
  )
  conn.close()
  
  df["timestamp_utc"] = pd.to_datetime(df["timestamp_utc"], utc=True)
  df = df.set_index("timestamp_utc")
  
  # 🔧 Build features
  builder = FeatureBuilder()
  df_features = builder.build(df)
  
  # 🏗️ Insert into PostgreSQL
  db = DatabaseClient()
  db.create_features_table()
  db.insert_features(df_features)

  print(f"\n📊 First 3 rows :")
  print(df_features[builder.FEATURES].head(3))
  print("\n✅ Test complete")