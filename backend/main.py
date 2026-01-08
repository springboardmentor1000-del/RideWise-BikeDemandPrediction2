from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

from groq import Groq
from predict import predict_daily, predict_hourly

# ===============================
# ENV SETUP
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
print("GROQ_API_KEY loaded:", bool(GROQ_API_KEY))

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not found in .env")

client = Groq(api_key=GROQ_API_KEY)

# ===============================
# APP SETUP
# ===============================
app = FastAPI(title="RideWise Bike Demand API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# REQUEST SCHEMAS
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


class ChatResponse(BaseModel):
    reply: str


# ===============================
# HEALTH CHECK
# ===============================
@app.get("/")
def health():
    return {
        "status": "RideWise API running",
        "models": ["LightGBM", "LLaMA-3 (Groq)"],
        "features": ["daily", "hourly", "chat"]
    }


# ===============================
# DAILY PREDICTION
# ===============================
@app.post("/predict/daily")
def daily_prediction(req: DailyRequest):
    try:
        result = predict_daily(req.dict())
        return {"predicted_daily_demand": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===============================
# HOURLY PREDICTION
# ===============================
@app.post("/predict/hourly")
def hourly_prediction(req: HourlyRequest):
    try:
        result = predict_hourly(req.dict())
        return {"predicted_hourly_demand": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===============================
# RideWise AI (Groq – LLaMA 3.1)
# ===============================
@app.post("/predict/chat", response_model=ChatResponse)
def chat_proxy(req: ChatRequest):
    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are RideWise AI. "
                        "Explain bike rental demand patterns clearly, simply, and practically. "
                        "Avoid emojis. Be concise and data-oriented."
                    )
                },
                {
                    "role": "user",
                    "content": req.message
                }
            ],
            temperature=0.3,
            max_tokens=400
        )

        reply = completion.choices[0].message.content
        return {"reply": reply}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

