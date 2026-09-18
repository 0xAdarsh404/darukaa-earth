from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post("/register")
def register(
    name: str,
    email: str,
    password: str,
    db: Session = Depends(get_db),
):
    # Check if email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Hash password
    hashed_password = hash_password(password)

    # Create user
    new_user = User(
        name=name,
        email=email,
        password_hash=hashed_password,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
        },
    }


@router.post("/login")
def login(
    email: str,
    password: str,
    db: Session = Depends(get_db),
):
    # Find user
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify password
    if not verify_password(
        password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Create JWT token
    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
    }