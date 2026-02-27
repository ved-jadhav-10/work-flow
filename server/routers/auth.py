"""Auth API router — register, login, OAuth, and current-user endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas.auth import (
    RegisterRequest,
    LoginRequest,
    OAuthRequest,
    UserResponse,
    AuthResponse,
)
from services.auth import hash_password, verify_password, create_access_token
from middleware.auth import get_current_user

router = APIRouter()


# ── POST /api/auth/register ──────────────────────────────────────────────────

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    # Check existing email
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    user = User(
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        provider="credentials",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id))
    return AuthResponse(
        user=UserResponse.model_validate(user),
        access_token=token,
    )


# ── POST /api/auth/login ─────────────────────────────────────────────────────

@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(str(user.id))
    return AuthResponse(
        user=UserResponse.model_validate(user),
        access_token=token,
    )


# ── POST /api/auth/oauth ─────────────────────────────────────────────────────
# Called by NextAuth callback when a user signs in via Google.
# Creates the user if they don't exist, else returns the existing user + JWT.

@router.post("/oauth", response_model=AuthResponse)
def oauth_login(body: OAuthRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()

    if not user:
        user = User(
            name=body.name,
            email=body.email,
            provider=body.provider,
            avatar_url=body.avatar_url,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(str(user.id))
    return AuthResponse(
        user=UserResponse.model_validate(user),
        access_token=token,
    )


# ── GET /api/auth/me ─────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
