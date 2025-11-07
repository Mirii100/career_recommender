from pydantic import BaseModel
from typing import List, Optional

class SubjectGradePoints(BaseModel):
    subject: str
    grade: str
    points: int

class Recommendation(BaseModel):
    id: Optional[int] = None  # Add id field
    name: str
    type: str
    similarity_score: float
    description: str
    reasoning: str
    job_applicability: str
    future_trends: str
    automation_risk: str

class Recommendations(BaseModel):
    average_points: float
    profile_rating: str
    model_accuracy: float
    subject_grades_points: List[SubjectGradePoints]
    courses: List[Recommendation]
    careers: List[Recommendation]

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    profile_image_url: Optional[str] = None

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class RatingCreate(BaseModel):
    recommendation_id: int
    rating: int
    comment: Optional[str] = None

class Rating(RatingCreate):
    id: int

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    profile_image_url: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
