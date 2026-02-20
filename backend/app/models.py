from pydantic import BaseModel
from typing import List, Dict, Optional
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Student(BaseModel):
    grades: Dict[str, str]
    interests: List[str]
    skills: List[str]
    linguistic: int
    musical: int
    bodily: int
    logicalMathematical: int
    spatialVisualization: int
    interpersonal: int
    intrapersonal: int
    naturalist: int
    p1: str
    p2: str
    p3: str
    p4: str
    p5: str
    p6: str
    p7: str
    p8: str
    preferred_careers: Optional[List[str]] = None

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String)
    profile_image_url = Column(String, nullable=True)
    school_attended = Column(String, nullable=True)
    id_birth_cert_number = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)

    password_reset_tokens = relationship("PasswordResetToken", back_populates="user")

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)

    user = relationship("User", back_populates="password_reset_tokens")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_name = Column(String, nullable=True) # Allow null for career-only recommendations
    career_name = Column(String, nullable=True) # Allow null for course-only recommendations
    course_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User")

class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id"))
    rating = Column(Integer)
    comment = Column(String)

    recommendation = relationship("Recommendation")

class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, index=True)
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    