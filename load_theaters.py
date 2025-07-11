import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import insert
from models import Base, Theater, Screen
import requests
import re

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable not set. Please check your .env file.")

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

AREAS = [
    #SEATTLE AREA
    {"name": "Seattle", "state": "WA", "country": "US"},
    {"name": "Bellevue", "state": "WA", "country": "US"},
    {"name": "Redmond", "state": "WA", "country": "US"},
    {"name": "Kirkland", "state": "WA", "country": "US"},
    {"name": "Bothell", "state": "WA", "country": "US"},
    #BOSTON AREA
    {"name": "Boston", "state": "MA", "country": "US"},
    {"name": "Cambridge", "state": "MA", "country": "US"},
    {"name": "Somerville", "state": "MA", "country": "US"},
    {"name": "Brookline", "state": "MA", "country": "US"},
    {"name": "Cambridge", "state": "MA", "country": "US"},
    #BAY AREA
    {"name": "San Francisco", "state": "CA", "country": "US"},
    {"name": "San Jose", "state": "CA", "country": "US"},
    {"name": "Oakland", "state": "CA", "country": "US"},
    {"name": "San Mateo", "state": "CA", "country": "US"},
    {"name": "Redwood City", "state": "CA", "country": "US"},
    {"name": "Palo Alto", "state": "CA", "country": "US"},
    #PHILADELPHIA AREA
    {"name": "Philadelphia", "state": "PA", "country": "US"},
    {"name": "West Chester", "state": "PA", "country": "US"},
    {"name": "Exton", "state": "PA", "country": "US"},
    {"name": "Malvern", "state": "PA", "country": "US"},
    {"name": "Wayne", "state": "PA", "country": "US"},
    {"name": "Bala Cynwyd", "state": "PA", "country": "US"},
    {"name": "Langhorne", "state": "PA", "country": "US"},
    {"name": "Bensalem", "state": "PA", "country": "US"},

]

for area in AREAS:
    query = f"""
    [out:json][timeout:25];
    area["name"="{area['name']}"][admin_level=8]->.searchArea;
    (
      node["amenity"="cinema"](area.searchArea);
      way["amenity"="cinema"](area.searchArea);
      relation["amenity"="cinema"](area.searchArea);
      node["amenity"="cinema"](around:5000,40.1251,-74.9545);  // Bensalem coordinates
      way["amenity"="cinema"](around:5000,40.1251,-74.9545);
      relation["amenity"="cinema"](around:5000,40.1251,-74.9545);
    );
    out center;
    """

    response = requests.post("https://overpass-api.de/api/interpreter", data={"data": query})
    elements = response.json().get("elements", [])

    for el in elements:
        tags = el.get("tags", {})

        city = tags.get("addr:city") or area["name"]
        state = tags.get("addr:state") or area["state"]
        country = tags.get("addr:country") or area["country"]

        if "screen" in tags:
            screens_count = int(tags["screen"])
            screens_count_source = "osm_tag"
        else:
            name = tags.get("name", "")
            match = re.search(r'\b(\d{1,2})\b', name)
            if match:
                screens_count = int(match.group(1))
                screens_count_source = "name_parse"
            else:
                screens_count = None
                screens_count_source = None

        insert_stmt = insert(Theater).values(
            osm_id=el["id"],
            name=tags.get("name"),
            brand=tags.get("brand"),
            operator=tags.get("operator"),
            street=tags.get("addr:street"),
            city=city,
            state=state,
            postcode=tags.get("addr:postcode"),
            country=country,
            lat=el.get("lat"),
            lon=el.get("lon"),
            website=tags.get("website"),
            screens_count=screens_count,
            screens_count_source=screens_count_source
        )

        update_fields = {
            "name": insert_stmt.excluded.name,
            "brand": insert_stmt.excluded.brand,
            "operator": insert_stmt.excluded.operator,
            "street": insert_stmt.excluded.street,
            "city": insert_stmt.excluded.city,
            "state": insert_stmt.excluded.state,
            "postcode": insert_stmt.excluded.postcode,
            "country": insert_stmt.excluded.country,
            "lat": insert_stmt.excluded.lat,
            "lon": insert_stmt.excluded.lon,
            "website": insert_stmt.excluded.website,
        }

        if screens_count is not None:
            update_fields["screens_count"] = insert_stmt.excluded.screens_count
            update_fields["screens_count_source"] = insert_stmt.excluded.screens_count_source

        update_stmt = insert_stmt.on_conflict_do_update(
            index_elements=["osm_id"],
            set_=update_fields
        )

        session.execute(update_stmt)

# Now populate screens
theaters_with_counts = session.query(Theater).filter(Theater.screens_count.isnot(None)).all()

for theater in theaters_with_counts:
    existing = session.query(Screen).filter_by(theater_id=theater.id).count()
    if existing == 0:
        for n in range(1, theater.screens_count + 1):
            screen = Screen(
                theater_id=theater.id,
                screen_number=n,
                name=f"Screen {n}"
            )
            session.add(screen)

session.commit()
session.close()