from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
import sqlite3
from datetime import datetime
import os
import traceback
from dotenv import load_dotenv
import google.generativeai as genai
import json
import re
import PyPDF2
import io
import hashlib
import os

app = Flask(__name__)

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    chat_model = genai.GenerativeModel("gemini-1.5-flash")
    print("✅ Gemini AI configured")
else:
    chat_model = None
    print("⚠️ Gemini API key not found - using fallback logic")

# CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept"]
    }
})

print("="*80)
print("🚴 BIKERENTAL AI - BACKEND SERVER")
print("="*80)

# ============================================================================
# LOAD ML MODELS
# ============================================================================
# ============================================================================
# LOAD ML MODELS
# ============================================================================
# ============================================================================
# LOAD ML MODELS
# ============================================================================

# ================= DAY MODEL =================
try:
    model_path = os.path.join('models', 'xgb_day_model.pkl')

    print(f"Loading day model from: {model_path}")
    with open(model_path, 'rb') as f:
        loaded_data = pickle.load(f)

    if isinstance(loaded_data, dict):
        day_model = loaded_data.get('model')
        day_features = loaded_data.get('feature_names')
    else:
        day_model = loaded_data
        day_features = None

    # ✅ SAFE: Wrap in try-catch to prevent crashes
    try:
        if hasattr(day_model, 'get_xgb_params'):
            params = day_model.get_xgb_params()
            # Remove GPU params if they exist
            for key in ['gpu_id', 'tree_method', 'predictor']:
                params.pop(key, None)
            # Set CPU params
            params['tree_method'] = 'hist'
            params['predictor'] = 'cpu_predictor'
            day_model.set_params(**params)
    except Exception:
        pass  # Silently ignore - model will work anyway

    # Extract feature names
    if hasattr(day_model, "feature_names_in_"):
        day_features = list(day_model.feature_names_in_)
    elif not day_features:
        day_features = [
            'season', 'yr', 'mnth', 'holiday', 'weekday',
            'workingday', 'weathersit', 'temp', 'atemp', 'hum', 'windspeed'
        ]

    print("✅ Day model loaded successfully!")
    print(f"📊 Day Features: {day_features}")

except Exception as e:
    print(f"❌ Error loading day model: {e}")
    traceback.print_exc()
    day_model = None
    day_features = None


# ================= HOUR MODEL =================
try:
    model_path = os.path.join('models', 'xgb_hour_model.pkl')

    print(f"Loading hour model from: {model_path}")
    with open(model_path, 'rb') as f:
        loaded_data = pickle.load(f)

    if isinstance(loaded_data, dict):
        hour_model = loaded_data.get('model')
        hour_features = loaded_data.get('feature_names')
    else:
        hour_model = loaded_data
        hour_features = None

    # ✅ SAFE: Wrap in try-catch to prevent crashes
    try:
        if hasattr(hour_model, 'get_xgb_params'):
            params = hour_model.get_xgb_params()
            # Remove GPU params if they exist
            for key in ['gpu_id', 'tree_method', 'predictor']:
                params.pop(key, None)
            # Set CPU params
            params['tree_method'] = 'hist'
            params['predictor'] = 'cpu_predictor'
            hour_model.set_params(**params)
    except Exception:
        pass  # Silently ignore - model will work anyway

    # Extract feature names
    if hasattr(hour_model, "feature_names_in_"):
        hour_features = list(hour_model.feature_names_in_)
    elif not hour_features:
        hour_features = [
            'season', 'yr', 'mnth', 'hr', 'holiday', 'weekday',
            'workingday', 'weathersit', 'temp', 'atemp', 'hum', 'windspeed'
        ]

    print("✅ Hour model loaded successfully!")
    print(f"📊 Hour Features: {hour_features}")

except Exception as e:
    print(f"❌ Error loading hour model: {e}")
    traceback.print_exc()
    hour_model = None
    hour_features = None


# ============================================================================
# DATABASE SETUP
# ============================================================================


