from flask import Flask, request, render_template, jsonify, redirect, url_for, flash, session
import pickle, os, json
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from google import genai
from datetime import datetime, timedelta
import pandas as pd
from pydantic import BaseModel, Field
from typing import Literal


from feature_engineering.hour_features import process_hour_features
from feature_engineering.day_features import process_day_features

# -------------------- CONFIG --------------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY missing in .env file")

app = Flask(__name__)
app.secret_key = SECRET_KEY

# Initialize Gemini client
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# -------------------- ML MODELS --------------------
hour_model = pickle.load(open("ridewise/lightgbm_model.pkl", "rb"))
day_model = pickle.load(open("ridewise/xgboost_model.pkl", "rb"))

INT_FEATURES = {'season','mnth','holiday','workingday','weathersit','hr'}
FLOAT_FEATURES = {'temp','hum','windspeed','atemp'}


class BikeFeatures(BaseModel):
    hour: int = Field(description="Hour of the day (0–23)")
    working_day: bool = Field(description="True if working day, false otherwise")
    weather: Literal["Clear", "Mist", "Light Rain", "Heavy Rain"] = Field(
        description="Weather condition"
    )
    temperature: float = Field(description="Temperature in Celsius")
    wind_speed: float = Field(description="Wind speed in km/h")


# -------------------- USERS --------------------
USERS_FILE = os.path.join(os.path.dirname(__file__), "ridewise", "users.json")
os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)

if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, "w") as f:
        json.dump({}, f)

def load_users():
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def save_users(u):
    with open(USERS_FILE, "w") as f:
        json.dump(u, f, indent=4)

# -------------------- BOOKINGS --------------------
BOOKINGS_FILE = os.path.join(os.path.dirname(__file__), "ridewise", "bookings.json")
os.makedirs(os.path.dirname(BOOKINGS_FILE), exist_ok=True)

