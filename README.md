# 🚲 RideWise – Bike Demand Prediction System
Predicting bike-sharing demand using ML and weather/event data

Frontend deployed at : https://ride-wise-2jah.vercel.app/

🔗 **Branch Repository:**  
[https://github.com/springboardmentor1000-del/RideWise-BikeDemandPrediction2/tree/athira-k](https://github.com/springboardmentor1000-del/RideWise-BikeDemandPrediction2/tree/athira-k)

---

## 📌 Problem Statement

Bike-sharing systems often struggle to balance supply and demand across stations. Traditional approaches rely on historical averages and manual estimations, which lead to:

- ❌ Inefficient bike redistribution
- ❌ High operational costs
- ❌ Customer dissatisfaction due to bike unavailability
- ❌ Underutilization during non-peak hours
- ❌ Poor response to weather and seasonal variations

There is a strong need for a **data-driven, intelligent system** that can accurately forecast bike rental demand at both **daily and hourly levels** while integrating real-world factors like weather and time patterns.

---

## 🚀 Project Overview

**RideWise** is an AI-powered Bike Demand Prediction System designed to forecast bike rentals using machine learning techniques.

### This project provides:

- 📅 **Daily Demand Prediction**
- ⏰ **Hourly Demand Prediction**
- 📄 **Manual Input & Smart PDF Parsing**
- 🗺️ **Live Bike Station Map** using OpenStreetMap API
- 💬 **Context-Aware AI Chatbot**
- 📝 **User Feedback System**

The system helps operators optimize bike distribution, reduce operational costs, and improve customer satisfaction.

---

## 🧠 Key Features

### 1️⃣ Daily & Hourly Prediction

- Separate ML models for daily and hourly forecasting
- Weather-aware predictions
- Seasonal and holiday adjustments
- Real-time prediction results

### 2️⃣ Manual Input Prediction

Users can manually enter:
- Season
- Weather conditions
- Temperature
- Humidity
- Wind speed
- Holiday / Working day details

The system processes inputs and returns predicted rental counts instantly.

### 3️⃣ Smart PDF Parsing

- Upload PDF files containing environmental or operational parameters
- Automatic parameter extraction
- Context-aware validation
- Direct prediction based on extracted data

This reduces manual data entry effort.

### 4️⃣ Bike Station Map Integration

- Integrated with **OpenStreetMap API**
- Station visualization
- Demand heatmap view
- Location-based prediction insights

### 5️⃣ AI Chatbot (Context-Aware)

- Understands user queries related to predictions
- Provides guided assistance
- Maintains conversation context
- Helps users navigate the system

### 6️⃣ Feedback Form

- Collects user feedback
- Stores ratings and comments
- Helps improve model and user experience

---

## 🏗️ System Architecture Overview

The application follows a **layered architecture**:

### Frontend (React)
- Home Page
- Daily Prediction Page
- Hourly Prediction Page
- PDF Upload Interface
- Bike Station Map
- Chatbot Interface
- Feedback Form

### Backend (Flask)
- REST API endpoints
- Model inference
- Data preprocessing
- PDF parsing logic
- Feedback storage

### Machine Learning Layer
Trained models for:
- Daily prediction
- Hourly prediction
- Feature preprocessing pipeline
- Normalization and encoding

### Data Storage
- CSV for feedback
- JSON for user/session data
- Serialized ML models

---

## 🛠️ Tech Stack

### Frontend
- React.js
- HTML5 / CSS3
- JavaScript
- OpenStreetMap API

### Backend
- Flask (Python)
- REST APIs
- PDF processing libraries

### Machine Learning
- XGBoost
- Scikit-learn
- Pandas
- NumPy

### Other Integrations
- OpenStreetMap API
- Context-aware chatbot logic

---

## 📊 Prediction Capabilities

### Daily Prediction
- Seasonal impact analysis
- Weather condition adjustment
- Holiday and working-day influence
- Trend-based forecasting

### Hourly Prediction
- Hour-by-hour forecasting
- Peak hour detection
- Short-term demand trends
- Fine-grained temporal modeling

---

## 🎯 Objectives

- ✅ Achieve high prediction accuracy
- ✅ Provide real-time response
- ✅ Enable user-friendly interaction
- ✅ Reduce operational inefficiencies
- ✅ Support scalable deployment

---

## 🌍 Use Cases

- 🚴 Bike-sharing operators
- 🏙️ Smart city transportation systems
- 📊 Urban mobility planners
- 🔬 Demand forecasting research

---

## 📌 Conclusion

**RideWise** combines **Machine Learning + Real-Time Web Application + Intelligent Automation** to deliver a complete bike demand prediction solution.

By integrating:
- 🤖 Predictive analytics
- 📄 Smart PDF extraction
- 🗺️ Interactive maps
- 💬 AI chatbot assistance

RideWise enhances decision-making for bike-sharing systems and supports **efficient, sustainable urban mobility**.

---

## 👤 Author

**Athirakadavath**

---

## 📝 License

This project is part of academic/mentorship work under Springboard.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---
