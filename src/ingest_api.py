"""
ingest_api.py
-------------
🎯 Fetch real-time AESO data from API and insert into PostgreSQL.
📥 Receives a start date and end date as strings.
📤 Inserts clean rows into the pool_prices table.
"""

from fetch_aeso_api import AESOClient
from database import DatabaseClient


class APIIngester:
  """🚀 Orchestrates fetching API data and inserting into PostgreSQL."""

  def __init__(self):
    """🔧 Initialize API client and database client."""
    # 📡 API client — fetches real-time data
    self.client = AESOClient()

    # 🗄️ Database client — handles PostgreSQL connection
    self.db = DatabaseClient()

  def run(self,end_date: str) -> int:
    """
    🚀 Run the full pipeline — API → DataFrame → PostgreSQL.
    Automatically starts from the day after the latest data.
    Returns the number of rows inserted.
    """
    # 📅 Step 1 — Find where our data ends
    start_date = self.db.get_latest_timestamp()

    # 📥 Step 2 — Fetch from API
    df = self.client.fetch(start_date, end_date)

    # 🏗️ Step 3 — Make sure the table exists
    self.db.create_tables()

    # 💾 Step 4 — Insert into PostgreSQL
    row_count = self.db.insert_dataframe(df, source="api")

    return row_count


if __name__ == "__main__":
  print("🧪 Testing APIIngester...")
  
  ingester = APIIngester()

  # 🗓️ Always fetch up to today
  from datetime import date
  today = date.today().strftime("%Y-%m-%d")

  row_count = ingester.run(end_date=today)

  print(f"\n🎉 Pipeline complete — {row_count:,} rows in PostgreSQL")
  print("✅ Test complete")