def load_bookings():
    if not os.path.exists(BOOKINGS_FILE):
        with open(BOOKINGS_FILE, "w") as f:
            json.dump([], f)
    with open(BOOKINGS_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_bookings(bookings):
    with open(BOOKINGS_FILE, "w") as f:
        json.dump(bookings, f, indent=4)
        f.flush()

# -------------------- ROUTES --------------------
@app.route("/")
def home():
    return render_template("index.html", username=session.get("username"))

# -------------------- AUTH --------------------
@app.route("/signup", methods=["GET","POST"])
def signup():
    if request.method == "POST":
        u = request.form["username"].strip()
        p = request.form["password"]
        c = request.form["confirm_password"]

        if p != c:
            flash("Passwords do not match", "danger")
            return redirect(url_for("signup"))

        users = load_users()
        if u in users:
            flash("Username already exists", "danger")
            return redirect(url_for("signup"))

        users[u] = generate_password_hash(p)
        save_users(users)
        flash("Account created! Please login.", "success")
        return redirect(url_for("login"))

    return render_template("signup.html")

@app.route("/login", methods=["GET","POST"])
def login():
    if request.method == "POST":
        u = request.form["username"].strip()
        p = request.form["password"]

        users = load_users()
        if u not in users or not check_password_hash(users[u], p):
            flash("Invalid credentials", "danger")
            return redirect(url_for("login"))

        session["username"] = u
        flash(f"Welcome {u}!", "success")
        return redirect(url_for("home"))

    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    flash("Logged out successfully", "success")
    return redirect(url_for("home"))

# -------------------- BIKE PREDICTION --------------------
@app.route("/predict", methods=["GET","POST"])
def predict():
    if "username" not in session:
        return redirect(url_for("login"))

    if request.method == "GET":
        return render_template("predict.html", username=session["username"])

    data = request.form.to_dict()
    mode = data.pop("mode", "hour").lower()

    try:
        cleaned = {k:(float(v) if k in FLOAT_FEATURES else int(v))
                   for k,v in data.items() if v}
    except:
        return jsonify({"error": "Invalid input"}), 400

    if mode == "hour":
        X = process_hour_features(cleaned, hour_model)
        pred = int(hour_model.predict(X)[0])
    else:
        X = process_day_features(cleaned, day_model)
        pred = int(day_model.predict(X)[0])

    return jsonify({"prediction": pred})

# -------------------- BOOK RIDE --------------------
@app.route("/book")
def book():
    if "username" not in session:
        flash("Please login to book your ride 🚲", "warning")
        return redirect(url_for("login"))

    return render_template("booking.html", username=session["username"])

# -------------------- OVERALL RIDE ANALYTICS PAGE --------------------
@app.route("/overall_ride_analytics")
def overall_ride_analytics():
    if "username" not in session:
        return redirect(url_for("login"))
    return render_template("overall_ride_analytics.html", username=session["username"])

# -------------------- SAVE BOOKING --------------------
@app.route("/confirm-booking", methods=["POST"])
def confirm_booking():
    data = request.get_json(silent=True)
    print("BOOKING JSON:", data)

    if not data:
        return jsonify({"error": "No JSON received"}), 400

    bike = data.get("bike_type", data.get("bike", "standard")).lower()

    time_slot = data.get("time_slot")
    ride_time = data.get("ride_time")

    if not time_slot and ride_time:
        try:
            h = int(ride_time.split(":")[0])
            if 5 <= h < 11:
                time_slot = "morning"
            elif 11 <= h < 16:
                time_slot = "midday"
            elif 16 <= h < 21:
                time_slot = "evening"
            else:
                time_slot = "night"
        except:
            time_slot = "midday"

    if not time_slot:
        time_slot = "midday"

    booking = {
        "distance": float(data.get("distance", 0)),
        "eta": int(data.get("eta", 0)),
        "bike": bike,
        "time_slot": time_slot,
        "booking_id": f"RW{int(datetime.now().timestamp())}",
        "status": "confirmed",
        "username": session.get("username"),
        "created_at": datetime.now().isoformat()
    }

    bookings = load_bookings()
    bookings.append(booking)
    save_bookings(bookings)

    return jsonify({"status": "success", "booking_id": booking["booking_id"]})

# -------------------- CANCEL BOOKING --------------------
@app.route("/cancel-booking", methods=["POST"])
def cancel_booking():
    data = request.get_json(silent=True)
    booking_id = data.get("booking_id")

    bookings = load_bookings()
    for b in bookings:
        if b.get("booking_id") == booking_id:
            b["status"] = "cancelled"
            save_bookings(bookings)
            return jsonify({"status": "cancelled"})

    return jsonify({"status": "failed"}), 404

# -------------------- DATA FOR OVERALL RIDE ANALYTICS --------------------
@app.route("/get_rides", methods=["GET"])
def get_rides():
    bookings = load_bookings()

    return jsonify([
        [
            b.get("distance", 0),
            b.get("eta", 0),
            b.get("bike", "").lower(),
            b.get("time_slot", "Midday").capitalize()
        ]
        for b in bookings
        if b.get("status") != "cancelled"
    ])

# -------------------- CHATBOT --------------------
@app.route("/chatbot")
def chatbot():
    if "username" not in session:
        return redirect(url_for("login"))
    return render_template("chatbot.html", username=session["username"])

@app.route("/chatbot/api", methods=["POST"])
def chatbot_api():
    if "username" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    user_message = request.json.get("message", "").strip()
    if not user_message:
        return jsonify({"reply": "Please enter a message."})

    prompt = f"""
You are RideWise AI, an assistant for a bike rental demand prediction system.
Explain answers clearly, practically, and with detailed insights.

User question:
{user_message}
"""

    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return jsonify({"reply": response.text})
    except Exception as e:
        return jsonify({"reply": f"AI service unavailable: {str(e)}"}), 500
    

print("🔥 THIS APP.PY IS RUNNING 🔥")
@app.route("/upload")
def upload():
    if "username" not in session:
        return redirect(url_for("login"))
    return render_template("upload.html", username=session.get("username"))

@app.route("/extract-features", methods=["POST"])
def extract_features():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    text = file.read().decode("utf-8")

    prompt = f"""
Extract bike rental prediction features from the text below.
Infer missing values reasonably if needed.

TEXT:
{text}
"""

    try:
        response = gemini_client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_json_schema": BikeFeatures.model_json_schema(),
            },
        )

        # ✅ SAFE, VALIDATED, TYPE-CHECKED
        features = BikeFeatures.model_validate_json(response.text)

        return jsonify({
            "features": features.dict()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------- DASHBOARD PAGE --------------------
@app.route("/dashboard")
def dashboard():
    if "username" not in session:
        return redirect(url_for("login"))
    return render_template("dashboard.html", username=session["username"])

# -------------------- DASHBOARD DATA FOR CHARTS --------------------
@app.route("/dashboard_data")
def dashboard_data():
    username = session.get("username")
    if not username:
        return jsonify({"error": "User not logged in"}), 401

    bookings = load_bookings()

    user_rides = [b for b in bookings if b.get("username") == username]

    total = len(user_rides)
    completed = sum(1 for r in user_rides if r.get("status") == "confirmed")
    cancelled = sum(1 for r in user_rides if r.get("status") == "cancelled")

    rides_per_day = [0, 0, 0, 0, 0, 0, 0]
    for r in user_rides:
        created_at = r.get("created_at")
        if created_at:
            try:
                dt = datetime.fromisoformat(created_at)
                day_idx = dt.weekday()
                rides_per_day[day_idx] += 1
            except:
                continue

    if len(rides_per_day) != 7:
        rides_per_day = [0,0,0,0,0,0,0]

    return jsonify({
        "total": total,
        "completed": completed,
        "cancelled": cancelled,
        "rides_per_day": rides_per_day
    })

# -------------------- REVIEWS API --------------------
@app.route("/review", methods=["GET", "POST"])
def review():
    if "username" not in session:
        return redirect(url_for("login"))

    REVIEWS_FILE = "reviews.json"

    if request.method == "POST":
        rating = request.form.get("rating")
        comment = request.form.get("comment")

        if not rating or not comment:
            flash("Please fill all fields", "error")
            return redirect(url_for("review"))

        if os.path.exists(REVIEWS_FILE):
            with open(REVIEWS_FILE, "r", encoding="utf-8") as f:
                reviews = json.load(f)
        else:
            reviews = []

        reviews.append({
            "username": session["username"],
            "rating": int(rating),
            "comment": comment
        })

        with open(REVIEWS_FILE, "w", encoding="utf-8") as f:
            json.dump(reviews, f, indent=4)

        flash("Review submitted successfully!", "success")
        return redirect(url_for("review"))

    return render_template("review.html", username=session["username"])

# -------------------- RUN --------------------
if __name__ == "__main__":
    app.run(debug=True)
