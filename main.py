from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from database import SessionLocal
from models import Theater, Screen, BestSeatSuggestion
from sqlalchemy import distinct
from pydantic import BaseModel
from typing import List
from datetime import datetime

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

@app.get("/theaters", response_model=List[TheaterDetailResponse])
def list_theaters(db: Session = Depends(get_db)):
    theaters = db.query(Theater).options(joinedload(Theater.screens)).all()
    response_theaters = []
    for theater in theaters:
        # Ensure address is a dict for consistency
        if isinstance(theater.address, str):
            address_dict = {"full_address": theater.address}
        else:
            address_dict = {
                "street": theater.street,
                "city": theater.city,
                "state": theater.state,
                "postcode": theater.postcode,
                "country": theater.country,
            }
        response_theaters.append(TheaterDetailResponse(
            id=theater.id,
            name=theater.name,
            brand=theater.brand,
            chain=theater.chain,
            address=address_dict,  # Pass the dict here
            street=theater.street,
            city=theater.city,
            state=theater.state,
            country=theater.country,
            postcode=theater.postcode,
            screens_count=len(theater.screens) if theater.screens else 0,
            screens=theater.screens, # FastAPI/Pydantic will handle nested serialization
        ))
    return response_theaters

@app.get("/theaters/{id}", response_model=TheaterDetailResponse)
def get_theater_details(id: int, db: Session = Depends(get_db)):
    theater = db.query(Theater).options(
        joinedload(Theater.screens).options(joinedload(Screen.suggestions).order_by(BestSeatSuggestion.timestamp.desc())) # Eager load and order suggestions
    ).filter(Theater.id == id).first()

    if not theater:
        raise HTTPException(status_code=404, detail="Theater not found")

    # Ensure address is a dict for consistency
    if isinstance(theater.address, str):
        address_dict = {"full_address": theater.address}
    else:
        address_dict = {
            "street": theater.street,
            "city": theater.city,
            "state": theater.state,
            "postcode": theater.postcode,
            "country": theater.country,
        }
    return TheaterDetailResponse(
        id=theater.id,
        name=theater.name,
        brand=theater.brand,
        chain=theater.chain,
        address=address_dict,
        street=theater.street,
        city=theater.city,
        state=theater.state,
        country=theater.country,
        postcode=theater.postcode,
        screens_count=len(theater.screens) if theater.screens else 0,
        screens=theater.screens, # Pydantic will handle nested serialization
    )

@app.get("/cities", response_model=List[str])
def list_cities(db: Session = Depends(get_db)):
    cities = db.query(distinct(Theater.city)).all()
    return [city[0] for city in cities if city[0] is not None]

@app.get("/theaters/by_city/{city}", response_model=List[TheaterDetailResponse])
def get_theaters_by_city(city: str, db: Session = Depends(get_db)):
    theaters = db.query(Theater).options(joinedload(Theater.screens)).filter(Theater.city.ilike(f"%{city}%")).all()
    return [TheaterDetailResponse(
        id=theater.id,
        name=theater.name,
        brand=theater.brand,
        chain=theater.chain,
        address=theater.address,
        street=theater.street,
        city=theater.city,
        state=theater.state,
        country=theater.country,
        postcode=theater.postcode,
        screens_count=len(theater.screens) if theater.screens else 0,
        screens=theater.screens, # Pydantic will handle nested serialization
    ) for theater in theaters]

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

# Pydantic models for response
class BestSeatSuggestionResponse(BaseModel):
    id: int
    screen_id: int
    suggested_seat: str
    user_notes: str | None
    timestamp: datetime

    class Config:
        from_attributes = True

class ScreenResponse(BaseModel):
    id: int | str
    name: str
    screen_number: int | None
    type: str | None
    best_seat: str | None
    suggestions: List[BestSeatSuggestionResponse] = [] # Include suggestions

    class Config:
        from_attributes = True

class TheaterDetailResponse(BaseModel):
    id: int | str
    name: str
    brand: str | None
    chain: str | None
    address: dict | str | None
    street: str | None
    city: str | None
    state: str | None
    country: str | None
    postcode: str | None
    screens_count: int | None
    screens: List[ScreenResponse] = []

    class Config:
        from_attributes = True