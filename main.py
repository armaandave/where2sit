from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Theater, Screen, BestSeatSuggestion
from sqlalchemy import distinct
from pydantic import BaseModel
from typing import List

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend URL during dev
    allow_credentials=True,
    allow_methods=["*"],                      # Allow all HTTP methods: GET, POST, etc.
    allow_headers=["*"],                      # Allow all headers (like Content-Type)
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to BestSeat!"}

@app.get("/healthz", status_code=200)
def healthz():
    return {"status": "ok"}

@app.get("/theaters")
def get_theaters(db: Session = Depends(get_db)):
    theaters = db.query(Theater).all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "brand": t.brand,
            "city": t.city,
            "state": t.state,
            "country": t.country,
            "street": t.street,
            "postcode": t.postcode,
            "address": {
                "street": t.street,
                "city": t.city,
                "state": t.state,
                "postcode": t.postcode,
                "country": t.country
            },
            "screens_count": t.screens_count,
        }
        for t in theaters
    ]

@app.get("/theaters/{theater_id}")
def get_theater(theater_id: int, db: Session = Depends(get_db)):
    theater = db.query(Theater).filter(Theater.id == theater_id).first()
    if not theater:
        raise HTTPException(status_code=404, detail="Theater not found")
    screens = db.query(Screen).filter(Screen.theater_id == theater_id).all()
    return {
        "id": theater.id,
        "name": theater.name,
        "brand": theater.brand,
        "address": {
            "street": theater.street,
            "city": theater.city,
            "state": theater.state,
            "postcode": theater.postcode,
            "country": theater.country
        },
        "lat": theater.lat,
        "lon": theater.lon,
        "screens_count": theater.screens_count,
        "screens_count_source": theater.screens_count_source,
        "screens": [
            {
                "id": screen.id,
                "name": screen.name,
                "screen_number": screen.screen_number,
                "is_imax": screen.is_imax,
                "best_seat": screen.best_seat,
                "notes": screen.notes
            }
            for screen in screens
        ]
    }

@app.get("/cities")
def get_cities(db: Session = Depends(get_db)):
    cities = db.query(distinct(Theater.city)).filter(Theater.city.isnot(None)).all()
    return [city[0] for city in cities]

@app.get("/theaters/by_city/{city}")
def get_theaters_by_city(city: str, db: Session = Depends(get_db)):
    # First, let's see what cities we actually have
    all_cities = db.query(distinct(Theater.city)).filter(Theater.city.isnot(None)).all()
    print(f"Available cities in DB: {[c[0] for c in all_cities]}")
    print(f"Searching for city: {city}")
    
    # Use case-insensitive search
    theaters = db.query(Theater).filter(Theater.city.ilike(city)).all()
    if not theaters:
        raise HTTPException(
            status_code=404, 
            detail=f"No theaters found in {city}. Available cities: {[c[0] for c in all_cities]}"
        )
    return [
        {
            "id": t.id,
            "name": t.name,
            "brand": t.brand,
            "street": t.street,
            "state": t.state,
            "postcode": t.postcode,
            "screens_count": t.screens_count,
        }
        for t in theaters
    ]

@app.get("/screens")
def get_screens(db: Session = Depends(get_db)):
    screens = db.query(Screen).all()
    return [
        {
            "id": screen.id,
            "theater_id": screen.theater_id,
            "name": screen.name,
            "screen_number": screen.screen_number,
            "is_imax": screen.is_imax,
            "best_seat": screen.best_seat,
            "notes": screen.notes
        }
        for screen in screens
    ]

@app.get("/screens/{screen_id}")
def get_screen(screen_id: int, db: Session = Depends(get_db)):
    screen = db.query(Screen).filter(Screen.id == screen_id).first()
    if not screen:
        raise HTTPException(status_code=404, detail="Screen not found")
    return {
        "id": screen.id,
        "theater_id": screen.theater_id,
        "name": screen.name,
        "screen_number": screen.screen_number,
        "is_imax": screen.is_imax,
        "best_seat": screen.best_seat,
        "notes": screen.notes
    }

@app.get("/theaters/{theater_id}/screens")
def get_theater_screens(theater_id: int, db: Session = Depends(get_db)):
    theater = db.query(Theater).filter(Theater.id == theater_id).first()
    if not theater:
        raise HTTPException(status_code=404, detail="Theater not found")
    screens = db.query(Screen).filter(Screen.theater_id == theater_id).all()
    return [
        {
            "id": screen.id,
            "name": screen.name,
            "screen_number": screen.screen_number,
            "is_imax": screen.is_imax,
            "best_seat": screen.best_seat,
            "notes": screen.notes
        }
        for screen in screens
    ]

class BestSeatInput(BaseModel):
    suggested_seat: str
    user_notes: str | None = None

@app.post("/screens/{screen_id}/suggest_best_seat")
def submit_best_seat(screen_id: int, data: BestSeatInput, db: Session = Depends(get_db)):
    screen = db.query(Screen).filter(Screen.id == screen_id).first()
    if not screen:
        raise HTTPException(status_code=404, detail="Screen not found")

    suggestion = BestSeatSuggestion(
        screen_id=screen_id,
        suggested_seat=data.suggested_seat,
        user_notes=data.user_notes,
    )
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)
    return {"message": "Thank you for your suggestion!", "suggestion_id": suggestion.id}

@app.get("/screens/{screen_id}/best_seat")
def get_best_seat_suggestion(screen_id: int, db: Session = Depends(get_db)):
    # Get the most recent suggestion for this screen
    suggestion = db.query(BestSeatSuggestion)\
        .filter(BestSeatSuggestion.screen_id == screen_id)\
        .order_by(BestSeatSuggestion.timestamp.desc())\
        .first()
    
    if not suggestion:
        raise HTTPException(status_code=404, detail="No best seat suggestions found for this screen")
    
    return {
        "suggested_seat": suggestion.suggested_seat,
        "user_notes": suggestion.user_notes,
        "timestamp": suggestion.timestamp
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)