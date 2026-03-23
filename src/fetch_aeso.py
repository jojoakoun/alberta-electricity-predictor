"""
fetch_aeso.py
-------------
🎯 Load and clean historical AESO data from CSV.
📥 Reads the raw CSV file from the data/ folder.
📤 Returns a clean pandas DataFrame with hourly prices.
"""

import pandas as pd


# 📂 Path to the raw CSV file
RAW_FILE = "data/Hourly_Metered_Volumes_and_Pool_Price_and_AIL_2020-Jul2025.csv"


class HistoricalLoader:
  """📂 Loads and cleans historical AESO data from a CSV file."""

  # ✅ Columns we need 
  COLUMNS_TO_KEEP = [
    "Date_Begin_GMT",               # ⏰ Timestamp in UTC — no DST issues
    "ACTUAL_POOL_PRICE",            # 💰 Real market price ($/MWh)
    "ACTUAL_AIL",                   # ⚡ Alberta Internal Load — total demand (MW)
    "HOUR_AHEAD_POOL_PRICE_FORECAST", # 🔮 AESO forecast — our baseline to beat
    "EXPORT_BC", "EXPORT_MT", "EXPORT_SK",  # 📤 Electricity leaving Alberta
    "IMPORT_BC", "IMPORT_MT", "IMPORT_SK",  # 📥 Electricity entering Alberta
  ]

  # 🔤 Rename raw column names to readable snake_case
  COLUMN_NAMES = {
    "ACTUAL_POOL_PRICE" : "price_actual",
    "ACTUAL_AIL" : "consumption_actual",
    "HOUR_AHEAD_POOL_PRICE_FORECAST" : "price_forecast",
    "EXPORT_BC" : "export_to_bc",
    "EXPORT_MT" : "export_to_mt",
    "EXPORT_SK" : "export_to_sk",
    "IMPORT_BC" : "import_from_bc",
    "IMPORT_MT" : "import_from_mt",
    "IMPORT_SK" : "import_from_sk",
  }
  
  def __init__(self, file_path: str):
    """🔧 Initialize with the path to the raw CSV file."""
    
    # 📁 Store file path for use in all methods
    self.file_path = file_path
    
  
  def load(self) -> pd.DataFrame:
    """
    📥 Load, clean and return the historical data.
    Runs all steps in order:  read → generate → timestamp → rename.
    """
    print(f"📂 Loading data from {self.file_path}...")
    
    # 🔄 Run each cleaning step in sequence
    df = self._read_csv()
    df = self._add_total_generation(df)
    df = self._parse_timestamps(df)
    df = self._rename_columns(df)

    # 📊 Summary — always show what we loaded
    print(f"✅ Clean shape     : {df.shape}")
    print(f"📅 Date range      : {df['timestamp_utc'].min()} → {df['timestamp_utc'].max()}")
    print(f"❓ Missing values  : {df.isnull().sum().sum()}")

    return df

    
  
  def _read_csv(self) -> pd.DataFrame:
    """
    📖 Read only the columns we need from the CSV.
    ⚠️  Skips ~200 individual plant columns — we only need totals.
    """
    
    df = pd.read_csv(self.file_path, usecols=self.COLUMNS_TO_KEEP)
    print(f"📐 Raw shape : {df.shape}")
    return df
  
  def _add_total_generation(self, df: pd.DataFrame) -> pd.DataFrame:
    """
    🔢 Calculate total Alberta generation (MW) from all plant columns.
    Plant columns = everything NOT in COLUMNS_TO_KEEP or Date_Begin_Local.
    """
    # 🗂️ Read only the header to find all column names
    all_columns = pd.read_csv(self.file_path, nrows=0).columns.tolist()
    
    # 🏭 Isolate plant columns - every code like AFG1, GN1, SD3...
    plant_columns = [
      col for col in all_columns
      if col not in self.COLUMNS_TO_KEEP + ["Date_Begin_Local"] ###
    ]
    
    # ➕ Sum all plant columns into one total generation column
    df_plants = pd.read_csv(self.file_path, usecols=plant_columns)
    
    df["total_generation_mw"] = df_plants.sum(axis=1)
  
    print(f"🏭 Plant columns summed : {len(plant_columns)}")
    return df
  
  def _parse_timestamps(self, df: pd.DataFrame) -> pd.DataFrame:
    """
    📅 Convert raw timestamp string to pandas datetime in UTC.
    ✅ UTC is preferred — no daylight saving time (DST) issues.
    """
    df["timestamp_utc"] = pd.to_datetime(df["Date_Begin_GMT"])
    
    # 🗑️ Drop original column — replaced by timestamp_utc
    df = df.drop(columns=["Date_Begin_GMT"])
    return df
  
  def _rename_columns(self, df: pd.DataFrame) -> pd.DataFrame:
    """
    🔤 Rename raw AESO column names to readable snake_case.
    ✅ Makes the DataFrame self-documenting — no need to look up AESO docs.
    """
    return df.rename(columns=self.COLUMN_NAMES)


if __name__ == "__main__":
  print("🧪 Testing HistoricalLoader...")

  # 📂 Point to the raw CSV in the data/ folder
  loader = HistoricalLoader(
    "data/Hourly_Metered_Volumes_and_Pool_Price_and_AIL_2020-Jul2025.csv"
  )
  
  # 🚀 Load and clean the data
  df = loader.load()

  # 👀 Always inspect before using
  print("\n📊 First 3 rows :")
  print(df.head(3))
  print("\n✅ Test complete")
