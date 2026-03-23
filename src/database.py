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

        -- ⚡ Demand and generation (MW)
        consumption_actual   NUMERIC(10, 4),
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
        consumption_actual, total_generation_mw,
        export_to_bc, export_to_mt, export_to_sk,
        import_from_bc, import_from_mt, import_from_sk,
        source
      ) VALUES (
        %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s,
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

if __name__ == "__main__":
  print("🧪 Testing DatabaseClient...")

  db = DatabaseClient()
  db.create_tables()

  print("✅ Test complete")

    
    