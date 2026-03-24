"""
main.py
-------
🎯 Main entry point for the Alberta Electricity Price Predictor.
📋 Commands:
   python main.py update    → full database update (CSV + API + features)
   python main.py csv       → load historical CSV only
   python main.py api       → fetch API only
   python main.py features  → build features only
"""

import sys
import os
import pandas as pd
import psycopg2
from datetime import date
from dotenv import load_dotenv
from sqlalchemy import create_engine

from src.database import DatabaseClient
from src.fetch_aeso import HistoricalLoader
from src.fetch_aeso_api import AESOClient
from src.build_features import FeatureBuilder

load_dotenv()

# 📂 Path to the raw CSV file
RAW_FILE = "data/Hourly_Metered_Volumes_and_Pool_Price_and_AIL_2020-Jul2025.csv"


def load_csv():
  """📥 Load historical CSV into pool_prices."""
  print("\n📥 Loading historical CSV...")
  db     = DatabaseClient()
  loader = HistoricalLoader(RAW_FILE)
  db.create_tables()
  df = loader.load()
  db.insert_dataframe(df, source="csv")


def fetch_api():
  """📡 Fetch API data from last timestamp to today."""
  print("\n📡 Fetching API data...")
  db         = DatabaseClient()
  api_client = AESOClient()
  end_date   = date.today().strftime("%Y-%m-%d")
  start_date = db.get_latest_timestamp()
  df         = api_client.fetch(start_date, end_date)
  db.insert_dataframe(df, source="api")


def build_features():
  """🔧 Build features for new rows only."""
  print("\n🔧 Building features...")

  db      = DatabaseClient()
  builder = FeatureBuilder()

  # 📅 Find start date with 168h context
  start_date = db.get_latest_feature_timestamp()

  # 📥 Load from PostgreSQL via SQLAlchemy
  engine = create_engine(
      f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
      f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
  )

  query = (
    f"SELECT * FROM pool_prices WHERE timestamp_utc >= '{start_date}' ORDER BY timestamp_utc ASC"
    if start_date
    else "SELECT * FROM pool_prices ORDER BY timestamp_utc ASC"
  )

  df = pd.read_sql(query, engine)
  engine.dispose()

  df["timestamp_utc"] = pd.to_datetime(df["timestamp_utc"], utc=True)
  df = df.set_index("timestamp_utc")

  db.create_features_table()
  df_features = builder.build(df)
  db.insert_features(df_features)


def print_report():
  """📊 Print database status report."""
  db = DatabaseClient()

  with db.connect() as conn:
      with conn.cursor() as cursor:
          cursor.execute("""
              SELECT source, COUNT(*) as rows,
                      MIN(timestamp_utc) as from_date,
                      MAX(timestamp_utc) as to_date
              FROM pool_prices GROUP BY source;
          """)
          pool_rows = cursor.fetchall()

          cursor.execute("""
              SELECT COUNT(*), MIN(timestamp_utc), MAX(timestamp_utc)
              FROM features;
          """)
          feature_rows = cursor.fetchone()

  print("\n📊 Database status :")
  print("   pool_prices :")
  for row in pool_rows:
      print(f"      {row[0]:5} → {row[1]:,} rows | {row[2]} → {row[3]}")
  print(f"   features    : {feature_rows[0]:,} rows | {feature_rows[1]} → {feature_rows[2]}")


def update():
  """🚀 Full update — CSV (if empty) + API + features."""
  print("🚀 Starting full database update...")
  print("=" * 50)

  db = DatabaseClient()
  db.create_tables()
  db.create_features_table()

  # 📥 Load CSV only if pool_prices is empty
  with db.connect() as conn:
      with conn.cursor() as cursor:
          cursor.execute("SELECT COUNT(*) FROM pool_prices;")
          count = cursor.fetchone()[0]

  if count == 0:
      load_csv()
  else:
      print(f"\n✅ pool_prices has {count:,} rows — skipping CSV")

  fetch_api()
  build_features()
  print_report()

  print("=" * 50)
  print("✅ Update complete")


# ── Commands ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    commands = {
        "update"   : update,
        "csv"      : load_csv,
        "api"      : fetch_api,
        "features" : build_features,
        "report"   : print_report,
    }

    if len(sys.argv) < 2 or sys.argv[1] not in commands:
        print("📋 Usage:")
        for cmd in commands:
            print(f"   python main.py {cmd}")
        sys.exit(1)

    commands[sys.argv[1]]()