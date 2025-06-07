import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from models import Base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable not set. Please check your .env file.")

engine = create_engine(DATABASE_URL)
print("Dropping all tables...")
Base.metadata.drop_all(engine)
print("Creating tables...")
print("Tables to be created:", Base.metadata.tables.keys())
Base.metadata.create_all(engine)
print("Tables created successfully!")