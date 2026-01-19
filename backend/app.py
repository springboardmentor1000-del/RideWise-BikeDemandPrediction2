from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# PDF / OCR imports
import pdfplumber
import pytesseract
import cv2
import numpy as np
from PIL import Image
import io
import re

from groq import Groq
from predict import predict_daily, predict_hourly


# ===============================
# ENV SETUP
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not found in .env")

client = Groq(api_key=GROQ_API_KEY)


# ===============================
# APP SETUP  ✅ THIS MUST COME BEFORE ROUTES
# ===============================
app = FastAPI(title="RideWise Bike Demand API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===============================
# SCHEMAS
# ===============================
class DailyRequest(BaseModel):
    season: int
    weather: int
    temp: float
    humidity: float
    windspeed: float
    is_weekend: int


class HourlyRequest(DailyRequest):
    hour: int


class ChatRequest(BaseModel):
    message: str


# ===============================
# ROUTES (ALL BELOW app = FastAPI)
# ===============================

@app.get("/")
def health():
    return {"status": "RideWise API running"}


@app.post("/predict/daily")
def daily_prediction(req: DailyRequest):
    return {"predicted_daily_demand": predict_daily(req.dict())}


@app.post("/predict/hourly")
def hourly_prediction(req: HourlyRequest):
    return {"predicted_hourly_demand": predict_hourly(req.dict())}


@app.post("/predict/chat")
def chat_proxy(req: ChatRequest):
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": req.message}],
        temperature=0.3,
        max_tokens=400
    )
    return {"reply": completion.choices[0].message.content}


# ===============================
# ✅ FILE UPLOAD PREDICTION
# ===============================
from fastapi import Form

@app.post("/predict/from-file")
async def predict_from_file(
    file: UploadFile = File(...),
    mode: str = Form("daily")
):
    text = ""

    if file.filename.lower().endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(await file.read())) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
    else:
        image = Image.open(io.BytesIO(await file.read()))
        gray = cv2.cvtColor(np.array(image), cv2.COLOR_BGR2GRAY)
        text = pytesseract.image_to_string(gray)

    print("OCR TEXT >>>")
    print(text)
    print("<<< END OCR")

    def extract(pattern, default):
        match = re.search(pattern, text, re.IGNORECASE)
        return float(match.group(match.lastindex)) if match else default

    payload = {
        "season": int(extract(r"season\s*[:=]?\s*(\d)", 2)),
        "weather": int(extract(r"weather\s*[:=]?\s*(\d)", 1)),
        "temp": extract(r"temp(erature)?\s*[:=]?\s*(\d+)", 25) / 41,
        "humidity": extract(r"humidity\s*[:=]?\s*(\d+)", 60) / 100,
        "windspeed": extract(r"wind(speed)?\s*[:=]?\s*(\d+)", 10) / 67,
        "is_weekend": int(extract(r"(weekend|holiday)\s*[:=]?\s*(1|0)", 0)),
    }

    if mode == "hourly":
        payload["hour"] = int(
            extract(r"(hour|time)\s*[:=]?\s*(\d{1,2})", 12)
        )

        if payload["hour"] < 0 or payload["hour"] > 23:
            raise HTTPException(
                status_code=400,
                detail="Invalid hour extracted from file (0–23 required)"
            )

        result = predict_hourly(payload)
    else:
        result = predict_daily(payload)

    return {
        "mode": mode,
        "prediction": result,
        "extracted_preview": text[:300]
    }
