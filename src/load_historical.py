"""
load_historical.py
------------------
🎯 Load historical AESO data from CSV into PostgreSQL.
📥 Reads the raw CSV from data/ folder via HistoricalLoader.
📤 Inserts clean rows into the pool_prices table via DatabaseClient.
"""

from fetch_aeso import HistoricalLoader
from database import DatabaseClient

# 📂 Path to the raw CSV file
RAW_FILE = "data/Hourly_Metered_Volumes_and_Pool_Price_and_AIL_2020-Jul2025.csv"


class HistoricalIngester:
  """🚀 Orchestrates loading CSV data into PostgreSQL."""

  def __init__(self, file_path: str):
    """🔧 Initialize with CSV path."""
    # 📂 CSV loader — reads and cleans the raw file
    self.loader = HistoricalLoader(file_path)

    # 🗄️ Database client — handles PostgreSQL connection
    self.db = DatabaseClient()
  
  
  def run(self) -> int:
    """
    🚀 Run the full pipeline — CSV → DataFrame → PostgreSQL.
    Returns the number of rows inserted.
    """
    # 📥 Step 1 — Load and clean the CSV
    df = self.loader.load()
    
    # 🏗️ Step 2 — Make sure the table exists
    self.db.create_tables()

    # 💾 Step 3 — Insert into PostgreSQL
    row_count = self.db.insert_dataframe(df, source="csv")

    return row_count
    

if __name__ == "__main__":
  print("🧪 Testing HistoricalIngester...")

  ingester = HistoricalIngester(RAW_FILE)
  row_count = ingester.run()

  print(f"\n🎉 Pipeline complete — {row_count:,} rows in PostgreSQL")
  print("✅ Test complete")

