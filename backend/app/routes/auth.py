import os
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter()


@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register_user(
    payload: schemas.RegisterUser,
    response: Response,
    db: Session = Depends(get_db),
):
    # Check if email is already registered
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    # Determine role (check if matches configured ADMIN_EMAIL)
    admin_email = os.getenv("ADMIN_EMAIL")
    user_role = "admin" if (admin_email and payload.email.lower() == admin_email.lower()) else "student"

    # Hash password with Argon2
    hashed = auth.get_password_hash(payload.password)
    user = models.User(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        password_hash=hashed,
        role=user_role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create access token and set HttpOnly cookie
    access_token = auth.create_access_token(data={"sub": str(user.id)})
    auth.set_auth_cookie(response, access_token)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/login", response_model=schemas.Token)
def login_user(
    payload: schemas.LoginUser,
    response: Response,
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.email == payload.email.lower().strip()).first()
    if not user or not auth.verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support.",
        )

    # If user matches ADMIN_EMAIL and is not yet admin, promote them
    admin_email = os.getenv("ADMIN_EMAIL")
    if admin_email and user.email.lower() == admin_email.lower() and user.role != "admin":
        user.role = "admin"
        db.commit()
        db.refresh(user)

    access_token = auth.create_access_token(data={"sub": str(user.id)})
    auth.set_auth_cookie(response, access_token)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/logout")
def logout_user(response: Response):
    auth.clear_auth_cookie(response)
    return {"message": "Successfully logged out."}


@router.get("/me", response_model=schemas.UserResponse)
def read_current_user(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
