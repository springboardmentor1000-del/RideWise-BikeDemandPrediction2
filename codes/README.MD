🚲 RideWise – Bike Demand Prediction System
📌 Project Overview

RideWise is a full-stack machine learning web application that predicts bike rental demand using weather conditions, time-based features, and user inputs.
The system supports user authentication, ride booking, analytics dashboards, and includes an AI-powered chatbot for intelligent user assistance.

✨ Key Features

🔐 User Authentication – Signup, Login, Logout

📈 Bike Demand Prediction – Hourly & Daily predictions

🤖 AI Chatbot – Powered by Google Gemini

🚴 Ride Booking System – Book & cancel rides

📊 User Dashboard – Ride analytics & trends

📁 JSON-Based Storage – Users, bookings, reviews

🎤 Voice-Enabled Chatbot – Speech-to-text support

📉 Overall Ride Analytics – Visual insights using charts

🧠 Machine Learning Models
Model	Purpose
LightGBM	Hourly bike demand prediction
XGBoost	Daily bike demand prediction

Models are loaded from serialized .pkl files.

Feature processing is handled using custom feature engineering modules.

🛠 Tech Stack
🎨 Frontend

HTML5

CSS3

JavaScript

Chart.js

Web Speech API (voice input)

⚙️ Backend

Python

Flask

Pydantic (input validation)

Google Gemini API

JSON-based persistence

🤖 Machine Learning

Pandas

LightGBM

XGBoost

Custom feature engineering pipelines



RideWise/
│

├── app.py                      # Main Flask backend
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

├── templates/                  # HTML templates
├── static/                     # CSS, JS, assets
├── reviews.json
├── .env
└── README.md





Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/RideWise-BikeDemandPrediction2.git
cd RideWise-BikeDemandPrediction2

2️⃣ Create Virtual Environment (Recommended)
python -m venv venv


Activate the environment

Windows

venv\Scripts\activate


Mac / Linux

source venv/bin/activate

3️⃣ Install Required Dependencies
pip install flask pandas pydantic python-dotenv lightgbm xgboost google-generativeai werkzeug

4️⃣ Setup Environment Variables

Create a .env file in the root directory:

GEMINI_API_KEY=your_google_gemini_api_key
SECRET_KEY=your_flask_secret_key


⚠️ Note:
GEMINI_API_KEY is mandatory. The application will not start without it.

▶️ Run the Application
python app.py

🧪 How the System Works
🔹 Demand Prediction

Users enter weather and time-based inputs

Features are processed using custom pipelines

ML models return predicted bike demand

🔹 Ride Booking

Users book rides by providing distance and time

Booking details are stored in bookings.json

Supports ride cancellation and status updates

🔹 AI Chatbot

Powered by Google Gemini

Answers questions related to demand, weather, and usage

Supports voice input using browser speech recognition

🔹 Dashboard & Analytics

Displays total rides, cancellations, and weekly trends

Visualized using Chart.js

🔐 Security & Validation

Password hashing using werkzeug.security

Session-based authentication

Input validation via Pydantic schemas

Secure environment variable handling using .env
