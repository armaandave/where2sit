from sqlalchemy import create_engine, text  # 👈 import text

DATABASE_URL = "postgresql+psycopg2://postgres:Superman!23@localhost:5432/bestseatdb"

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1;"))  # 👈 wrap with text()
        print("✅ Connection successful!", result.scalar())
except Exception as e:
    print("❌ Connection failed:", e)