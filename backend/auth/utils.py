import random
import smtplib
from email.message import EmailMessage
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

OTP_STORE = {}  # {email: otp}

def generate_otp():
    return str(random.randint(100000, 999999))

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password, hashed):
    return pwd_context.verify(password, hashed)

def send_otp_email(email: str, otp: str):
    msg = EmailMessage()
    msg.set_content(f"Your RideWise OTP is: {otp}")
    msg["Subject"] = "RideWise Email Verification"
    msg["From"] = "yourgmail@gmail.com"
    msg["To"] = email

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login("yourgmail@gmail.com", "APP_PASSWORD")
        smtp.send_message(msg)
