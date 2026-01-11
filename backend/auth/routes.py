from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.auth.database import SessionLocal
from auth.models import User
from auth.schemas import *
from auth.utils import *

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    otp = generate_otp()
    OTP_STORE[data.email] = otp
    send_otp_email(data.email, otp)

    user = User(email=data.email)
    db.add(user)
    db.commit()

    return {"message": "OTP sent to email"}

@router.post("/verify-otp")
def verify_otp(data: OTPVerifyRequest, db: Session = Depends(get_db)):
    if OTP_STORE.get(data.email) != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user = db.query(User).filter(User.email == data.email).first()
    user.is_verified = True
    db.commit()
    OTP_STORE.pop(data.email)

    return {"message": "Email verified"}

@router.post("/set-password")
def set_password(data: SetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not user.is_verified:
        raise HTTPException(status_code=400, detail="Email not verified")

    user.hashed_password = hash_password(data.password)
    db.commit()

    return {"message": "Password set successfully"}

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"message": "Login successful"}
