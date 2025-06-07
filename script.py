import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text  # 👈 import text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable not set. Please check your .env file.")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1;"))  # 👈 wrap with text()
        print("✅ Connection successful!", result.scalar())
except Exception as e:
    print("❌ Connection failed:", e)