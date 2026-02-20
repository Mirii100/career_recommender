from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime

class SubjectGradePoints(BaseModel):
    subject: str
    grade: str
    points: int

class Recommendation(BaseModel):
    id: Optional[int] = None  # Add id field
    name: str
    type: str
    course_type: Optional[str] = None
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
    school_attended: Optional[str] = None
    id_birth_cert_number: Optional[str] = None
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str
    password_confirmation: str

    @validator('password_confirmation')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('passwords do not match')
        return v

class User(UserBase):
    id: int
    profile_image_url: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class RatingCreate(BaseModel):
    recommendation_id: Optional[int] = None
    rating: int
    comment: Optional[str] = None

class Rating(RatingCreate):
    id: int

    class Config:
        from_attributes = True

class RecommendationInDB(BaseModel):
    id: int
    user_id: int
    course_name: Optional[str] = None
    career_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    profile_image_url: Optional[str] = None
    school_attended: Optional[str] = None
    id_birth_cert_number: Optional[str] = None
    phone_number: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
