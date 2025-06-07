from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Theater, Screen

DATABASE_URL = "postgresql+psycopg2://postgres:Superman!23@localhost:5432/bestseatdb"

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# Step 1: Find all theaters with a known screen count
theaters_with_screens = session.query(Theater).filter(Theater.screens_count.isnot(None)).all()

for theater in theaters_with_screens:
    # Get existing screens for the current theater
    existing_screens = session.query(Screen).filter_by(theater_id=theater.id).order_by(Screen.screen_number).all()
    num_existing_screens = len(existing_screens)
    desired_screens_count = theater.screens_count or 0  # Default to 0 if screens_count is None

    # Case 1: Add new screens if screens_count increased
    if num_existing_screens < desired_screens_count:
        for n in range(num_existing_screens + 1, desired_screens_count + 1):
            screen = Screen(
                theater_id=theater.id,
                screen_number=n,
                name=f"Screen {n}"
            )
            session.add(screen)
        print(f"Added {desired_screens_count - num_existing_screens} screens for Theater ID: {theater.id}")

    # Case 2: Delete excess screens if screens_count decreased
    elif num_existing_screens > desired_screens_count:
        screens_to_delete = existing_screens[desired_screens_count:]
        for screen in screens_to_delete:
            session.delete(screen)
        print(f"Deleted {num_existing_screens - desired_screens_count} screens for Theater ID: {theater.id}")

session.commit()
session.close()