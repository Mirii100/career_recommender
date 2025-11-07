from datetime import datetime, timedelta
from typing import Optional
import secrets

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from . import models, schemas
from .database import get_db

SECRET_KEY = "307d6bab16f2ecc53fc9f95bc6c518ce865cab1b181d2c39ebe83a482c1a311a"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES = 60 # Token valid for 60 minutes

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password[:72])


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_user(db: Session, username: Optional[str] = None, email: Optional[str] = None):


    if username:


        return db.query(models.User).filter(models.User.username == username).first()


    elif email:


        return db.query(models.User).filter(models.User.email == email).first()


    return None





def authenticate_user(db: Session, username: str, password: str):


    user = get_user(db, username=username)


    if not user:


        user = get_user(db, email=username) # Try to authenticate with email if username fails


    if not user:


        return False


    if not verify_password(password, user.hashed_password):


        return False


    return user





def create_user(db: Session, user: schemas.UserCreate):


    hashed_password = get_password_hash(user.password)


    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)


    db.add(db_user)


    db.commit()


    db.refresh(db_user)


    return db_user


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


def update_user(db: Session, current_user: models.User, user_update: schemas.UserUpdate):
    if user_update.username is not None:
        current_user.username = user_update.username
    if user_update.password is not None:
        current_user.hashed_password = get_password_hash(user_update.password)
    if user_update.profile_image_url is not None:
        current_user.profile_image_url = user_update.profile_image_url
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

def generate_password_reset_token(db: Session, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)
    db_token = models.PasswordResetToken(user_id=user_id, token=token, expires_at=expires_at)
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return token

def verify_password_reset_token(db: Session, token: str) -> Optional[models.User]:
    db_token = db.query(models.PasswordResetToken).filter(models.PasswordResetToken.token == token).first()
    if not db_token or db_token.expires_at < datetime.utcnow():
        return None
    user = db.query(models.User).filter(models.User.id == db_token.user_id).first()
    # Invalidate the token after use
    db.delete(db_token)
    db.commit()
    return user