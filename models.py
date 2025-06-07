from sqlalchemy import Column, Integer, String, Float, BigInteger, ForeignKey, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSON
from database import Base  

class Theater(Base):
    __tablename__ = "theaters"
    id = Column(Integer, primary_key=True)
    osm_id = Column(BigInteger, unique=True)
    name = Column(String)
    brand = Column(String)
    operator = Column(String)
    street = Column(String)
    city = Column(String)
    state = Column(String)
    postcode = Column(String)
    country = Column(String)
    lat = Column(Float)
    lon = Column(Float)
    website = Column(String)
    screens_count = Column(Integer)
    screens_count_source = Column(String)
    screens = relationship("Screen", back_populates="theater", cascade="all, delete")

class BestSeatSuggestion(Base):
    __tablename__ = "best_seat_suggestions"

    id = Column(Integer, primary_key=True)
    screen_id = Column(Integer, ForeignKey("screens.id"), nullable=False)
    suggested_seat = Column(String, nullable=False)
    user_notes = Column(String)
    timestamp = Column(DateTime, server_default=func.now())

    screen = relationship("Screen", back_populates="suggestions")

class Screen(Base):
    __tablename__ = "screens"
    id = Column(Integer, primary_key=True)
    theater_id = Column(Integer, ForeignKey("theaters.id"), nullable=False)
    screen_number = Column(Integer, nullable=False)
    name = Column(String)
    is_imax = Column(Boolean)
    layout_json = Column(JSON)
    best_seat = Column(String)
    notes = Column(String)

    theater = relationship("Theater", back_populates="screens")
    suggestions = relationship("BestSeatSuggestion", back_populates="screen", cascade="all, delete")