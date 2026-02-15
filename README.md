 RideWise: Bike Demand Prediction

An AI-powered web application that predicts bike-sharing demand using machine learning and environmental factors like weather, season, and time.
Designed to help operators optimize fleet distribution and reduce demand shortages.

---

## 🌐 Live Demo

Frontend deployed on *Render*:
👉 [https://ridewise-ui.onrender.com](https://ridewise-ui.onrender.com)

---

## 🚀 Key Features

* 📊 Hourly demand prediction using environmental parameters
* 📅 Daily demand forecasting for strategic planning
* 📂 CSV upload for batch demand analysis
* 📈 Interactive dashboard with real-time insights
* 🧠 Machine Learning regression model for demand estimation
* 🎯 Actionable alerts for surge zones and low inventory

---

## 🛠 Tech Stack

*Frontend:* React + TypeScript + Tailwind CSS + shadcn-ui
*Backend:* Python (Flask / FastAPI)
*Machine Learning:* Regression-based demand prediction model
*Deployment:* GitHub + Render

---

## 🔍 How RideWise Works

1. User selects prediction type (Hourly / Daily / CSV)
2. Inputs environmental parameters (season, weather, temperature, humidity, wind speed)
3. Frontend sends request to backend ML model
4. Model predicts expected bike demand
5. Results displayed with peak hour insights and demand trends

---

## 🧪 Use Case

RideWise helps bike-sharing companies:

* Predict peak rental hours
* Optimize bike redistribution
* Reduce shortages during high demand
* Improve operational efficiency

---

## 🖥️ Local Setup

bash
# Clone repository from :contentReference[oaicite:1]{index=1}
git clone https://github.com/<your-username>/RideWise-BikeDemandPrediction2.git
cd RideWise-BikeDemandPrediction2

# Install frontend dependencies
npm install
npm run dev

# Run backend server (example)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload


---

## 📌 Project Status

✔ UI Completed
✔ ML Model Integrated
✔ Live Deployment Ready
✔ Demo Tested Successfully

---

## ❤️ Acknowledgement

Built as part of an industry-oriented internship project to demonstrate real-world demand forecasting using machine learning.

---

### Why this version is BEST:

* Professional but not exaggerated
* Matches your actual app flow (Hourly, Daily, CSV, Dashboard)
* Impressive for Infosys panel review
* Clear architecture explanation
