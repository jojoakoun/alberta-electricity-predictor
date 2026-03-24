"""
database.py
-----------
🎯 Manage the PostgreSQL connection and table creation.
📥 Receives database credentials from .env file.
📤 Provides a reusable connection for all scripts.
"""


import os, psycopg2
import pandas as pd
from dotenv import load_dotenv

# 🔑 Load credentials from .env
load_dotenv()

class DatabaseClient:
  """🗄️ Manages the PostgreSQL connection and schema."""
  
  def __init__(self):
    """🔧 Initialize connection using .env credentials."""
    # 🔑 Read credentials from environment
    self.connection_params = {
      "host"    : os.getenv("DB_HOST"),
      "port"    : os.getenv("DB_PORT"),
      "dbname"  : os.getenv("DB_NAME"),
      "user"    : os.getenv("DB_USER"),
      "password": os.getenv("DB_PASSWORD"),
    }
  
  def connect(self):
    """🔌 Open and return a PostgreSQL connection."""
    print("🔌 Connecting to PostgreSQL...")
    return psycopg2.connect(**self.connection_params)
  
  def create_tables(self):
    """🏗️ Create all tables if they don't exist yet."""
    print("🏗️ Creating tables if not exists...")
    
    # 📋 SQL schema — one table for all hourly prices
    create_pool_prices = """
      CREATE TABLE IF NOT EXISTS pool_prices (

        -- ⏰ Timestamp in UTC — unique key, no DST issues
        timestamp_utc        TIMESTAMP WITH TIME ZONE PRIMARY KEY,

        -- 💰 Prices ($/MWh)
        price_actual         NUMERIC(10, 4),
        price_forecast       NUMERIC(10, 4),

        -- ⚡ Demand — actual and forecast (MW)
        consumption_actual   NUMERIC(10, 4),
        consumption_forecast NUMERIC(10, 4),

        -- 🏭 Total generation (MW) — CSV only, NULL for API rows
        total_generation_mw  NUMERIC(10, 4),


        -- 📤 Exports (MW)
        export_to_bc         NUMERIC(10, 4),
        export_to_mt         NUMERIC(10, 4),
        export_to_sk         NUMERIC(10, 4),

        -- 📥 Imports (MW)
        import_from_bc       NUMERIC(10, 4),
        import_from_mt       NUMERIC(10, 4),
        import_from_sk       NUMERIC(10, 4),

        -- 📡 Source — "csv" or "api"
        source               VARCHAR(10) NOT NULL
      );
    """
    
    # 🚀 Execute and commit
    with self.connect() as conn:
      with conn.cursor() as cursor:
        cursor.execute(create_pool_prices)
      conn.commit()
      
    print("✅ Tables ready")

  def insert_dataframe(self, df: pd.DataFrame, source: str) -> int:
    """
    💾 Insert a DataFrame into pool_prices.
    ⚠️  Skips duplicates — safe to run multiple times.
    Returns the number of rows inserted.
    """
    print(f"💾 Inserting {len(df):,} rows from source='{source}'...")
    
    # 📋 SQL insert — ON CONFLICT DO NOTHING skips duplicates
    insert_sql = """
      INSERT INTO pool_prices (
        timestamp_utc, price_actual, price_forecast,
        consumption_actual,consumption_forecast,
        total_generation_mw,
        export_to_bc, export_to_mt, export_to_sk,
        import_from_bc, import_from_mt, import_from_sk,
        source
      ) VALUES (
        %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s, %s,
        %s
      )
      ON CONFLICT (timestamp_utc) DO NOTHING;
    """
    
    # 🔄 Build rows from DataFrame
    rows = [
      (
        row.timestamp_utc,
        row.price_actual,
        row.price_forecast,
        row.consumption_actual,
        getattr(row, "consumption_forecast", None),  # ⚠️ NULL for CSV rows
        row.total_generation_mw,
        row.export_to_bc,
        row.export_to_mt,
        row.export_to_sk,
        row.import_from_bc,
        row.import_from_mt,
        row.import_from_sk,
        source,
      )
      for row in df.itertuples(index=False)
    ]

    # 🚀 Execute batch insert
    with self.connect() as conn:
      with conn.cursor() as cursor:
        cursor.executemany(insert_sql, rows)
        row_count = cursor.rowcount
      conn.commit()

    print(f"🎉 Done — {row_count:,} rows inserted")
    return row_count
  
  def get_latest_timestamp(self) -> str:
    """
    📅 Get the latest timestamp in pool_prices.
    Returns the next hour to fetch from the API.
    """
    print("📅 Checking latest timestamp in database...")

    with self.connect() as conn:
      with conn.cursor() as cursor:
        cursor.execute("SELECT MAX(timestamp_utc) FROM pool_prices;")
        latest = cursor.fetchone()[0]

    if latest is None:
      # 🗄️ Empty table — start from a default date
      print("⚠️  No data found — starting from 2020-01-01")
      return "2020-01-01"

    # ➕ Add one hour to avoid re-fetching the last row
    next_hour = latest + pd.Timedelta(hours=1)
    next_date = next_hour.strftime("%Y-%m-%d")

    print(f"✅ Latest timestamp : {latest}")
    print(f"📅 Next fetch from  : {next_date}")

    return next_date
  
  
  def create_features_table(self):
    """🏗️ Create the features table if it doesn't exist yet."""
    print("🏗️ Creating features table if not exists...")
    
    create_features = """
      CREATE TABLE IF NOT EXISTS features (

        -- ⏰ Timestamp — primary key, links to pool_prices
        timestamp_utc        TIMESTAMP WITH TIME ZONE PRIMARY KEY,

        -- 🎯 Target variable
        price_actual         NUMERIC(10, 4),

        -- 🔮 AESO forecast
        price_forecast       NUMERIC(10, 4),

        -- ⚡ Demand
        consumption_actual   NUMERIC(10, 4),

        -- 📅 Temporal features
        hour_local           SMALLINT,
        month                SMALLINT,
        day_of_week          SMALLINT,
        is_weekend           SMALLINT,

        -- 📈 Lag features
        price_lag_1h         NUMERIC(10, 4),
        price_lag_2h         NUMERIC(10, 4),
        price_lag_24h        NUMERIC(10, 4),
        price_lag_168h       NUMERIC(10, 4),

        -- 📊 Rolling averages
        price_rolling_24h    NUMERIC(10, 4),
        price_rolling_7d     NUMERIC(10, 4),
        price_rolling_30d    NUMERIC(10, 4),

        -- 🏭 Generation and trade (NULL for API rows)
        total_generation_mw  NUMERIC(10, 4),
        export_to_bc         NUMERIC(10, 4),
        export_to_mt         NUMERIC(10, 4),
        export_to_sk         NUMERIC(10, 4),
        import_from_bc       NUMERIC(10, 4),
        import_from_mt       NUMERIC(10, 4),
        import_from_sk       NUMERIC(10, 4)
      );
    """
    
    with self.connect() as conn:
      with conn.cursor() as cursor:
        cursor.execute(create_features)
      conn.commit()

    print("✅ Features table ready")
    
  def insert_features(self, df: pd.DataFrame) -> int:
    """
    💾 Insert features DataFrame into the features table.
    ⚠️  Skips duplicates — safe to run multiple times.
    Returns the number of rows inserted.
    """
    print(f"💾 Inserting {len(df):,} feature rows...")
    
    insert_sql = """
      INSERT INTO features (
        timestamp_utc, price_actual, price_forecast,
        consumption_actual,
        hour_local, month, day_of_week, is_weekend,
        price_lag_1h, price_lag_2h, price_lag_24h, price_lag_168h,
        price_rolling_24h, price_rolling_7d,price_rolling_30d,
        total_generation_mw,
        export_to_bc, export_to_mt, export_to_sk,
        import_from_bc, import_from_mt, import_from_sk
      ) VALUES (
        %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s
      )
      ON CONFLICT (timestamp_utc) DO NOTHING;
    """

    rows = [
      (
        row.Index,
        row.price_actual, row.price_forecast,
        row.consumption_actual,
        row.hour_local, row.month, row.day_of_week, row.is_weekend,
        row.price_lag_1h, row.price_lag_2h,
        row.price_lag_24h, row.price_lag_168h,
        row.price_rolling_24h, row.price_rolling_7d,
        row.price_rolling_30d, row.total_generation_mw,
        row.export_to_bc, row.export_to_mt, row.export_to_sk,
        row.import_from_bc, row.import_from_mt, row.import_from_sk,
      )
      for row in df.itertuples()
    ]

    with self.connect() as conn:
      with conn.cursor() as cursor:
        cursor.executemany(insert_sql, rows)
        row_count = cursor.rowcount
      conn.commit()

    print(f"🎉 Done — {row_count:,} feature rows inserted")
    return row_count
  
  def get_latest_feature_timestamp(self):
    """
    📅 Get the latest timestamp in features table.
    Returns start date with 168h context for lag calculation.
    """
    print("📅 Checking latest timestamp in features...")

    with self.connect() as conn:
      with conn.cursor() as cursor:
        cursor.execute("SELECT MAX(timestamp_utc) FROM features;")
        latest = cursor.fetchone()[0]

    if latest is None:
      print("⚠️  No features found — building from scratch")
      return None

    # ⏪ Go back 168 hours for lag context
    start_with_context = latest - pd.Timedelta(hours=168)
    print(f"✅ Latest feature   : {latest}")
    print(f"📅 Loading from     : {start_with_context} (168h context)")

    return start_with_context
  
if __name__ == "__main__":
  print("🧪 Testing DatabaseClient...")

  db = DatabaseClient()
  db.create_tables()

  print("✅ Test complete")

    
    