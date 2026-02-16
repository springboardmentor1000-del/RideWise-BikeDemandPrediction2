🚲 RideWise – Bike Demand Prediction System

RideWise is a full-stack machine learning web application that predicts bike rental demand using weather, time, and user inputs, supports user authentication, ride booking, analytics dashboards, and includes an AI-powered chatbot for intelligent assistance.

✨ Key Features

🔐 User authentication (Signup / Login / Logout)

📈 Bike demand prediction (Hourly & Daily)

🤖 AI chatbot powered by Google Gemini

🚴 Ride booking & cancellation system

📊 User dashboard with ride analytics

📁 JSON-based data storage (users, bookings, reviews)

🎤 Voice-enabled chatbot (speech-to-text)

📉 Overall ride analytics visualization

🧠 Machine Learning Models Used

LightGBM – Hourly demand prediction

XGBoost – Daily demand prediction

Models are loaded from serialized .pkl files.

🛠 Tech Stack
Frontend

HTML5

CSS3

JavaScript

Chart.js

Web Speech API (voice input)

Backend

Python

Flask

Pydantic (data validation)

Google Gemini API

JSON-based persistence

Machine Learning

Pandas

LightGBM

XGBoost

Custom feature engineering modules

📁 Project Structure
RideWise/
│
├── app.py                 # Main Flask backend
├── feature_engineering/
│   ├── hour_features.py
│   └── day_features.py
│
├── ridewise/
│   ├── users.json
│   ├── bookings.json
│   ├── lightgbm_model.pkl
│   └── xgboost_model.pkl
│
├── templates/              # HTML templates
├── static/                 # CSS, JS, assets
├── reviews.json
├── .env
└── README.md

⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/RideWise-BikeDemandPrediction2.git
cd RideWise-BikeDemandPrediction2

2️⃣ Create Virtual Environment (Recommended)
python -m venv venv


Activate:

Windows

venv\Scripts\activate


Mac/Linux

source venv/bin/activate

3️⃣ Install Required Dependencies
pip install flask pandas pydantic python-dotenv lightgbm xgboost google-generativeai werkzeug

4️⃣ Setup Environment Variables

Create a .env file in the root directory:

GEMINI_API_KEY=your_google_gemini_api_key
SECRET_KEY=your_flask_secret_key


⚠️ GEMINI_API_KEY is mandatory, otherwise the app will not start.

▶️ Run the Application
python app.py


The app will start at:

http://127.0.0.1:5000/

🧪 How the System Works
🔹 Demand Prediction

Users input weather & time details

Features are processed via custom pipelines

ML models return demand predictions

🔹 Ride Booking

Users book rides with distance & time

Bookings are stored in bookings.json

Supports cancellation & status tracking

🔹 AI Chatbot

Powered by Google Gemini

Answers questions about demand, weather, and usage

Supports voice input using browser speech recognition

🔹 Dashboard & Analytics

Shows ride counts, cancellations, and weekly trends

Uses Chart.js for visualization

📌 Security & Validation

Passwords hashed using werkzeug.security

Session-based authentication

Input validation via Pydantic schemas

Secure environment variable usage




