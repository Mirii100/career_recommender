from app.models import Base
from app.database import engine

print("Dropping existing database tables...")
Base.metadata.drop_all(bind=engine)
print("Existing database tables dropped.")

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Database tables created.")