from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import timedelta
import os
import shutil
import smtplib
from email.message import EmailMessage
import json
import asyncio
import time
import subprocess

from . import auth, models, schemas
from .database import SessionLocal, engine, get_db
from .recommender import Recommender
from .models import Student

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Global variable to store the last modification time of model files
last_model_mtime = 0.0

async def run_train_script_in_background():
    """Runs the train.py script in a separate process."""
    print("Starting background training script (train.py)...")
    # Use subprocess.Popen to run train.py without blocking the main thread
    # stdout and stderr are redirected to pipes to prevent blocking
    process = subprocess.Popen(
        ["python", "train.py"],
        cwd=".", # train.py is in the current working directory (backend)
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    # You can read stdout/stderr if needed, but for a background task,
    # it might be sufficient to just let it run.
    # For debugging, you might want to log these.
    stdout, stderr = process.communicate()
    if process.returncode != 0:
        print(f"Error running train.py: {stderr.decode()}")
    else:
        print(f"train.py completed successfully: {stdout.decode()}")

async def monitor_and_reload_models():
    """Monitors model files for changes and reloads them dynamically."""
    global last_model_mtime
    model_paths = [recommender.rf_model_path, recommender.xgb_model_path, recommender.svm_model_path]
    
    # Initialize last_model_mtime with the current modification time of the newest model
    for path in model_paths:
        if os.path.exists(path):
            current_mtime = os.path.getmtime(path)
            if current_mtime > last_model_mtime:
                last_model_mtime = current_mtime

    while True:
        await asyncio.sleep(10)  # Check every 10 seconds
        
        updated = False
        for path in model_paths:
            if os.path.exists(path):
                current_mtime = os.path.getmtime(path)
                if current_mtime > last_model_mtime:
                    print(f"Detected change in model file: {path}. Reloading models...")
                    recommender._load_models()
                    last_model_mtime = current_mtime
                    updated = True
                    break # Only need to reload once if any model file changes
        
        if updated:
            print("Models reloaded successfully.")

@app.on_event("startup")
async def startup_event():
    # Run train.py in the background once on startup
    asyncio.create_task(run_train_script_in_background())
    # Start monitoring model files for changes
    asyncio.create_task(monitor_and_reload_models())

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
    courses_path="data/final_courses_cleaned.csv",
    careers_path="data/careers.csv",
    rf_model_path="app/random_forest_course_model.joblib", # Updated path
    xgb_model_path="app/xgboost_course_model.joblib", # Updated path
    svm_model_path="app/svm_course_model.joblib", # New path
    metrics_path="app/model_metrics.json",
    career_model_path="app/career_recommendation_model.joblib", # New path
    career_label_encoder_path="app/career_label_encoder.joblib" # New path
)

# --- Email Configuration (Replace with your actual details or environment variables) ---
# You need to set these environment variables or replace them with your actual SMTP details.
# Example for Gmail: SMTP_HOST='smtp.gmail.com', SMTP_PORT=587, SMTP_USERNAME='your_email@gmail.com', SMTP_PASSWORD='your_app_password'
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.example.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "your_email@example.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "your_email_password")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "no-reply@example.com")

def send_email(to_email: str, subject: str, body: str):
    msg = EmailMessage()
    msg.set_content(body)
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL
    msg['To'] = to_email

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
            smtp.send_message(msg)
        print(f"Email sent successfully to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        # In a real application, you might log this error or raise an HTTPException
# -----------------------------------------------------------------------------------

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
    db_user_username = auth.get_user(db, username=user.username)
    if db_user_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user_email = auth.get_user(db, email=user.email)
    if db_user_email:
        raise HTTPException(status_code=400, detail="Email already registered")
        
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
    
    reset_link = f"http://localhost:3000/reset-password/{token}"
    email_body = f"Hello {user.username},\n\nTo reset your password, please click on the following link: {reset_link}\n\nThis link will expire in {auth.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes.\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nYour App Team"
    
    # Send the actual email
    send_email(to_email=user.email, subject="Password Reset Request", body=email_body)
    
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
    # Validate that the number of subjects does not exceed 7
    if len(student.grades) > 7:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The number of subjects cannot exceed 7."
        )

    recommendations = recommender.recommend(student)

    saved_recommendations = []

    # Save courses recommendations to the database
    for course_rec in recommendations['courses']:
        db_recommendation = models.Recommendation(
            user_id=current_user.id,
            course_name=course_rec['name'],
            career_name=None, # This is a course recommendation, so career_name is None
            course_type=course_rec['type']
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
    try:
        db_rating = models.Rating(
            recommendation_id=rating_data.recommendation_id,
            rating=rating_data.rating,
            comment=rating_data.comment
        )
        db.add(db_rating)
        db.commit()
        db.refresh(db_rating)
        return db_rating
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {e}"
        )

@app.get("/ratings/", response_model=List[schemas.Rating])
def get_all_ratings(db: Session = Depends(get_db)):
    ratings = db.query(models.Rating).all()
    return ratings

@app.get("/model-metrics/")
def get_model_metrics(db: Session = Depends(get_db)):
    metrics = db.query(models.ModelMetric).all()
    if not metrics:
        raise HTTPException(status_code=404, detail="Model metrics not found in database.")

    # Format the metrics into the expected JSON structure
    formatted_metrics = {}
    for metric in metrics:
        formatted_metrics[metric.model_name] = {
            "accuracy": metric.accuracy,
            "precision": metric.precision,
            "recall": metric.recall,
            "f1_score": metric.f1_score
        }
    return formatted_metrics

@app.get("/recommendations/history/", response_model=List[schemas.RecommendationInDB])
def get_recommendation_history(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    history = db.query(models.Recommendation).filter(models.Recommendation.user_id == current_user.id).order_by(models.Recommendation.created_at.desc()).all()
    return history

@app.get("/")
def read_root():
    return {"message": "Welcome to the Career Guidance API"}