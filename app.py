
import flask
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
from datetime import datetime

app = Flask(__name__)
CORS(app)  # This allows the React app to talk to your local PC

# --- MODEL LOADING ---
# Load your specific XGBoost models
try:
    # Day model
    model_daily = pickle.load(open('xgboost_model_df_ansh_26.12.25.pkl', 'rb'))
    # Hour model (assumed name based on your day model)
    model_hourly = pickle.load(open('xgboost_model_df_hour_ansh_26.12.25.pkl', 'rb'))
    print("✅ Models loaded successfully from your .pkl files!")
except Exception as e:
    print(f"❌ Error loading models: {e}")
    print("Ensure the .pkl files are in the same folder as this script.")

def prepare_features(data, is_hourly=False):
    """
    This function converts the dashboard inputs into the 
    format your XGBoost model expects.
    """
    dt = datetime.strptime(data['date'], '%Y-%m-%d')
    
    # Common features
    features = {
        'season': int(data['season']),
        'yr': 1 if dt.year == 2012 else 0,
        'mnth': dt.month,
        'holiday': 0,
        'weekday': dt.weekday(),
        'workingday': 0 if data['isWeekend'] else 1,
        'weathersit': int(data['weatherSituation']),
        'temp': float(data['temperature']),
        'atemp': float(data['temperature']), # dashboard uses normalized temp
        'hum': float(data['humidity']),
        'windspeed': float(data['windspeed'])
    }

    if is_hourly:
        features['hr'] = int(data.get('hour', 12))
    
    # Convert to DataFrame
    return pd.DataFrame([features])

@app.route('/predict/daily', methods=['POST'])
def predict_daily():
    try:
        inputs = request.json
        df = prepare_features(inputs, is_hourly=False)
        # prediction = model_daily.predict(df)[0]
        prediction = 4250.5 # Placeholder - Replace with model_daily.predict(df)[0]
        
        return jsonify({
            'count': float(prediction),
            'model': 'xgboost_daily_ansh_26.12.25'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/predict/hourly', methods=['POST'])
def predict_hourly():
    try:
        inputs = request.json
        df = prepare_features(inputs, is_hourly=True)
        # prediction = model_hourly.predict(df)[0]
        prediction = 315.2 # Placeholder - Replace with model_hourly.predict(df)[0]
        
        return jsonify({
            'count': float(prediction),
            'model': 'xgboost_hour_ansh_26.12.25'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/', methods=['GET'])
def health():
    return "API is running!"

if __name__ == '__main__':
    print("Starting Flask API on http://localhost:5000")
    app.run(debug=True, port=5000)
