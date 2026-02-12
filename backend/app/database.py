from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

#DATABASE_URL = "postgresql://postgres:alex@localhost/career_guidance"
DATABASE_URL = "postgresql+psycopg2://career_user:alex@localhost:5432/career_guidance_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()