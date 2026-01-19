# 🚴 RideWise – Smart Bike Rental Prediction & Reservation Platform

RideWise is a **full-stack, AI-powered bike rental platform** that predicts bike rental demand (daily and hourly) using machine learning, enables bike reservation with cost estimation, and provides an interactive chatbot with voice and PDF-based input support.

The project follows a **clean, modular, industry-standard architecture**, separating machine learning, backend APIs, and frontend UI.

---

## 🌟 Key Features

### 🔮 Bike Rental Prediction
- **Daily Prediction** using XGBoost
- **Hourly Prediction** using LightGBM
- Predictions based on **feature-engineered weather and temporal inputs**
- Uses comfort-aware and behavior-aware features

### 🚲 Bike Reservation & Cost Estimation
- Reserve bikes by date, time, duration, and bike type
- Supports:
  - Standard
  - Electric
  - Premium bikes
- Automatic cost calculation (hourly & daily)
- Reservation confirmation with unique ID

### 🤖 AI Chatbot (Gemini API)
- Conversational assistant to:
  - Explain predictions
  - Guide users through the platform
  - Answer feature-related questions
- Supports **voice-based interaction (speech → text → response)**

### 📄 PDF Upload & Auto-Fill
- Upload PDF files (e.g., weather reports)
- Extracts:
  - Temperature
  - Humidity
  - Windspeed
  - Date / Hour
- Automatically fills prediction and reservation forms

### ✍️ User Reviews
- Users can submit reviews and ratings
- Reviews are visible to all users
- Helps build trust and transparency

### 🌗 Dark & Light Mode
- Toggle between dark and light themes
- Modern, responsive, and accessible UI

---

## 🧠 Machine Learning Models

| Prediction Type | Model Used | Dataset |
|-----------------|-----------|---------|
| Daily Rentals | XGBoost Regressor | `day.csv` |
| Hourly Rentals | LightGBM Regressor | `hour.csv` |

### Feature Engineering Highlights
- Comfort Index (Temperature + Humidity)
- Wind Chill Effect
- Weather Severity (Ordinal)
- Weekend & Peak Hour Indicators

Trained models are exported as `.pkl` files and loaded directly by the backend.

---

## 🏗️ Project Architecture

RideWise/
│
├── ridewise-ui/ # Frontend (Lovable / React)
│
├── ridewise-ml/ # ML training & notebooks
│ ├── notebooks/
│ └── models/
│ ├── ridewise_day_xgboost.pkl
│ └── ridewise_hour_lightgbm.pkl
│
└── ridewise-backend/ # Backend (FastAPI)
├── app.py
├── requirements.txt
├── models/
├── data/
└── utils/


---

## ⚙️ Backend Tech Stack

- **FastAPI** – REST API framework
- **XGBoost & LightGBM** – ML models
- **Joblib** – Model serialization
- **Gemini API** – AI chatbot
- **Whisper** – Speech-to-text
- **pdfplumber / Parser AI** – PDF data extraction
- **Python** – Core backend language

---

## 🎨 Frontend Tech Stack

- Built using **Lovable**
- Modern UI with:
  - Glassmorphism
  - Smooth animations
  - Responsive design
- Integrates with backend APIs for:
  - Prediction
  - Reservation
  - Reviews
  - Chatbot
  - PDF upload

---

## 🚀 How to Run the Backend Locally

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/RideWise.git
cd ridewise-backend

2️⃣ Install Dependencies
pip install -r requirements.txt

3️⃣ Set Environment Variables
export GEMINI_API_KEY="your_gemini_api_key"

4️⃣ Run the Server
uvicorn app:app --reload

5️⃣ Open API Docs
http://127.0.0.1:8000/docs

| Endpoint        | Description                   |
| --------------- | ----------------------------- |
| `/predict/day`  | Daily bike rental prediction  |
| `/predict/hour` | Hourly bike rental prediction |
| `/reserve-bike` | Bike reservation & cost       |
| `/cost/hourly`  | Hourly cost calculation       |
| `/cost/daily`   | Daily cost calculation        |
| `/reviews`      | Add / View user reviews       |
| `/chat`         | Gemini chatbot                |
| `/voice-chat`   | Voice-based chatbot           |
| `/upload-pdf`   | PDF upload & auto-fill        |


“RideWise is a full-stack AI-driven bike rental platform that combines machine learning predictions, business logic for reservations and pricing, conversational AI, voice interaction, and document intelligence into a single, production-ready system.”

📌 Future Enhancements

JWT-based authentication

Database integration (PostgreSQL / MongoDB)

Dynamic surge pricing

Admin dashboard & analytics

Cloud deployment (AWS / Render)

👩‍💻 Author

Gotte Kavyasri
B.Tech Computer Science
BV Raju Institute of Technology