def init_db():
    """Initialize SQLite database with user-specific tables"""
    conn = sqlite3.connect('bikerental.db')
    cursor = conn.cursor()

    # Predictions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT,
            prediction_type TEXT NOT NULL,
            input_data TEXT NOT NULL,
            prediction_value INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Bookings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            city TEXT NOT NULL,
            bike_type TEXT NOT NULL,
            duration INTEGER NOT NULL,
            date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            total_price INTEGER NOT NULL,
            status TEXT DEFAULT 'confirmed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # PDF uploads table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pdf_uploads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            file_hash TEXT NOT NULL,
            filename TEXT,
            extracted_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_email, file_hash)
        )
    ''')

    # Indexes
    cursor.execute(
        'CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_email)')
    cursor.execute(
        'CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_email)')
    cursor.execute(
        'CREATE INDEX IF NOT EXISTS idx_pdf_hash ON pdf_uploads(file_hash)')

    conn.commit()
    conn.close()
    print("✅ Database initialized!")


init_db()


def get_db():
    """Get database connection"""
    conn = sqlite3.connect('bikerental.db')
    conn.row_factory = sqlite3.Row
    return conn


def get_file_hash(file_content):
    """Generate unique hash for file content"""
    return hashlib.md5(file_content).hexdigest()

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================


def calculate_features_from_frontend(data, prediction_type='day'):
    """Calculate features from frontend data"""
    try:
        date_str = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')

        year = date_obj.year
        month = date_obj.month
        weekday = date_obj.weekday()

        season_map = {
            'spring': 1, 'summer': 2, 'fall': 3, 'autumn': 3, 'winter': 4
        }
        season = season_map.get(data.get('season', 'summer').lower(), 2)

        weather_map = {
            'clear': 1, 'cloudy': 2, 'mist': 2, 'rainy': 3,
            'light_rain': 3, 'heavy_rain': 4, 'storm': 4
        }
        weathersit = weather_map.get(data.get('weather', 'clear').lower(), 1)

        temp_celsius = float(data.get('temperature', 20))
        temp = (temp_celsius + 10) / 50

        humidity = float(data.get('humidity', 50))
        hum = humidity / 100

        wind_speed = float(data.get('windSpeed', 10))
        windspeed = wind_speed / 67

        atemp = temp - (windspeed * 0.05)
        yr = 1 if year >= 2012 else 0
        holiday = 1 if data.get('isHoliday', False) else 0
        workingday = 1 if (weekday not in [5, 6] and not holiday) else 0

        features = {
            'season': season,
            'yr': yr,
            'mnth': month,
            'holiday': holiday,
            'weekday': weekday,
            'workingday': workingday,
            'weathersit': weathersit,
            'temp': temp,
            'atemp': atemp,
            'hum': hum,
            'windspeed': windspeed
        }

        if prediction_type == 'hour':
            hour = int(data.get('hour', 12))
            features['hr'] = hour

        return features

    except Exception as e:
        print(f"Error calculating features: {e}")
        traceback.print_exc()
        return None


def parse_pdf_for_prediction(text):
    """Extract prediction-related data from PDF text"""
    try:
        text_lower = text.lower()

        # Initialize with defaults
        extracted_data = {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'hour': 12,
            'temperature': 25,
            'humidity': 60,
            'windSpeed': 15,
            'season': 'summer',
            'weather': 'clear',
            'isHoliday': False,
            'confidence': 'low',
            'extracted_fields': []
        }

        confidence_score = 0

        # Temperature extraction
        temp_patterns = [
            r'temperature[:\s]*(\d+\.?\d*)\s*[°cC]',
            r'temp[:\s]*(\d+\.?\d*)\s*[°cC]',
            r'(\d+\.?\d*)\s*[°cC]',
            r'(\d+\.?\d*)\s*celsius',
        ]

        for pattern in temp_patterns:
            match = re.search(pattern, text_lower)
            if match:
                temp = float(match.group(1))
                if -10 <= temp <= 50:
                    extracted_data['temperature'] = int(temp)
                    extracted_data['extracted_fields'].append('temperature')
                    confidence_score += 1
                    break

        # Humidity extraction
        humidity_patterns = [
            r'humidity[:\s]*(\d+\.?\d*)\s*%',
            r'relative\s*humidity[:\s]*(\d+)',
            r'rh[:\s]*(\d+)\s*%',
        ]

        for pattern in humidity_patterns:
            match = re.search(pattern, text_lower)
            if match:
                hum = float(match.group(1))
                if 0 <= hum <= 100:
                    extracted_data['humidity'] = int(hum)
                    extracted_data['extracted_fields'].append('humidity')
                    confidence_score += 1
                    break

        # Wind speed extraction
        wind_patterns = [
            r'wind\s*speed[:\s]*(\d+\.?\d*)\s*(?:km/h|kmph|kph)',
            r'wind[:\s]*(\d+\.?\d*)\s*(?:km/h|kmph|kph)',
        ]

        for pattern in wind_patterns:
            match = re.search(pattern, text_lower)
            if match:
                wind = float(match.group(1))
                if 0 <= wind <= 200:
                    extracted_data['windSpeed'] = int(wind)
                    extracted_data['extracted_fields'].append('windSpeed')
                    confidence_score += 1
                    break

        # Date extraction
        date_match = re.search(r'date[:\s]*(\d{4}-\d{2}-\d{2})', text_lower)
        if date_match:
            extracted_data['date'] = date_match.group(1)
            extracted_data['extracted_fields'].append('date')
            confidence_score += 1

        # Hour extraction
        hour_match = re.search(r'hour[:\s]*(\d{1,2})', text_lower)
        if hour_match:
            hour = int(hour_match.group(1))
            if 0 <= hour <= 23:
                extracted_data['hour'] = hour
                extracted_data['extracted_fields'].append('hour')
                confidence_score += 1

        # Season detection
        season_keywords = {
            'spring': ['spring', 'march', 'april', 'may'],
            'summer': ['summer', 'june', 'july', 'august'],
            'fall': ['fall', 'autumn', 'september', 'october', 'november'],
            'winter': ['winter', 'december', 'january', 'february']
        }

        for season, keywords in season_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                extracted_data['season'] = season
                extracted_data['extracted_fields'].append('season')
                confidence_score += 0.5
                break

        # Weather conditions
        weather_keywords = {
            'clear': ['clear', 'sunny', 'bright'],
            'cloudy': ['cloudy', 'overcast', 'clouds'],
            'rainy': ['rain', 'rainy', 'drizzle'],
            'heavy_rain': ['heavy rain', 'thunderstorm', 'storm']
        }

        for weather, keywords in weather_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                extracted_data['weather'] = weather
                extracted_data['extracted_fields'].append('weather')
                confidence_score += 1
                break

        # Holiday detection
        if any(keyword in text_lower for keyword in ['holiday', 'festival']):
            extracted_data['isHoliday'] = True
            extracted_data['extracted_fields'].append('holiday')
            confidence_score += 0.5

        # Confidence scoring
        if confidence_score >= 5:
            extracted_data['confidence'] = 'high'
        elif confidence_score >= 3:
            extracted_data['confidence'] = 'medium'
        else:
            extracted_data['confidence'] = 'low'

        return extracted_data

    except Exception as e:
        print(f"❌ PDF parsing error: {e}")
        traceback.print_exc()
        return {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'hour': 12,
            'temperature': 25,
            'humidity': 60,
            'windSpeed': 15,
            'season': 'summer',
            'weather': 'clear',
            'isHoliday': False,
            'confidence': 'low',
            'extracted_fields': []
        }

# ============================================================================
# PREDICTION ROUTES
# ============================================================================


@app.route('/api/predict/day', methods=['POST', 'OPTIONS'])
def predict_day():
    """Predict daily bike rentals"""
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.json
        print(f"\n📥 Received day prediction request: {data}")

        if not day_model:
            return jsonify({
                'success': False,
                'error': 'Day model not loaded'
            }), 500

        features = calculate_features_from_frontend(data, 'day')
        if features is None:
            return jsonify({
                'success': False,
                'error': 'Could not calculate features'
            }), 400

        feature_values = [features.get(f, 0) for f in day_features]
        df = pd.DataFrame([feature_values], columns=day_features)

        prediction = day_model.predict(df)[0]
        prediction = max(0, int(prediction))

        # Save to database
        try:
            user_email = data.get('user_email', 'anonymous')
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO predictions (user_email, prediction_type, input_data, prediction_value) VALUES (?, ?, ?, ?)',
                (user_email, 'day', str(data), prediction)
            )
            conn.commit()
            conn.close()
        except Exception as db_error:
            print(f"⚠️ Database error: {db_error}")

        return jsonify({
            'success': True,
            'prediction': prediction,
            'type': 'day'
        })

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/predict/hour', methods=['POST', 'OPTIONS'])
def predict_hour():
    """Predict hourly bike rentals"""
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.json
        print(f"\n📥 Received hour prediction request: {data}")

        if not hour_model:
            return jsonify({
                'success': False,
                'error': 'Hour model not loaded'
            }), 500

        features = calculate_features_from_frontend(data, 'hour')
        if features is None:
            return jsonify({
                'success': False,
                'error': 'Could not calculate features'
            }), 400

        feature_values = [features.get(f, 0) for f in hour_features]
        df = pd.DataFrame([feature_values], columns=hour_features)

        prediction = hour_model.predict(df)[0]
        prediction = max(0, int(prediction))

        # Save to database
        try:
            user_email = data.get('user_email', 'anonymous')
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO predictions (user_email, prediction_type, input_data, prediction_value) VALUES (?, ?, ?, ?)',
                (user_email, 'hour', str(data), prediction)
            )
            conn.commit()
            conn.close()
        except Exception as db_error:
            print(f"⚠️ Database error: {db_error}")

        return jsonify({
            'success': True,
            'prediction': prediction,
            'type': 'hour'
        })

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 400

# ============================================================================
# PDF UPLOAD ENDPOINT
# ============================================================================


@app.route("/api/upload-pdf", methods=["POST", "OPTIONS"])
def upload_pdf():
    if request.method == 'OPTIONS':
        return '', 204

    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '' or not file.filename.endswith('.pdf'):
            return jsonify({'success': False, 'error': 'Invalid file'}), 400

        print(f"\n📄 Processing PDF: {file.filename}")

        # Read file content
        file_content = file.read()
        file_hash = get_file_hash(file_content)
        user_email = request.form.get('user_email', 'anonymous')

        # Check for duplicate
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute(
                'SELECT id, created_at FROM pdf_uploads WHERE user_email = ? AND file_hash = ?',
                (user_email, file_hash)
            )
            existing = cursor.fetchone()

            if existing:
                conn.close()
                return jsonify({
                    'success': False,
                    'duplicate': True,
                    'message': f'This PDF was already uploaded on {existing[1]}'
                }), 409
        except Exception:
            conn = get_db()

        # Process PDF
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text_content = ""
        for page in pdf_reader.pages:
            text_content += page.extract_text() + "\n"

        extracted_data = parse_pdf_for_prediction(text_content)

        # Save to database
        try:
            cursor.execute(
                'INSERT INTO pdf_uploads (user_email, file_hash, filename, extracted_data) VALUES (?, ?, ?, ?)',
                (user_email, file_hash, file.filename, str(extracted_data))
            )
            conn.commit()
            conn.close()
        except Exception as db_error:
            print(f"⚠️ Database save error: {db_error}")

        return jsonify({
            'success': True,
            'extracted_data': extracted_data,
            'metadata': {
                'filename': file.filename,
                'confidence': extracted_data['confidence'],
                'extracted_fields': extracted_data['extracted_fields'],
                'page_count': len(pdf_reader.pages)
            }
        })

    except Exception as e:
        print(f"❌ Error: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# CHAT ENDPOINT
# ============================================================================


@app.route("/api/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.get_json()
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"reply": "Please type a message."})

        user_lower = user_message.lower()

        # Simple greetings
        if any(word in user_lower for word in ['hello', 'hi', 'hey']):
            return jsonify({
                "reply": "👋 Hi! I can help you book bikes.\n\nTry:\n'book scooter in mumbai for 2 hours'"
            })

        # Prices
        if any(word in user_lower for word in ['price', 'cost', 'rate']):
            return jsonify({
                "reply": "💰 **Bike Prices:**\n\n1️⃣ Scooter – ₹200/hr\n2️⃣ Sports Bike – ₹500/hr\n3️⃣ Cruiser – ₹700/hr"
            })

        # Booking logic
        city_match = re.search(
            r'\b(mumbai|delhi|bangalore|hyderabad|pune)\b', user_lower)
        bike_match = re.search(
            r'\b(scooter|sports? bike|cruiser)\b', user_lower)
        duration_match = re.search(r'(\d+)\s*(?:hour|hr|h\b)', user_lower)

        if city_match and bike_match and duration_match:
            city = city_match.group(1).title()
            bike_raw = bike_match.group(1).lower()
            bike_type = 'Sports Bike' if 'sport' in bike_raw else 'Scooter' if 'scooter' in bike_raw else 'Cruiser'
            duration = int(duration_match.group(1))

            price_map = {"Scooter": 200, "Sports Bike": 500, "Cruiser": 700}
            total = price_map[bike_type] * duration

            # Save booking
            try:
                user_email = data.get('user_email', 'anonymous')
                conn = get_db()
                cursor = conn.cursor()
                cursor.execute(
                    'INSERT INTO bookings (user_email, city, bike_type, duration, date, start_time, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    (user_email, city, bike_type, duration, datetime.now().strftime('%Y-%m-%d'),
                     datetime.now().strftime('%H:%M'), total, 'confirmed')
                )
                conn.commit()
                booking_id = cursor.lastrowid
                conn.close()
            except Exception as db_error:
                print(f"❌ Database error: {db_error}")
                booking_id = None

            return jsonify({
                "reply": f"✅ Booking Confirmed!\n\n🚴 {bike_type}\n📍 {city}\n⏱️ {duration}h\n💰 ₹{total}",
                "action": "BOOK",
                "booking": {
                    "id": booking_id or int(datetime.now().timestamp() * 1000),
                    "city": city,
                    "bikeType": bike_type,
                    "duration": duration,
                    "date": datetime.now().strftime('%Y-%m-%d'),
                    "startTime": datetime.now().strftime('%H:%M'),
                    "totalPrice": total
                }
            })

        # Gemini fallback
        if chat_model:
            try:
                prompt = f"""You are a helpful assistant for BikeRental AI.
                User question: {user_message}
                Provide a helpful, concise answer (2-3 sentences)."""

                response = chat_model.generate_content(prompt)
                return jsonify({"reply": response.text.strip()})
            except Exception as e:
                print(f"⚠️ Gemini error: {e}")

        return jsonify({
            "reply": "I can help you:\n\n🚴 Book bikes\n💰 Check prices\n\nWhat would you like?"
        })

    except Exception as e:
        print(f"❌ Error: {e}")
        traceback.print_exc()
        return jsonify({"reply": "Sorry, something went wrong."})

# ============================================================================
# BOOKINGS ENDPOINTS
# ============================================================================


@app.route("/api/bookings", methods=["GET", "POST", "OPTIONS"])
def bookings():
    if request.method == 'OPTIONS':
        return '', 204

    if request.method == 'GET':
        user_email = request.args.get('user_email')
        if not user_email:
            return jsonify({'success': False, 'error': 'User email required'}), 400

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            'SELECT * FROM bookings WHERE user_email = ? ORDER BY created_at DESC',
            (user_email,)
        )
        rows = cursor.fetchall()
        conn.close()

        bookings_list = [{
            'id': row[0],
            'city': row[2],
            'bike': row[3],
            'bikeType': row[3],
            'duration': row[4],
            'date': row[5],
            'startTime': row[6],
            'totalPrice': row[7],
            'status': row[8],
            'createdAt': row[9],
            'station': f"{row[2]} Station"
        } for row in rows]

        return jsonify({'success': True, 'bookings': bookings_list})

    # POST
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO bookings (user_email, city, bike_type, duration, date, start_time, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (data['user_email'], data['city'], data['bike_type'], data['duration'],
         data['date'], data['start_time'], data['total_price'], data.get('status', 'confirmed'))
    )
    conn.commit()
    booking_id = cursor.lastrowid
    conn.close()

    return jsonify({'success': True, 'booking_id': booking_id})


@app.route("/api/bookings/<int:booking_id>", methods=["DELETE", "OPTIONS"])
def delete_booking(booking_id):
    if request.method == 'OPTIONS':
        return '', 204

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM bookings WHERE id = ?', (booking_id,))
    conn.commit()

    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'success': False, 'error': 'Booking not found'}), 404

    conn.close()
    return jsonify({'success': True})


@app.route("/api/predictions", methods=["GET", "OPTIONS"])
def get_predictions():
    if request.method == 'OPTIONS':
        return '', 204

    user_email = request.args.get('user_email')
    if not user_email:
        return jsonify({'success': False, 'error': 'User email required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT * FROM predictions WHERE user_email = ? ORDER BY created_at DESC LIMIT 100',
        (user_email,)
    )
    rows = cursor.fetchall()
    conn.close()

    predictions = [{
        'id': row[0],
        'type': row[2],
        'value': row[4],
        'date': row[5],
        'input': eval(row[3]) if row[3] else {}
    } for row in rows]

    return jsonify({'success': True, 'predictions': predictions})

# ============================================================================
# HEALTH & ROOT
# ============================================================================


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'models': {
            'day_model': day_model is not None,
            'hour_model': hour_model is not None
        }
    })


@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'message': '🚴 BikeRental AI Backend',
        'version': '3.0',
        'status': 'running'
    })

# ============================================================================
# RUN SERVER
# ============================================================================


if __name__ == '__main__':
    print("="*80)
    print("🚀 SERVER STARTING...")
    print("="*80)
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
