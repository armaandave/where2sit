from sqlalchemy import create_engine
from models import Base

DATABASE_URL = "postgresql+psycopg2://postgres:Superman!23@localhost:5432/bestseatdb"

engine = create_engine(DATABASE_URL)
print("Dropping all tables...")
Base.metadata.drop_all(engine)
print("Creating tables...")
print("Tables to be created:", Base.metadata.tables.keys())
Base.metadata.create_all(engine)
print("Tables created successfully!")