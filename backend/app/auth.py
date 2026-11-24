import os
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from argon2 import PasswordHasher
from fastapi import Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from .database import get_db
from .models import User

# Bearer scheme (auto_error=False allows falling back to cookie)
bearer_scheme = HTTPBearer(auto_error=False)

# Password hashing with Argon2
pwd_hasher = PasswordHasher()


def get_password_hash(password: str) -> str:
    """Hash a password using Argon2."""
    return pwd_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored Argon2 hash."""
    try:
        return pwd_hasher.verify(hashed_password, plain_password)
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT token containing 'sub' with user id."""
    to_encode = data.copy()
    expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=expire_minutes))
    to_encode.update({"exp": expire})
    secret_key = os.getenv("JWT_SECRET_KEY")
    if not secret_key:
        raise RuntimeError("JWT_SECRET_KEY not set in environment.")
    return jwt.encode(to_encode, secret_key, algorithm="HS256")


def set_auth_cookie(response: Response, token: str):
    """Set secure HttpOnly cookie for session persistence."""
    max_age = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) * 60
    # Secure flag can be False for local development, True in production
    is_prod = os.getenv("ENVIRONMENT", "development").lower() == "production"
    response.set_cookie(
        key="access_token",
        value=token,
        max_age=max_age,
        httponly=True,
        samesite="lax",
        secure=is_prod,
        path="/",
    )


def clear_auth_cookie(response: Response):
    """Clear the authentication cookie on logout."""
    response.delete_cookie(key="access_token", path="/")


def extract_token_from_request(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Optional[str]:
    """Extract JWT token from Bearer Authorization header or HttpOnly cookie."""
    if credentials and credentials.credentials:
        return credentials.credentials
    cookie_token = request.cookies.get("access_token")
    if cookie_token:
        return cookie_token
    return None


def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Validate JWT from Authorization header or cookie and return the active User.
    Raises 401 if missing, expired, or invalid.
    """
    token = extract_token_from_request(request, credentials)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    secret_key = os.getenv("JWT_SECRET_KEY")
    if not secret_key:
        raise RuntimeError("JWT_SECRET_KEY not set in environment.")

    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
    except Exception:
        raise credentials_exception

    if user is None or not user.is_active:
        raise credentials_exception

    return user


def get_optional_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Optionally returns the current User if valid token is provided.
    Does not raise 401 if unauthenticated (returns None).
    """
    try:
        token = extract_token_from_request(request, credentials)
        if not token:
            return None
        secret_key = os.getenv("JWT_SECRET_KEY")
        if not secret_key:
            return None
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user and user.is_active:
            return user
    except Exception:
        return None
    return None


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Verifies that the current user has the 'admin' role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required.",
        )
    return current_user
