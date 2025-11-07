from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import timedelta
import os
import shutil

from . import auth, models, schemas
from .database import SessionLocal, engine, get_db
from .recommender import Recommender
from .models import Student

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Create a directory for static files if it doesn't exist
STATIC_DIR = "static"
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recommender = Recommender(
    courses_path="./data/courses.csv",
    careers_path="./data/careers.csv",
    model_path="./app/course_recommender_model.joblib",
    metrics_path="./app/model_metrics.json"
)

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, username=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = auth.get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return auth.create_user(db=db, user=user)


@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(auth.get_current_user)):
    return current_user

@app.put("/users/me/", response_model=schemas.User)
async def update_users_me(user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    return auth.update_user(db=db, current_user=current_user, user_update=user_update)

@app.post("/upload-profile-image/")
async def upload_profile_image(file: UploadFile = File(...)):
    try:
        file_location = f"{STATIC_DIR}/{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not upload file")
    finally:
        file.file.close()
    return {"url": f"http://localhost:8000/static/{file.filename}"}

@app.post("/forgot-password/")
async def forgot_password(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = auth.get_user(db, email=request.email)
    if not user:
        # Return a generic success message to prevent email enumeration
        return {"message": "If an account with that email exists, a password reset token has been sent."}
    
    token = auth.generate_password_reset_token(db, user.id)
    
    # --- Placeholder for actual email sending logic ---
    reset_link = f"http://localhost:3000/reset-password/{token}"
    email_body = f"Hello {user.username},\n\nTo reset your password, please click on the following link: {reset_link}\n\nThis link will expire in {auth.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes.\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nYour App Team"
    
    print(f"\n--- SIMULATED EMAIL TO: {user.email} ---")
    print(email_body)
    print("---------------------------------------\n")
    # In a real application, you would use an email sending library here (e.g., SMTPLib, SendGrid, Mailgun)
    # Example: send_email(to_email=user.email, subject="Password Reset Request", body=email_body)
    # ---------------------------------------------------
    
    return {"message": "If an account with that email exists, a password reset token has been sent."}

@app.post("/reset-password/")
async def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user = auth.verify_password_reset_token(db, request.token)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    user.hashed_password = auth.get_password_hash(request.new_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {"message": "Password has been reset successfully."}


@app.post("/recommend", response_model=schemas.Recommendations)
def get_recommendations(student: Student, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    recommendations = recommender.recommend(student)

    saved_recommendations = []

    # Save courses recommendations to the database
    for course_rec in recommendations['courses']:
        db_recommendation = models.Recommendation(
            user_id=current_user.id,
            course_name=course_rec['name'],
            career_name=None # This is a course recommendation, so career_name is None
        )
        db.add(db_recommendation)
        saved_recommendations.append(db_recommendation)
    
    # Save career recommendations to the database
    for career_rec in recommendations['careers']:
        db_recommendation = models.Recommendation(
            user_id=current_user.id,
            course_name=None, # This is a career recommendation, so course_name is None
            career_name=career_rec['name']
        )
        db.add(db_recommendation)
        saved_recommendations.append(db_recommendation)
    
    db.commit()

    # Refresh all saved recommendations to get their IDs
    for rec in saved_recommendations:
        db.refresh(rec)
    
    # Update the recommendations object with the IDs
    for i, course_rec in enumerate(recommendations['courses']):
        course_rec['id'] = saved_recommendations[i].id
    
    for i, career_rec in enumerate(recommendations['careers']):
        # Adjust index for careers as they come after courses in saved_recommendations
        career_rec['id'] = saved_recommendations[len(recommendations['courses']) + i].id

    return recommendations

@app.post("/ratings/")
def create_rating(
    rating_data: schemas.RatingCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    db_rating = models.Rating(
        recommendation_id=rating_data.recommendation_id,
        rating=rating_data.rating,
        comment=rating_data.comment
    )
    db.add(db_rating)
    db.commit()
    db.refresh(db_rating)
    return db_rating

@app.get("/ratings/", response_model=List[schemas.Rating])
def get_all_ratings(db: Session = Depends(get_db)):
    ratings = db.query(models.Rating).all()
    return ratings

@app.get("/")
def read_root():
    return {"message": "Welcome to the Career Guidance API"}