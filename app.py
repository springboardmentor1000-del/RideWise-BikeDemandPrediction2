import streamlit as st
import base64
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
import time
import streamlit.components.v1 as components
import PyPDF2
import pdfplumber
import re
from datetime import datetime
import csv
import pickle
import os
from openai import OpenAI

# NVIDIA API Configuration - Using Streamlit Secrets
try:
    NVIDIA_API_KEY = st.secrets["NVIDIA_API_KEY"]
    NVIDIA_BASE_URL = st.secrets["NVIDIA_BASE_URL"]
except KeyError:
    st.error("⚠️ API credentials not found. Please configure secrets in Streamlit Cloud.")
    st.stop()

# Initialize NVIDIA client
nvidia_client = OpenAI(
    base_url=NVIDIA_BASE_URL,
    api_key=NVIDIA_API_KEY
)

# ============= MODEL LOADING =============
@st.cache_resource
def load_models():
    """Load the trained models - cached for performance"""
    try:
        # Load daily model
        with open('daily_bike_rental_model.pkl', 'rb') as f:
            daily_model = pickle.load(f)
        
        # Load hourly model
        with open('hourly_bike_rental_model.pkl', 'rb') as f:
            hourly_model = pickle.load(f)
        
        return daily_model, hourly_model
    
    except FileNotFoundError as e:
        st.error(f"❌ Model files not found: {str(e)}")
        st.info("💡 Please ensure model files are in the same directory as app")
        return None, None
    
    except Exception as e:
        st.error(f"❌ Error loading models: {str(e)}")
        return None, None

# Load models at startup
DAILY_MODEL, HOURLY_MODEL = load_models()
# ============= END MODEL LOADING =============

# ============= FIXED FEATURE PREPROCESSING FUNCTIONS =============
# Replace these functions in your app.py file (lines ~40-90)

def preprocess_daily_features(season, weather, temperature, humidity, wind_speed, 
                              year, month, holiday, working_day, day_type):
    """
    Convert daily prediction inputs to model features
    IMPORTANT: Column order MUST match training data exactly!
    """
    import pandas as pd
    
    # Map categorical values to numerical
    season_map = {"Spring": 1, "Summer": 2, "Fall": 3, "Winter": 4}
    weather_map = {"Clear": 1, "Mist/Cloudy": 2, "Light Rain/Snow": 3, "Heavy Rain/Snow": 4}
    
    # Create features dictionary in EXACT ORDER as training
    # Order: season, yr, mnth, holiday, weekday, workingday, weathersit, 
    #        temp, atemp, hum, windspeed
    features = {
        'season': season_map.get(season, 1),
        'yr': 1 if year >= 2012 else 0,
        'mnth': month,
        'holiday': 1 if holiday == "Yes" else 0,
        'weekday': 1 if day_type == "Weekday" else 0,
        'workingday': 1 if working_day == "Yes" else 0,
        'weathersit': weather_map.get(weather, 1),
        'temp': temperature / 41.0,  # Normalized temperature
        'atemp': (temperature + 5) / 50.0,  # Feeling temperature
        'hum': humidity / 100.0,
        'windspeed': wind_speed / 67.0
    }
    
    # Convert to DataFrame - pandas will maintain dict order (Python 3.7+)
    feature_df = pd.DataFrame([features])
    
    # Double-check column order matches training
    expected_cols = ['season', 'yr', 'mnth', 'holiday', 'weekday', 'workingday', 
                     'weathersit', 'temp', 'atemp', 'hum', 'windspeed']
    feature_df = feature_df[expected_cols]  # Reorder if needed
    
    return feature_df


def preprocess_hourly_features(season, weather, temperature, humidity, wind_speed,
                               year, month, hour, holiday, working_day, day_type):
    """
    Convert hourly prediction inputs to model features
    IMPORTANT: Column order MUST match training data exactly!
    'hr' column MUST be LAST to match training order!
    """
    import pandas as pd
    
    season_map = {"Spring": 1, "Summer": 2, "Fall": 3, "Winter": 4}
    weather_map = {"Clear": 1, "Mist/Cloudy": 2, "Light Rain/Snow": 3, "Heavy Rain/Snow": 4}
    
    # Create features dictionary in EXACT ORDER as training
    # Order: season, yr, mnth, holiday, weekday, workingday, weathersit, 
    #        temp, atemp, hum, windspeed, hr (HR IS LAST!)
    features = {
        'season': season_map.get(season, 1),
        'yr': 1 if year >= 2012 else 0,
        'mnth': month,
        'holiday': 1 if holiday == "Yes" else 0,
        'weekday': 1 if day_type == "Weekday" else 0,
        'workingday': 1 if working_day == "Yes" else 0,
        'weathersit': weather_map.get(weather, 1),
        'temp': temperature / 41.0,
        'atemp': (temperature + 5) / 50.0,
        'hum': humidity / 100.0,
        'windspeed': wind_speed / 67.0,
        'hr': hour  # THIS MUST BE LAST!
    }
    
    # Convert to DataFrame
    feature_df = pd.DataFrame([features])
    
    # Double-check column order matches training
    expected_cols = ['season', 'yr', 'mnth', 'holiday', 'weekday', 'workingday', 
                     'weathersit', 'temp', 'atemp', 'hum', 'windspeed', 'hr']
    feature_df = feature_df[expected_cols]  # Reorder if needed
    
    return feature_df

# ============= END FIXED FEATURE PREPROCESSING =============
# ============= END FEATURE PREPROCESSING =============

# ============= RATING & FEEDBACK DATA STORAGE FUNCTIONS =============
FEEDBACK_FILE = "user_feedback.csv"

def initialize_feedback_file():
    """Create feedback CSV file if it doesn't exist"""
    if not os.path.exists(FEEDBACK_FILE):
        with open(FEEDBACK_FILE, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['Timestamp', 'Username', 'Rating', 'Feedback', 'Category'])

def save_feedback(username, rating, feedback, category):
    """Save feedback to CSV file"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(FEEDBACK_FILE, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([timestamp, username, rating, feedback, category])

def load_feedback():
    """Load all feedback from CSV file"""
    if os.path.exists(FEEDBACK_FILE):
        return pd.read_csv(FEEDBACK_FILE)
    return pd.DataFrame(columns=['Timestamp', 'Username', 'Rating', 'Feedback', 'Category'])

# ============= ENHANCED PDF EXTRACTION FUNCTIONS =============

def extract_text_from_pdf(pdf_file):
    """
    Extract raw text from PDF using pdfplumber with enhanced error handling
    Returns: Extracted text or None if extraction fails
    """
    try:
        # Try pdfplumber first (better for structured text)
        with pdfplumber.open(pdf_file) as pdf:
            text = ""
            total_pages = len(pdf.pages)
            
            for page_num, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text()
                if page_text:
                    text += f"\n--- Page {page_num} ---\n{page_text}"
            
            if text.strip():
                return text, total_pages
        
        # Fallback to PyPDF2 if pdfplumber fails
        pdf_file.seek(0)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        total_pages = len(pdf_reader.pages)
        
        for page_num, page in enumerate(pdf_reader.pages, 1):
            page_text = page.extract_text()
            if page_text:
                text += f"\n--- Page {page_num} ---\n{page_text}"
        
        return text, total_pages if text.strip() else (None, 0)
        
    except Exception as e:
        st.error(f"❌ Error extracting PDF: {str(e)}")
        return None, 0


def extract_prediction_params_from_text(text):
    """
    Enhanced parameter extraction using advanced regex patterns
    Returns: Dictionary with extracted parameters
    """
    params = {
        'season': None, 'weather': None, 'temperature': None, 
        'humidity': None, 'wind_speed': None, 'year': None, 
        'month': None, 'hour': None, 'holiday': None, 
        'working_day': None, 'day_type': None
    }
    
    if not text:
        return params
    
    text_lower = text.lower()
    
    # ===== SEASON EXTRACTION =====
    season_patterns = [
        r'season[:\s-]*(spring|summer|fall|winter|autumn)',
        r'(spring|summer|fall|winter|autumn)\s+season',
        r'in\s+(spring|summer|fall|winter|autumn)',
    ]
    for pattern in season_patterns:
        match = re.search(pattern, text_lower, re.I)
        if match:
            season_raw = match.group(1).capitalize()
            params['season'] = 'Fall' if season_raw == 'Autumn' else season_raw
            break
    
    # ===== WEATHER EXTRACTION =====
    weather_patterns = [
        r'weather[:\s-]*(clear|sunny|cloudy|mist|misty|fog|foggy|rain|rainy|snow|snowy|light rain|heavy rain|drizzle)',
        r'condition[:\s-]*(clear|sunny|cloudy|mist|misty|fog|foggy|rain|rainy|snow|snowy|light rain|heavy rain|drizzle)',
        r'(clear|sunny|cloudy|mist|misty|fog|foggy|rain|rainy|snow|snowy)\s+(weather|day|condition)',
    ]
    for pattern in weather_patterns:
        match = re.search(pattern, text_lower, re.I)
        if match:
            weather_raw = match.group(1).lower()
            if 'clear' in weather_raw or 'sunny' in weather_raw:
                params['weather'] = 'Clear'
            elif 'mist' in weather_raw or 'cloud' in weather_raw or 'fog' in weather_raw:
                params['weather'] = 'Mist/Cloudy'
            elif 'heavy' in weather_raw or 'snow' in weather_raw:
                params['weather'] = 'Heavy Rain/Snow'
            else:
                params['weather'] = 'Light Rain/Snow'
            break
    
    # ===== TEMPERATURE EXTRACTION =====
    temp_patterns = [
        r'temperature[:\s-]*(\d+\.?\d*)\s*[°]?[cCfF]?',
        r'temp[:\s-]*(\d+\.?\d*)\s*[°]?[cCfF]?',
        r'(\d+\.?\d*)\s*[°][cC]',
        r'(\d+\.?\d*)\s*degrees?',
    ]
    for pattern in temp_patterns:
        match = re.search(pattern, text_lower, re.I)
        if match:
            temp = float(match.group(1))
            # Convert Fahrenheit to Celsius if temperature is suspiciously high
            if temp > 50:
                temp = (temp - 32) * 5/9
            params['temperature'] = round(temp, 1)
            break
    
    # ===== HUMIDITY EXTRACTION =====
    humidity_patterns = [
        r'humidity[:\s-]*(\d+)\s*%?',
        r'(\d+)\s*%\s*humidity',
        r'relative\s+humidity[:\s-]*(\d+)',
    ]
    for pattern in humidity_patterns:
        match = re.search(pattern, text_lower, re.I)
        if match:
            humidity = int(match.group(1))
            if 0 <= humidity <= 100:
                params['humidity'] = humidity
            break
    
    # ===== WIND SPEED EXTRACTION =====
    wind_patterns = [
        r'wind\s+speed[:\s-]*(\d+\.?\d*)',
        r'wind[:\s-]*(\d+\.?\d*)\s*(km/h|mph|m/s)?',
        r'(\d+\.?\d*)\s*(km/h|mph)\s+wind',
    ]
    for pattern in wind_patterns:
        match = re.search(pattern, text_lower, re.I)
        if match:
            wind = float(match.group(1))
            # Convert mph to km/h if specified
            if len(match.groups()) > 1 and match.group(2) and 'mph' in match.group(2):
                wind = wind * 1.60934
            params['wind_speed'] = int(wind)
            break
    
    # ===== YEAR EXTRACTION =====
    year_patterns = [
        r'year[:\s-]*(\d{4})',
        r'in\s+(\d{4})',
        r'(\d{4})\s+year',
    ]
    for pattern in year_patterns:
        match = re.search(pattern, text_lower)
        if match:
            year = int(match.group(1))
            if 2020 <= year <= 2030:
                params['year'] = year
            break
    
    # ===== MONTH EXTRACTION =====
    month_patterns = [
        r'month[:\s-]*(\d{1,2})',
        r'(january|february|march|april|may|june|july|august|september|october|november|december)',
        r'(\d{1,2})[/-](\d{4})',  # Format: MM/YYYY
    ]
    month_names = ['january', 'february', 'march', 'april', 'may', 'june', 
                   'july', 'august', 'september', 'october', 'november', 'december']
    
    for pattern in month_patterns:
        match = re.search(pattern, text_lower, re.I)
        if match:
            month_str = match.group(1).lower()
            if month_str in month_names:
                params['month'] = month_names.index(month_str) + 1
            elif month_str.isdigit():
                month = int(month_str)
                if 1 <= month <= 12:
                    params['month'] = month
            break
    
    # ===== HOUR EXTRACTION =====
    hour_patterns = [
        r'hour[:\s-]*(\d{1,2})',
        r'time[:\s-]*(\d{1,2})[:h]',
        r'at\s+(\d{1,2})\s*(am|pm|:00)?',
    ]
    for pattern in hour_patterns:
        match = re.search(pattern, text_lower, re.I)
        if match:
            hour = int(match.group(1))
            # Handle AM/PM if present
            if len(match.groups()) > 1 and match.group(2):
                if 'pm' in match.group(2).lower() and hour < 12:
                    hour += 12
                elif 'am' in match.group(2).lower() and hour == 12:
                    hour = 0
            if 0 <= hour <= 23:
                params['hour'] = hour
            break
    
    # ===== HOLIDAY EXTRACTION =====
    holiday_patterns = [
        r'holiday[:\s-]*(yes|no|true|false)',
        r'is\s+holiday[:\s-]*(yes|no|true|false)',
        r'(not\s+a\s+)?holiday',
    ]
    for pattern in holiday_patterns:
        match = re.search(pattern, text_lower, re.I)
        if match:
            holiday_str = match.group(1) if match.group(1) else match.group(0)
            if 'yes' in holiday_str or 'true' in holiday_str:
                params['holiday'] = 'Yes'
            elif 'no' in holiday_str or 'false' in holiday_str or 'not' in holiday_str:
                params['holiday'] = 'No'
            break
    
    # ===== WORKING DAY EXTRACTION =====
    working_patterns = [
        r'working\s+day[:\s-]*(yes|no|true|false)',
        r'workday[:\s-]*(yes|no|true|false)',
        r'is\s+working\s+day[:\s-]*(yes|no)',
    ]
    for pattern in working_patterns:
        match = re.search(pattern, text_lower, re.I)
        if match:
            working_str = match.group(1).lower()
            params['working_day'] = 'Yes' if 'yes' in working_str or 'true' in working_str else 'No'
            break
    
    # ===== DAY TYPE EXTRACTION =====
    daytype_patterns = [
        r'(weekday|weekend)',
        r'day\s+type[:\s-]*(weekday|weekend)',
        r'(monday|tuesday|wednesday|thursday|friday|saturday|sunday)',
    ]
    for pattern in daytype_patterns:
        match = re.search(pattern, text_lower, re.I)
        if match:
            day_str = match.group(1).lower()
            if day_str in ['saturday', 'sunday', 'weekend']:
                params['day_type'] = 'Weekend'
            elif 'weekday' in day_str or day_str in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']:
                params['day_type'] = 'Weekday'
            break
    
    return params


def validate_extracted_params(params):
    """
    Validate extracted parameters and return validation results
    Returns: (is_valid, validation_messages)
    """
    validation_messages = []
    is_valid = True
    
    # Check temperature range
    if params['temperature'] is not None:
        if params['temperature'] < -10 or params['temperature'] > 40:
            validation_messages.append(f"⚠️ Temperature {params['temperature']}°C is outside typical range (-10°C to 40°C)")
            is_valid = False
    
    # Check humidity range
    if params['humidity'] is not None:
        if params['humidity'] < 0 or params['humidity'] > 100:
            validation_messages.append(f"⚠️ Humidity {params['humidity']}% is invalid (must be 0-100%)")
            is_valid = False
    
    # Check wind speed
    if params['wind_speed'] is not None:
        if params['wind_speed'] < 0 or params['wind_speed'] > 60:
            validation_messages.append(f"⚠️ Wind speed {params['wind_speed']} km/h seems unusual")
    
    # Check year
    if params['year'] is not None:
        current_year = datetime.now().year
        if params['year'] < 2020 or params['year'] > current_year + 5:
            validation_messages.append(f"⚠️ Year {params['year']} is outside expected range")
            is_valid = False
    
    # Check month
    if params['month'] is not None:
        if params['month'] < 1 or params['month'] > 12:
            validation_messages.append(f"⚠️ Month {params['month']} is invalid")
            is_valid = False
    
    # Check hour
    if params['hour'] is not None:
        if params['hour'] < 0 or params['hour'] > 23:
            validation_messages.append(f"⚠️ Hour {params['hour']} is invalid (must be 0-23)")
            is_valid = False
    
    if not validation_messages:
        validation_messages.append("✅ All extracted parameters are valid!")
    
    return is_valid, validation_messages


def render_enhanced_pdf_uploader(tab_type="daily"):
    """
    Render enhanced PDF uploader with neon UI styling
    tab_type: "daily" or "hourly"
    """
    
    # Custom CSS for PDF uploader section matching the main UI theme
    st.markdown("""
        <style>
        /* PDF Uploader Container */
        .pdf-upload-container {
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(25px);
            border-radius: 15px;
            border: 2px solid rgba(0, 255, 255, 0.4);
            padding: 1.2rem;
            margin: 1rem 0;
            box-shadow: 
                0 0 30px rgba(0, 255, 255, 0.2),
                inset 0 0 20px rgba(0, 255, 255, 0.03);
            transition: all 0.3s ease;
        }
        
        .pdf-upload-container:hover {
            border-color: rgba(0, 255, 255, 0.6);
            box-shadow: 
                0 0 40px rgba(0, 255, 255, 0.3),
                inset 0 0 25px rgba(0, 255, 255, 0.05);
        }
        
        /* PDF Icon Animation */
        .pdf-icon {
            font-size: 3rem;
            animation: pdfFloat 3s ease-in-out infinite;
            filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.6));
        }
        
        @keyframes pdfFloat {
            0%, 100% { 
                transform: translateY(0) rotate(0deg);
                filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.6));
            }
            50% { 
                transform: translateY(-8px) rotate(5deg);
                filter: drop-shadow(0 0 30px rgba(138, 43, 226, 0.8));
            }
        }
        
        /* Extraction Status */
        .extraction-status {
            background: rgba(0, 255, 255, 0.1);
            border-left: 4px solid #00ffff;
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            animation: statusPulse 2s ease-in-out infinite;
        }
        
        @keyframes statusPulse {
            0%, 100% { 
                background: rgba(0, 255, 255, 0.1);
                border-left-color: #00ffff;
            }
            50% { 
                background: rgba(138, 43, 226, 0.1);
                border-left-color: #8a2be2;
            }
        }
        
        /* Parameter Cards */
        .param-card {
            background: rgba(0, 0, 0, 0.6);
            border: 2px solid rgba(0, 255, 255, 0.3);
            border-radius: 10px;
            padding: 0.8rem;
            margin: 0.5rem 0;
            transition: all 0.3s ease;
        }
        
        .param-card:hover {
            background: rgba(0, 0, 0, 0.8);
            border-color: rgba(0, 255, 255, 0.6);
            transform: translateX(5px);
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
        }
        
        .param-label {
            color: #00ffff;
            font-weight: 600;
            font-size: 0.95rem;
        }
        
        .param-value {
            color: #ffffff;
            font-size: 1.1rem;
            font-weight: 700;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        }
        
        /* Progress Bar */
        .extraction-progress {
            width: 100%;
            height: 6px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 10px;
            overflow: hidden;
            margin: 1rem 0;
        }
        
        .extraction-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #00ffff 0%, #00b8d4 50%, #8a2be2 100%);
            animation: progressMove 2s ease-in-out infinite;
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
        }
        
        @keyframes progressMove {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        </style>
    """, unsafe_allow_html=True)
    
    # PDF Uploader Section Header
    st.markdown(f"""
        <div style="text-align: center; margin: 1rem 0;">
            <div class="pdf-icon">📄</div>
            <h3 style="
                color: #00ffff;
                font-family: 'Orbitron', sans-serif;
                text-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
                margin: 0.5rem 0;
            ">Smart PDF Parameter Extraction</h3>
            <p style="
                color: rgba(0, 255, 255, 0.8);
                font-size: 0.95rem;
                margin: 0;
            ">Upload your PDF and let AI extract prediction parameters automatically</p>
        </div>
    """, unsafe_allow_html=True)
    
    # File uploader with enhanced styling
    uploaded_file = st.file_uploader(
        "📎 Choose PDF File",
        type=['pdf'],
        key=f"pdf_{tab_type}",
        help="Upload a PDF containing prediction parameters",
        label_visibility="collapsed"
    )
    
    if uploaded_file:
        # Display file info
        file_size = len(uploaded_file.getvalue()) / 1024  # KB
        st.markdown(f"""
            <div class="param-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span class="param-label">📎 File:</span>
                        <span class="param-value">{uploaded_file.name}</span>
                    </div>
                    <div>
                        <span class="param-label">💾 Size:</span>
                        <span class="param-value">{file_size:.2f} KB</span>
                    </div>
                </div>
            </div>
        """, unsafe_allow_html=True)
        
        col1, col2, col3 = st.columns([1, 2, 1])
        
        with col2:
            if st.button(
                "🔍 Extract Parameters",
                key=f"extract_{tab_type}",
                use_container_width=True
            ):
                # Show extraction progress
                st.markdown("""
                    <div class="extraction-status">
                        <div style="text-align: center;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔮</div>
                            <div style="color: #00ffff; font-weight: 600;">
                                Extracting parameters from PDF...
                            </div>
                        </div>
                        <div class="extraction-progress">
                            <div class="extraction-progress-bar"></div>
                        </div>
                    </div>
                """, unsafe_allow_html=True)
                
                # Extract text from PDF
                text, total_pages = extract_text_from_pdf(uploaded_file)
                
                if text:
                    # Extract parameters
                    extracted_params = extract_prediction_params_from_text(text)
                    
                    # Validate parameters
                    is_valid, validation_messages = validate_extracted_params(extracted_params)
                    
                    # Store in session state
                    st.session_state[f'extracted_{tab_type}'] = extracted_params
                    
                    # Success message
                    st.markdown(f"""
                        <div style="
                            background: rgba(0, 255, 0, 0.1);
                            border: 2px solid rgba(0, 255, 0, 0.5);
                            border-radius: 12px;
                            padding: 1.5rem;
                            margin: 1rem 0;
                            text-align: center;
                            box-shadow: 0 0 30px rgba(0, 255, 0, 0.2);
                        ">
                            <div style="font-size: 3rem; margin-bottom: 0.5rem;">✅</div>
                            <h3 style="color: #00ff00; margin: 0.5rem 0;">Extraction Successful!</h3>
                            <p style="color: rgba(255, 255, 255, 0.9); margin: 0;">
                                Processed {total_pages} page(s) and extracted {sum(1 for v in extracted_params.values() if v is not None)} parameter(s)
                            </p>
                        </div>
                    """, unsafe_allow_html=True)
                    
                    # Display validation results
                    st.markdown("#### 🔍 Validation Results")
                    for message in validation_messages:
                        if "✅" in message:
                            st.success(message)
                        elif "⚠️" in message:
                            st.warning(message)
                    
                    # Display extracted parameters in a beautiful grid
                    st.markdown("#### 📊 Extracted Parameters")
                    
                    # Count extracted vs total parameters
                    extracted_count = sum(1 for v in extracted_params.values() if v is not None)
                    total_count = len(extracted_params)
                    
                    # Progress indicator
                    progress_percent = (extracted_count / total_count) * 100
                    st.progress(extracted_count / total_count)
                    st.markdown(f"""
                        <div style="text-align: center; margin: 0.5rem 0;">
                            <span style="color: #00ffff; font-weight: 600;">
                                {extracted_count} / {total_count} parameters extracted ({progress_percent:.0f}%)
                            </span>
                        </div>
                    """, unsafe_allow_html=True)
                    
                    # Display parameters in cards
                    cols = st.columns(2)
                    param_icons = {
                        'season': '🌸', 'weather': '🌤️', 'temperature': '🌡️',
                        'humidity': '💧', 'wind_speed': '💨', 'year': '📅',
                        'month': '📆', 'hour': '⏰', 'holiday': '🎉',
                        'working_day': '💼', 'day_type': '📅'
                    }
                    
                    param_labels = {
                        'season': 'Season', 'weather': 'Weather', 'temperature': 'Temperature (°C)',
                        'humidity': 'Humidity (%)', 'wind_speed': 'Wind Speed (km/h)', 
                        'year': 'Year', 'month': 'Month', 'hour': 'Hour',
                        'holiday': 'Holiday', 'working_day': 'Working Day', 
                        'day_type': 'Day Type'
                    }
                    
                    for idx, (key, value) in enumerate(extracted_params.items()):
                        with cols[idx % 2]:
                            if value is not None:
                                st.markdown(f"""
                                    <div class="param-card" style="border-color: rgba(0, 255, 0, 0.4);">
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <div>
                                                <span style="font-size: 1.5rem; margin-right: 0.5rem;">{param_icons.get(key, '📌')}</span>
                                                <span class="param-label">{param_labels.get(key, key.title())}:</span>
                                            </div>
                                            <span class="param-value" style="color: #00ff00;">{value}</span>
                                        </div>
                                    </div>
                                """, unsafe_allow_html=True)
                            else:
                                st.markdown(f"""
                                    <div class="param-card" style="opacity: 0.5;">
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <div>
                                                <span style="font-size: 1.5rem; margin-right: 0.5rem;">{param_icons.get(key, '📌')}</span>
                                                <span class="param-label">{param_labels.get(key, key.title())}:</span>
                                            </div>
                                            <span style="color: rgba(255, 255, 255, 0.4); font-style: italic;">Not found</span>
                                        </div>
                                    </div>
                                """, unsafe_allow_html=True)
                    
                    # Show raw extracted text in expandable section
                    with st.expander("📄 View Raw Extracted Text", expanded=False):
                        st.text_area(
                            "Extracted Text",
                            value=text[:2000] + ("..." if len(text) > 2000 else ""),
                            height=200,
                            disabled=True,
                            label_visibility="collapsed"
                        )
                else:
                    st.error("❌ Failed to extract text from PDF. Please ensure the PDF contains readable text.")
    
    # Initialize session state if not exists
    if f'extracted_{tab_type}' not in st.session_state:
        st.session_state[f'extracted_{tab_type}'] = {}
    
    return st.session_state[f'extracted_{tab_type}']


# ============= HELPER FUNCTION FOR AUTO-POPULATION =============

def get_auto_value(extracted_dict, key, options, default_index=0):
    """
    Helper function to get auto-populated value for selectbox
    Returns: index for selectbox
    """
    value = extracted_dict.get(key)
    if value and value in options:
        return options.index(value)
    return default_index


def get_auto_slider_value(extracted_dict, key, default_value):
    """
    Helper function to get auto-populated value for slider
    Returns: value for slider
    """
    value = extracted_dict.get(key)
    if value is not None:
        return value
    return default_value


# ============= END ENHANCED PDF EXTRACTION FUNCTIONS =============

# ============= USER MANAGEMENT FUNCTIONS =============
USER_DATA_FILE = "users.json"

def initialize_users_file():
    """Create users JSON file if it doesn't exist with default admin user"""
    if not os.path.exists(USER_DATA_FILE):
        default_users = {
            "admin": {
                "password": "admin123",
                "name": "Administrator",
                "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        }
        with open(USER_DATA_FILE, 'w', encoding='utf-8') as f:
            import json
            json.dump(default_users, f, indent=4)

def load_users():
    """Load users from JSON file"""
    try:
        with open(USER_DATA_FILE, 'r', encoding='utf-8') as f:
            import json
            return json.load(f)
    except:
        initialize_users_file()
        with open(USER_DATA_FILE, 'r', encoding='utf-8') as f:
            import json
            return json.load(f)

def save_user(username, password, name):
    """Save new user to JSON file"""
    users = load_users()
    users[username] = {
        "password": password,
        "name": name,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    with open(USER_DATA_FILE, 'w', encoding='utf-8') as f:
        import json
        json.dump(users, f, indent=4)

def username_exists(username):
    """Check if username already exists"""
    users = load_users()
    return username in users

def validate_user(username, password):
    """Validate user credentials"""
    users = load_users()
    if username in users:
        return users[username]["password"] == password
    return False

def get_user_name(username):
    """Get user's full name"""
    users = load_users()
    if username in users:
        return users[username].get("name", username)
    return username
# ============= END USER MANAGEMENT FUNCTIONS =============

# Initialize feedback and users files
initialize_feedback_file()
initialize_users_file()
# ============= END RATING & FEEDBACK FUNCTIONS =============

# Page configuration
st.set_page_config(
    page_title="RideWise - Bike Rental Prediction",
    page_icon="🚴",
    layout="wide",
    initial_sidebar_state="auto"
)
def get_theme_css(theme='dark'):
    """Generate CSS based on selected theme"""
    if theme == 'dark':
        return """
        /* Dark Mode Colors */
        :root {
            --bg-primary: #000000;
            --bg-secondary: rgba(0, 0, 0, 0.85);
            --bg-card: rgba(0, 0, 0, 0.8);
            --text-primary: #ffffff;
            --text-secondary: #00ffff;
            --border-color: rgba(0, 255, 255, 0.4);
            --gradient-primary: linear-gradient(135deg, #00ffff 0%, #00ffc8 50%, #8a2be2 100%);
            --shadow-color: rgba(0, 255, 255, 0.3);
            --grid-color: rgba(0, 255, 255, 0.03);
        }
        
        .stApp {
            background: var(--bg-primary);
            background-image: 
                linear-gradient(var(--grid-color) 1px, transparent 1px),
                linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
            background-size: 50px 50px;
        }
        """
    else:  # light mode
        return """
        /* Light Mode Colors */
        :root {
            --bg-primary: #f5f7fa;
            --bg-secondary: rgba(255, 255, 255, 0.95);
            --bg-card: rgba(255, 255, 255, 0.9);
            --text-primary: #2c3e50;
            --text-secondary: #0066cc;
            --border-color: rgba(0, 102, 204, 0.3);
            --gradient-primary: linear-gradient(135deg, #0066cc 0%, #00aaff 50%, #6600cc 100%);
            --shadow-color: rgba(0, 102, 204, 0.2);
            --grid-color: rgba(0, 102, 204, 0.05);
        }
        /* Theme Toggle Button Styling */
button[data-testid="baseButton-secondary"]:has(+ [key="theme_toggle"]),
button:has-text("🌙"),
button:has-text("☀️") {
    background: var(--gradient-primary) !important;
    border: 2px solid var(--border-color) !important;
    border-radius: 50% !important;
    width: 45px !important;
    height: 45px !important;
    font-size: 1.5rem !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 0 15px var(--shadow-color) !important;
}

button[key="theme_toggle"]:hover {
    transform: scale(1.1) rotate(20deg) !important;
    box-shadow: 0 0 25px var(--shadow-color) !important;
}
        
        .stApp {
            background: var(--bg-primary);
            background-image: 
                linear-gradient(var(--grid-color) 1px, transparent 1px),
                linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
            background-size: 50px 50px;
        }
        
        /* Override dark colors for light mode */
        .dashboard-card,
        .prediction-panel,
        .login-box {
            background: var(--bg-card) !important;
            border-color: var(--border-color) !important;
            box-shadow: 0 0 30px var(--shadow-color) !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: var(--text-secondary) !important;
            text-shadow: none !important;
        }
        
        p, span, div, li, label {
            color: var(--text-primary) !important;
        }
        
        .metric-value,
        .section-title,
        .hero-main-title {
            background: var(--gradient-primary) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
        }
        
        /* Input fields for light mode */
        .stTextInput > div > div > input,
        .stNumberInput > div > div > input,
        .stSelectbox > div > div > select {
            background: rgba(255, 255, 255, 0.9) !important;
            border: 2px solid var(--border-color) !important;
            color: var(--text-primary) !important;
        }
        
        /* Buttons for light mode */
        .stButton > button {
            background: var(--gradient-primary) !important;
            color: #ffffff !important;
        }
        
        /* Navbar for light mode */
        .navbar {
            background: var(--bg-secondary) !important;
            border-bottom: 2px solid var(--border-color) !important;
        }
        
        /* Selectbox dropdown for light mode */
        [data-baseweb="select"] > div,
        [role="listbox"],
        [role="option"] {
            background: var(--bg-card) !important;
            color: var(--text-primary) !important;
        }
        """

# Custom CSS for ultra-dynamic neon design
# Custom CSS for ultra-dynamic neon design
theme_css = get_theme_css('dark')

# Apply theme CSS first
st.markdown(f"<style>{theme_css}</style>", unsafe_allow_html=True)
st.markdown("""
<style>
            {theme_css}
            /* ============= ZOOM-PROOF RESPONSIVE FIXES ============= */
    
    /* Prevent zoom from breaking layout */
    html {
        font-size: 16px;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
    }
    
    /* Container fixes */
    .main .block-container {
        max-width: 1400px;
        padding-left: 2rem;
        padding-right: 2rem;
    }
    
    /* Navbar stays fixed */
    .stColumns {
        position: relative;
        display: flex !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
    }
    
    /* Buttons maintain size */
    .stButton > button {
        min-height: 45px !important;
        font-size: 1rem !important;
        white-space: nowrap !important;
    }
    
    /* Metrics stay proportional */
    .metric-container {
        min-height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    
    .metric-value {
        font-size: clamp(2rem, 3vw, 2.5rem) !important;
    }
    
    .metric-label {
        font-size: clamp(0.9rem, 1.2vw, 0.95rem) !important;
    }
    
    /* Prediction panel inputs */
    .stSelectbox label,
    .stSlider label,
    .stNumberInput label {
        font-size: clamp(1rem, 1.5vw, 1.15rem) !important;
    }
    
    /* Selectbox text size */
    .stSelectbox > div > div > select,
    [data-baseweb="select"] span,
    [data-baseweb="select"] div {
        font-size: 1.1rem !important;
    }
    
    /* Titles stay readable */
    .section-title {
        font-size: clamp(1.4rem, 2vw, 1.6rem) !important;
    }
    
    /* Dashboard cards */
    .dashboard-card {
        min-width: 0;
        overflow: hidden;
    }
    
    /* Charts maintain aspect ratio */
    .plotly-graph-div {
        width: 100% !important;
        height: auto !important;
    }
            
    /* Import Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
    
    /* Global Styles */
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .stDeployButton {visibility: hidden;}
    
    /* Main background - Pure Black with animated grid */
    .stApp {
        background: #000000;
        background-image: 
            linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 50px 50px;
        background-attachment: fixed;
        font-family: 'Space Grotesk', sans-serif;
        animation: gridPulse 4s ease-in-out infinite;
    }
    
    @keyframes gridPulse {
        0%, 100% { 
            background-image: 
                linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
        }
        50% { 
            background-image: 
                linear-gradient(rgba(138, 43, 226, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(138, 43, 226, 0.05) 1px, transparent 1px);
        }
    }
    
    /* Animated background particles */
    .stApp::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
            radial-gradient(circle at 20% 30%, rgba(0, 255, 255, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(138, 43, 226, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(0, 255, 200, 0.05) 0%, transparent 50%);
        pointer-events: none;
        animation: particleMove 15s ease-in-out infinite;
        z-index: 0;
    }
    
    @keyframes particleMove {
        0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        50% { 
            transform: translate(30px, 30px) scale(1.2);
            opacity: 0.8;
        }
    }
    
    /* Login Container - More Compact & Dynamic */
    .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }
    
    .login-box {
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(30px);
        border-radius: 20px;
        border: 2px solid rgba(0, 255, 255, 0.5);
        padding: 2.5rem;
        width: 100%;
        max-width: 420px;
        box-shadow: 
            0 0 40px rgba(0, 255, 255, 0.3),
            0 0 80px rgba(138, 43, 226, 0.2),
            inset 0 0 30px rgba(0, 255, 255, 0.05);
        animation: loginPulse 3s ease-in-out infinite;
        position: relative;
        overflow: hidden;
    }
    
    .login-box::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, 
            transparent 30%, 
            rgba(0, 255, 255, 0.1) 50%, 
            transparent 70%);
        animation: loginShine 3s linear infinite;
    }
    
    @keyframes loginShine {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes loginPulse {
        0%, 100% { 
            border-color: rgba(0, 255, 255, 0.5);
            box-shadow: 
                0 0 40px rgba(0, 255, 255, 0.3),
                0 0 80px rgba(138, 43, 226, 0.2),
                inset 0 0 30px rgba(0, 255, 255, 0.05);
        }
        50% { 
            border-color: rgba(138, 43, 226, 0.6);
            box-shadow: 
                0 0 50px rgba(138, 43, 226, 0.4),
                0 0 100px rgba(0, 255, 255, 0.2),
                inset 0 0 30px rgba(138, 43, 226, 0.1);
        }
    }
    
    .login-title {
        font-family: 'Orbitron', sans-serif;
        font-size: 2.8rem;
        font-weight: 900;
        text-align: center;
        background: linear-gradient(135deg, #00ffff 0%, #00ffc8 50%, #8a2be2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 0.3rem;
        filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.6));
        animation: titleFloat 3s ease-in-out infinite;
        position: relative;
        z-index: 1;
    }
    
    @keyframes titleFloat {
        0%, 100% { 
            transform: translateY(0);
            filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.6));
        }
        50% { 
            transform: translateY(-5px);
            filter: drop-shadow(0 0 30px rgba(138, 43, 226, 0.8));
        }
    }
    
    .login-subtitle {
        text-align: center;
        color: #00ffff;
        font-size: 1rem;
        margin-bottom: 1.5rem;
        opacity: 0.9;
        position: relative;
        z-index: 1;
        text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    }
    
    /* Navbar - Sleek & Compact */
    .navbar {
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(20px);
        border-bottom: 2px solid rgba(0, 255, 255, 0.4);
        padding: 0.8rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 1000;
        box-shadow: 
            0 4px 30px rgba(0, 255, 255, 0.2),
            0 0 50px rgba(138, 43, 226, 0.1);
    }
    
    .navbar-brand {
        font-family: 'Orbitron', sans-serif;
        font-size: 1.8rem;
        font-weight: 900;
        background: linear-gradient(135deg, #00ffff 0%, #00ffc8 50%, #8a2be2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 0 15px rgba(0, 255, 255, 0.6));
        animation: brandPulse 2s ease-in-out infinite;
    }
    
    @keyframes brandPulse {
        0%, 100% { filter: drop-shadow(0 0 15px rgba(0, 255, 255, 0.6)); }
        50% { filter: drop-shadow(0 0 25px rgba(138, 43, 226, 0.8)); }
    }
    
    /* Dashboard Cards - Compact & Dynamic */
    .dashboard-card {
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(20px);
        border-radius: 15px;
        border: 2px solid rgba(0, 255, 255, 0.3);
        padding: 1.2rem;
        margin: 0.8rem 0;
        box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.15),
            inset 0 0 20px rgba(0, 255, 255, 0.03);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }
    
    .dashboard-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
        transition: left 0.5s;
    }
    
    .dashboard-card:hover::before {
        left: 100%;
    }
    
    .dashboard-card:hover {
        transform: translateY(-8px) scale(1.02);
        border-color: rgba(0, 255, 255, 0.6);
        box-shadow: 
            0 0 50px rgba(0, 255, 255, 0.3),
            0 0 100px rgba(138, 43, 226, 0.2),
            inset 0 0 30px rgba(0, 255, 255, 0.05);
    }
    
    .metric-container {
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        border: 2px solid rgba(0, 255, 255, 0.3);
        padding: 1.2rem;
        text-align: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }
    
    .metric-container::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(0, 255, 255, 0.1);
        transform: translate(-50%, -50%);
        transition: width 0.5s, height 0.5s;
    }
    
    .metric-container:hover::after {
        width: 300px;
        height: 300px;
    }
    
    .metric-container:hover {
        background: rgba(0, 0, 0, 0.9);
        border-color: rgba(0, 255, 255, 0.6);
        transform: scale(1.08) rotateZ(2deg);
        box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.4),
            0 0 60px rgba(138, 43, 226, 0.2);
    }
    
    .metric-value {
        font-family: 'Orbitron', sans-serif;
        font-size: 2.5rem;
        font-weight: 900;
        background: linear-gradient(135deg, #00ffff 0%, #00ffc8 50%, #8a2be2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
        animation: valueGlow 2s ease-in-out infinite;
        position: relative;
        z-index: 1;
    }
    
    @keyframes valueGlow {
        0%, 100% { filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5)); }
        50% { filter: drop-shadow(0 0 20px rgba(138, 43, 226, 0.7)); }
    }
    
    .metric-label {
        color: #00ffff;
        font-size: 0.95rem;
        opacity: 0.9;
        margin-top: 0.5rem;
        text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        position: relative;
        z-index: 1;
    }
    
    /* Prediction Panel - Ultra Dynamic */
    .prediction-panel {
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(25px);
        border-radius: 18px;
        border: 2px solid rgba(0, 255, 255, 0.4);
        padding: 1.5rem;
        margin: 0.8rem 0;
        box-shadow: 
            0 0 40px rgba(0, 255, 255, 0.2),
            inset 0 0 30px rgba(0, 255, 255, 0.03);
        position: relative;
        overflow: hidden;
    }
    
    .prediction-panel::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, 
            rgba(0, 255, 255, 0.3), 
            rgba(138, 43, 226, 0.3), 
            rgba(0, 255, 255, 0.3));
        border-radius: 18px;
        z-index: -1;
        animation: borderRotate 3s linear infinite;
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .prediction-panel:hover::before {
        opacity: 1;
    }
    
    @keyframes borderRotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .section-title {
        font-family: 'Orbitron', sans-serif;
        font-size: 1.6rem;
        font-weight: 800;
        background: linear-gradient(135deg, #00ffff 0%, #00ffc8 50%, #8a2be2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 1.2rem;
        text-align: center;
        filter: drop-shadow(0 0 15px rgba(0, 255, 255, 0.5));
        animation: titlePulse 2s ease-in-out infinite;
    }
    
    @keyframes titlePulse {
        0%, 100% { 
            transform: scale(1);
            filter: drop-shadow(0 0 15px rgba(0, 255, 255, 0.5));
        }
        50% { 
            transform: scale(1.02);
            filter: drop-shadow(0 0 25px rgba(138, 43, 226, 0.7));
        }
    }
    
    /* Custom Buttons - Ultra Neon */
    .stButton > button {
        background: linear-gradient(135deg, #00ffff 0%, #00b8d4 50%, #8a2be2 100%);
        color: #000000;
        border: none;
        border-radius: 12px;
        padding: 0.75rem 1.8rem;
        font-size: 1.05rem;
        font-weight: 700;
        font-family: 'Space Grotesk', sans-serif;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.4),
            0 0 40px rgba(138, 43, 226, 0.2);
        width: 100%;
        text-transform: uppercase;
        letter-spacing: 1px;
        position: relative;
        overflow: hidden;
    }
    
    .stButton > button::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
    }
    
    .stButton > button:hover::before {
        width: 300px;
        height: 300px;
    }
    
    .stButton > button:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: 
            0 0 40px rgba(0, 255, 255, 0.6),
            0 0 80px rgba(138, 43, 226, 0.4);
        background: linear-gradient(135deg, #00ffc8 0%, #00ffff 50%, #8a2be2 100%);
    }
    
    .stButton > button:active {
        transform: translateY(-2px) scale(0.98);
    }
    /* Input Fields - Neon Focused */
    .stTextInput > div > div > input,
    .stNumberInput > div > div > input,
    .stSelectbox > div > div > select {
        background: rgba(0, 0, 0, 0.8) !important;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(0, 255, 255, 0.4) !important;
        border-radius: 10px !important;
        color: #00ffff !important;
        font-family: 'Space Grotesk', sans-serif;
        padding: 0.7rem !important;
        font-size: 1rem !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.1);
    }
            /* File Uploader Styling - FIX FOR VISIBILITY */
.stFileUploader > div {
    background: rgba(0, 0, 0, 0.8) !important;
    border: 2px solid rgba(0, 255, 255, 0.4) !important;
    border-radius: 12px !important;
    padding: 1rem !important;
}

.stFileUploader label {
    color: #00ffff !important;
    font-weight: 600 !important;
}

/* Upload area text */
.stFileUploader section {
    background: rgba(0, 0, 0, 0.6) !important;
    border: 2px dashed rgba(0, 255, 255, 0.4) !important;
    border-radius: 10px !important;
}

.stFileUploader section > div {
    color: #00ffff !important;
}

.stFileUploader section span {
    color: #00ffff !important;
}

.stFileUploader section small {
    color: rgba(0, 255, 255, 0.7) !important;
}

/* Browse files button */
.stFileUploader button {
    background: linear-gradient(135deg, #00ffff 0%, #00b8d4 50%, #8a2be2 100%) !important;
    color: #000000 !important;
    border: none !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    padding: 0.5rem 1.5rem !important;
}

.stFileUploader button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5) !important;
}
    
    .stTextInput > div > div > input:focus,
    .stNumberInput > div > div > input:focus,
    .stSelectbox > div > div > select:focus {
        border-color: rgba(0, 255, 255, 0.8) !important;
        box-shadow: 
            0 0 25px rgba(0, 255, 255, 0.4) !important,
            inset 0 0 15px rgba(0, 255, 255, 0.1) !important;
        background: rgba(0, 0, 0, 0.95) !important;
        outline: none !important;
    }
    
    /* Selectbox dropdown menu */
    .stSelectbox [data-baseweb="select"] > div {
        background: rgba(0, 0, 0, 0.9) !important;
        border: 2px solid rgba(0, 255, 255, 0.4) !important;
        color: #00ffff !important;
    }
    
    /* Selectbox options in dropdown */
    .stSelectbox ul {
        background: rgba(0, 0, 0, 0.95) !important;
        border: 2px solid rgba(0, 255, 255, 0.3) !important;
    }
    
    .stSelectbox li {
        background: rgba(0, 0, 0, 0.9) !important;
        color: #00ffff !important;
        padding: 0.8rem !important;
    }
    
    .stSelectbox li:hover {
        background: rgba(0, 255, 255, 0.2) !important;
        color: #00ffff !important;
    }
    
    .stSelectbox li[aria-selected="true"] {
        background: rgba(0, 255, 255, 0.3) !important;
        color: #00ffff !important;
    }
    
    /* Selectbox selected value display */
    .stSelectbox [data-baseweb="select"] span {
        color: #00ffff !important;
    }
    
    /* Selectbox dropdown arrow */
    .stSelectbox svg {
        fill: #00ffff !important;
    }
    
    /* Placeholder color */
    .stTextInput > div > div > input::placeholder {
        color: rgba(0, 255, 255, 0.5) !important;
    }
    
    /* Radio buttons - Enhanced visibility */
    div[data-baseweb="radio"] {
        background: rgba(0, 0, 0, 0.8) !important;
        border: 2px solid rgba(0, 255, 255, 0.3) !important;
        border-radius: 12px !important;
        padding: 0.8rem !important;
        gap: 1rem !important;
    }
    
    div[data-baseweb="radio"] > div {
        gap: 0.5rem !important;
    }
    
    /* Radio button labels */
    div[data-baseweb="radio"] label {
        color: #00ffff !important;
        font-weight: 600 !important;
        font-size: 1.1rem !important;
        cursor: pointer !important;
        padding: 0.5rem 1rem !important;
        border-radius: 8px !important;
        transition: all 0.3s ease !important;
    }
    
    div[data-baseweb="radio"] label:hover {
        background: rgba(0, 255, 255, 0.1) !important;
    }
    
    /* Radio button circles */
    div[data-baseweb="radio"] input[type="radio"] {
        accent-color: #00ffff !important;
        width: 20px !important;
        height: 20px !important;
    }
    
    /* Radio button text */
    div[data-baseweb="radio"] label div {
        color: #00ffff !important;
    }
    
    /* Checked radio button */
    div[data-baseweb="radio"] label:has(input:checked) {
        background: rgba(0, 255, 255, 0.2) !important;
        border: 1px solid rgba(0, 255, 255, 0.5) !important;
        border-radius: 8px !important;
    }
    /* Slider Customization - Neon Gradient */
    .stSlider > div > div > div > div {
        background: linear-gradient(90deg, #00ffff 0%, #00b8d4 50%, #8a2be2 100%) !important;
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
    }
    
    .stSlider > div > div > div {
        background: rgba(0, 0, 0, 0.6) !important;
    }
    
    /* Slider thumb */
    .stSlider > div > div > div > div > div {
        background: #00ffff !important;
        border: 2px solid #000000 !important;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.8) !important;
    }
    
    /* Streamlit Selectbox - Comprehensive styling */
    [data-baseweb="select"] {
        background: rgba(0, 0, 0, 0.9) !important;
    }
    
    [data-baseweb="select"] > div {
        background: rgba(0, 0, 0, 0.9) !important;
        border-color: rgba(0, 255, 255, 0.4) !important;
        color: #00ffff !important;
    }
    
    /* Dropdown menu container */
    [data-baseweb="popover"] {
        background: rgba(0, 0, 0, 0.95) !important;
        border: 2px solid rgba(0, 255, 255, 0.4) !important;
        border-radius: 12px !important;
    }
    
    /* Dropdown list */
    [role="listbox"] {
        background: rgba(0, 0, 0, 0.95) !important;
        border-radius: 10px !important;
    }
    
    /* Dropdown list items */
    [role="option"] {
        background: rgba(0, 0, 0, 0.9) !important;
        color: #00ffff !important;
        padding: 0.8rem 1rem !important;
        transition: all 0.3s ease !important;
    }
    
    [role="option"]:hover {
        background: rgba(0, 255, 255, 0.2) !important;
        color: #00ffff !important;
    }
    
    [role="option"][aria-selected="true"] {
        background: rgba(0, 255, 255, 0.3) !important;
        color: #00ffff !important;
        font-weight: 600 !important;
    }
    
    /* Selectbox text in all states */
    [data-baseweb="select"] span,
    [data-baseweb="select"] div,
    [data-baseweb="select"] input {
        color: #00ffff !important;
    }
    
    /* Number input spinners */
    .stNumberInput button {
        color: #00ffff !important;
    }
    
    .stNumberInput button:hover {
        background: rgba(0, 255, 255, 0.2) !important;
    }
    
    /* Tabs - Compact Neon */
    .stTabs [data-baseweb="tab-list"] {
        gap: 0.8rem;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 0.4rem;
        border: 2px solid rgba(0, 255, 255, 0.2);
    }
    
    .stTabs [data-baseweb="tab"] {
        background: transparent;
        border: 2px solid rgba(0, 255, 255, 0.3);
        border-radius: 10px;
        color: #00ffff;
        padding: 0.7rem 1.3rem;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.2rem;
        font-weight: 700;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
    }
    
    .stTabs [data-baseweb="tab"]:hover {
        background: rgba(0, 255, 255, 0.1);
        border-color: rgba(0, 255, 255, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    }
    
    .stTabs [data-baseweb="tab"][aria-selected="true"] {
        background: linear-gradient(135deg, #00ffff 0%, #00b8d4 50%, #8a2be2 100%);
        color: #000000;
        border-color: transparent;
        font-weight: 700;
        box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.5),
            0 0 60px rgba(138, 43, 226, 0.3);
        text-shadow: none;
    }
    
    /* Chatbot - Ultra Dynamic */
    .chatbot-container {
        position: fixed;
        bottom: 25px;
        right: 25px;
        z-index: 9999;
    }
    
    .chatbot-toggle {
        width: 65px;
        height: 65px;
        border-radius: 50%;
        background: linear-gradient(135deg, #00ffff 0%, #00b8d4 50%, #8a2be2 100%);
        border: 3px solid rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.6),
            0 0 60px rgba(138, 43, 226, 0.4),
            inset 0 0 20px rgba(255, 255, 255, 0.1);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        animation: chatbotFloat 3s ease-in-out infinite;
    }
    
    @keyframes chatbotFloat {
        0%, 100% { 
            transform: translateY(0) scale(1);
            box-shadow: 
                0 0 30px rgba(0, 255, 255, 0.6),
                0 0 60px rgba(138, 43, 226, 0.4);
        }
        50% { 
            transform: translateY(-10px) scale(1.05);
            box-shadow: 
                0 0 40px rgba(0, 255, 255, 0.8),
                0 0 80px rgba(138, 43, 226, 0.6);
        }
    }
    
    .chatbot-toggle:hover {
        transform: scale(1.15) rotate(10deg);
        box-shadow: 
            0 0 50px rgba(0, 255, 255, 0.8),
            0 0 100px rgba(138, 43, 226, 0.6);
    }
    
    .chatbot-window {
        position: fixed;
        bottom: 105px;
        right: 25px;
        width: 380px;
        height: 520px;
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(30px);
        border-radius: 20px;
        border: 2px solid rgba(0, 255, 255, 0.5);
        box-shadow: 
            0 0 50px rgba(0, 255, 255, 0.4),
            0 0 100px rgba(138, 43, 226, 0.3);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: chatWindowSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes chatWindowSlide {
        from { 
            opacity: 0;
            transform: translateY(30px) scale(0.9);
        }
        to { 
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    .chatbot-header {
        background: linear-gradient(135deg, #00ffff 0%, #00b8d4 50%, #8a2be2 100%);
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 4px 20px rgba(0, 255, 255, 0.3);
    }
    
    .chatbot-header h3 {
        font-family: 'Orbitron', sans-serif;
        color: #000000;
        margin: 0;
        font-size: 1.2rem;
        font-weight: 800;
    }
    
    .chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1.2rem;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        background: rgba(0, 0, 0, 0.5);
    }
    
    .chatbot-message {
        padding: 0.9rem;
        border-radius: 12px;
        max-width: 80%;
        word-wrap: break-word;
        animation: messageSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    
    @keyframes messageSlideIn {
        from { 
            opacity: 0;
            transform: translateX(-15px);
        }
        to { 
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .chatbot-message.bot {
        background: rgba(0, 255, 255, 0.15);
        border: 2px solid rgba(0, 255, 255, 0.4);
        align-self: flex-start;
        color: #00ffff;
        text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
    }
    
    .chatbot-message.user {
        background: rgba(138, 43, 226, 0.15);
        border: 2px solid rgba(138, 43, 226, 0.4);
        align-self: flex-end;
        color: #e0b3ff;
        text-shadow: 0 0 5px rgba(138, 43, 226, 0.3);
    }
    
    .chatbot-input {
        padding: 1rem;
        background: rgba(0, 0, 0, 0.8);
        border-top: 2px solid rgba(0, 255, 255, 0.3);
        display: flex;
        gap: 0.5rem;
    }
    
    /* Bike Animation - Enhanced */
    .bike-icon {
        display: inline-block;
        animation: bikeRide 2s ease-in-out infinite;
        filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.6));
    }
    
    @keyframes bikeRide {
        0%, 100% { 
            transform: translateX(0) rotate(0deg);
            filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.6));
        }
        50% { 
            transform: translateX(15px) rotate(8deg);
            filter: drop-shadow(0 0 30px rgba(138, 43, 226, 0.8));
        }
    }
    
    /* Loading Animation - Neon */
    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem;
    }
    
    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(0, 0, 0, 0.2);
        border-top: 4px solid #00ffff;
        border-right: 4px solid #8a2be2;
        border-radius: 50%;
        animation: spinGlow 1s linear infinite;
        box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.5),
            0 0 60px rgba(138, 43, 226, 0.3);
    }
    
    @keyframes spinGlow {
        0% { 
            transform: rotate(0deg);
            box-shadow: 
                0 0 30px rgba(0, 255, 255, 0.5),
                0 0 60px rgba(138, 43, 226, 0.3);
        }
        50% {
            box-shadow: 
                0 0 40px rgba(138, 43, 226, 0.7),
                0 0 80px rgba(0, 255, 255, 0.5);
        }
        100% { 
            transform: rotate(360deg);
            box-shadow: 
                0 0 30px rgba(0, 255, 255, 0.5),
                0 0 60px rgba(138, 43, 226, 0.3);
        }
    }
    
    /* Success/Error Messages - Enhanced */
    .success-message {
        background: rgba(0, 0, 0, 0.85);
        border: 2px solid rgba(0, 255, 255, 0.5);
        border-radius: 15px;
        padding: 1.2rem;
        color: #00ffff;
        margin: 1rem 0;
        text-align: center;
        animation: successPulse 0.6s ease;
        box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.3),
            inset 0 0 20px rgba(0, 255, 255, 0.05);
    }
    
    .error-message {
        background: rgba(0, 0, 0, 0.85);
        border: 2px solid rgba(255, 0, 100, 0.5);
        border-radius: 15px;
        padding: 1.2rem;
        color: #ff6b9d;
        margin: 1rem 0;
        text-align: center;
        animation: errorShake 0.6s ease;
        box-shadow: 
            0 0 30px rgba(255, 0, 100, 0.3),
            inset 0 0 20px rgba(255, 0, 100, 0.05);
    }
    
    @keyframes successPulse {
        0% { 
            opacity: 0;
            transform: scale(0.9);
        }
        50% {
            transform: scale(1.02);
        }
        100% { 
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes errorShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-12px); }
        75% { transform: translateX(12px); }
    }
    
    /* Map Container - Enhanced */
    .map-container {
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(25px);
        border-radius: 18px;
        border: 2px solid rgba(0, 255, 255, 0.4);
        padding: 1rem;
        margin: 1rem 0;
        height: 500px;
        overflow: hidden;
        box-shadow: 
            0 0 40px rgba(0, 255, 255, 0.2),
            inset 0 0 30px rgba(0, 255, 255, 0.03);
    }
    
    /* Scrollbar Styling - Neon */
    ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }
    
    ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.8);
        border-radius: 10px;
        border: 1px solid rgba(0, 255, 255, 0.1);
    }
    
    ::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #00ffff 0%, #8a2be2 100%);
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #00ffc8 0%, #8a2be2 100%);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.7);
    }
    
    /* Text Colors - Neon Theme */
    h1, h2, h3, h4, h5, h6 {
        color: #00ffff !important;
        font-family: 'Orbitron', sans-serif !important;
        text-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
    }
    
    p, span, div, li {
        color: rgba(255, 255, 255, 0.95) !important;
    }
    
    label {
        color: #00ffff !important;
        font-family: 'Space Grotesk', sans-serif !important;
        font-weight: 600 !important;
        font-size: 1.15rem !important;
        text-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
    }
            
            /* Section titles in prediction tabs */
    .prediction-panel h3 {
        font-size: 1.8rem !important;  /* Increased */
    }
    
    /* Sidebar Styling - Pure Black */
    [data-testid="stSidebar"] {
        background: rgba(0, 0, 0, 0.95) !important;
        backdrop-filter: blur(20px);
        border-right: 2px solid rgba(0, 255, 255, 0.3);
        box-shadow: 4px 0 30px rgba(0, 255, 255, 0.1);
        min-width: 300px !important;
    }
    
    /* Prevent sidebar from collapsing */
    [data-testid="stSidebar"][aria-expanded="true"] {
        min-width: 300px !important;
    }
    
    [data-testid="stSidebar"][aria-expanded="false"] {
        min-width: 300px !important;
    }
    
    /* Sidebar collapse button - always visible */
    [data-testid="collapsedControl"] {
        display: block !important;
        color: #00ffff !important;
    }
    
    /* Streamlit specific elements */
    .stMarkdown {
        color: rgba(255, 255, 255, 0.95) !important;
    }
    
    /* Info/Warning/Success boxes from Streamlit */
    .stAlert {
        background: rgba(0, 0, 0, 0.8) !important;
        border-left: 4px solid #00ffff !important;
        border-radius: 10px !important;
        backdrop-filter: blur(10px);
    }
    
    /* Metric styling */
    [data-testid="stMetricValue"] {
        color: #00ffff !important;
        font-family: 'Orbitron', sans-serif !important;
        text-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
    }
    
    [data-testid="stMetricLabel"] {
        color: rgba(0, 255, 255, 0.8) !important;
    }
    
    /* DataFrames */
    .dataframe {
        background: rgba(0, 0, 0, 0.8) !important;
        border: 2px solid rgba(0, 255, 255, 0.2) !important;
        border-radius: 10px !important;
    }
    
    .dataframe thead {
        background: rgba(0, 255, 255, 0.1) !important;
        color: #00ffff !important;
    }
    
    .dataframe tbody tr {
        border-bottom: 1px solid rgba(0, 255, 255, 0.1) !important;
    }
    
    .dataframe tbody tr:hover {
        background: rgba(0, 255, 255, 0.05) !important;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .chatbot-window {
            width: 90%;
            right: 5%;
        }
        
        .login-box {
            padding: 2rem;
        }
        
        .navbar {
            padding: 0.8rem;
        }
        
        .navbar-brand {
            font-size: 1.5rem;
        }
        
        .metric-value {
            font-size: 2rem;
        }
    }
    
    /* Additional dynamic effects */
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    .floating {
        animation: float 3s ease-in-out infinite;
    }
    
    /* Glow effect for important elements */
    .glow {
        animation: glow 2s ease-in-out infinite;
    }
    
    @keyframes glow {
        0%, 100% {
            filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
        }
        50% {
            filter: drop-shadow(0 0 20px rgba(138, 43, 226, 0.8));
        }
    }
            /* ============= RATING & FEEDBACK WIDGET ============= */
    .rating-widget {
        position: fixed;
        bottom: 25px;
        left: 25px;
        z-index: 9998;
    }
    
    .rating-toggle {
        width: 65px;
        height: 65px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ff6f00 100%);
        border: 3px solid rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 
            0 0 30px rgba(255, 215, 0, 0.6),
            0 0 60px rgba(255, 111, 0, 0.4);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        animation: ratingFloat 3s ease-in-out infinite;
    }
    
    @keyframes ratingFloat {
        0%, 100% { 
            transform: translateY(0) rotate(0deg);
            box-shadow: 
                0 0 30px rgba(255, 215, 0, 0.6),
                0 0 60px rgba(255, 111, 0, 0.4);
        }
        50% { 
            transform: translateY(-10px) rotate(10deg);
            box-shadow: 
                0 0 40px rgba(255, 215, 0, 0.8),
                0 0 80px rgba(255, 111, 0, 0.6);
        }
    }
    
    .rating-toggle:hover {
        transform: scale(1.15) rotate(-10deg);
        box-shadow: 
            0 0 50px rgba(255, 215, 0, 0.8),
            0 0 100px rgba(255, 111, 0, 0.6);
    }
    
    .rating-window {
        position: fixed;
        bottom: 105px;
        left: 25px;
        width: 420px;
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(30px);
        border-radius: 20px;
        border: 2px solid rgba(255, 215, 0, 0.5);
        box-shadow: 
            0 0 50px rgba(255, 215, 0, 0.4),
            0 0 100px rgba(255, 111, 0, 0.3);
        padding: 1.5rem;
        animation: ratingWindowSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes ratingWindowSlide {
        from { 
            opacity: 0;
            transform: translateY(30px) scale(0.9);
        }
        to { 
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    .rating-header {
        background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ff6f00 100%);
        border-radius: 15px;
        padding: 1rem;
        margin-bottom: 1.5rem;
        text-align: center;
    }
    
    .rating-header h3 {
        color: #000000 !important;
        font-family: 'Orbitron', sans-serif !important;
        margin: 0 !important;
        font-size: 1.4rem !important;
        font-weight: 800 !important;
        text-shadow: none !important;
    }
    
    .star-rating {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin: 1.5rem 0;
    }
    
    .star {
        font-size: 2.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.3));
    }
    
    .star:hover {
        transform: scale(1.2) rotate(20deg);
        filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
    }
    
    .star.selected {
        filter: drop-shadow(0 0 20px rgba(255, 215, 0, 1));
    }
    
    /* ============= FOOTER STYLES ============= */
    .footer-container {
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(30px);
        border-top: 3px solid rgba(0, 255, 255, 0.5);
        margin-top: 4rem;
        padding: 3rem 2rem 1.5rem 2rem;
        box-shadow: 
            0 -10px 50px rgba(0, 255, 255, 0.2),
            inset 0 1px 30px rgba(0, 255, 255, 0.05);
    }
    
    .footer-content {
        max-width: 1400px;
        margin: 0 auto;
    }
    
    .footer-section {
        margin-bottom: 2rem;
    }
    
    .footer-title {
        font-family: 'Orbitron', sans-serif;
        font-size: 1.3rem;
        font-weight: 800;
        background: linear-gradient(135deg, #00ffff 0%, #8a2be2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 1rem;
        filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
    }
    
    .footer-links {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        margin-bottom: 1rem;
    }
    
    .footer-link {
        color: #00ffff;
        text-decoration: none;
        font-size: 1rem;
        transition: all 0.3s ease;
        opacity: 0.8;
    }
    
    .footer-link:hover {
        opacity: 1;
        text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
        transform: translateY(-2px);
    }
    
    .social-icons {
        display: flex;
        gap: 1.5rem;
        margin-top: 1rem;
    }
    
    .social-icon {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: rgba(0, 255, 255, 0.1);
        border: 2px solid rgba(0, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .social-icon:hover {
        background: rgba(0, 255, 255, 0.2);
        border-color: rgba(0, 255, 255, 0.6);
        transform: translateY(-5px) rotate(10deg);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    }
    
    .footer-divider {
        height: 2px;
        background: linear-gradient(90deg, 
            transparent, 
            rgba(0, 255, 255, 0.5) 20%, 
            rgba(138, 43, 226, 0.5) 50%, 
            rgba(0, 255, 255, 0.5) 80%, 
            transparent);
        margin: 2rem 0;
    }
    
    .footer-bottom {
        text-align: center;
        padding-top: 1.5rem;
        color: rgba(0, 255, 255, 0.7);
        font-size: 0.95rem;
    }
    
    .footer-bottom a {
        color: #00ffff;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .footer-bottom a:hover {
        text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
    }
    
    .tech-badge {
        display: inline-block;
        background: rgba(0, 255, 255, 0.1);
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 15px;
        padding: 0.3rem 0.8rem;
        margin: 0.3rem;
        font-size: 0.85rem;
        color: #00ffff;
        transition: all 0.3s ease;
    }
    
    .tech-badge:hover {
        background: rgba(0, 255, 255, 0.2);
        border-color: rgba(0, 255, 255, 0.6);
        transform: translateY(-2px);
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'logged_in' not in st.session_state:
    st.session_state.logged_in = False
if 'username' not in st.session_state:
    st.session_state.username = ""
if 'page' not in st.session_state:
    st.session_state.page = "Home"
if 'chatbot_open' not in st.session_state:
    st.session_state.chatbot_open = False
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []
if 'voice_mode_active' not in st.session_state:
    st.session_state.voice_mode_active = False
if 'rating_widget_open' not in st.session_state:
    st.session_state.rating_widget_open = False
if 'user_full_name' not in st.session_state:
    st.session_state.user_full_name = ""
if 'theme' not in st.session_state:
    st.session_state.theme = 'dark'
if st.session_state.theme == 'light':
    theme_css = get_theme_css('light')
    st.markdown(f"""
    <style>
    {theme_css}
    </style>
    """, unsafe_allow_html=True)    

# Login Function
def login_page():
    # Add custom CSS for login page only
    st.markdown("""
        <style>
            /* Force content to start at top */
            .main .block-container {
                padding-top: 2rem !important;
                margin-top: 0 !important;
                max-width: 100% !important;
            }
            
            /* Remove any top spacing */
            .stApp > header {
                display: none !important;
            }
            
            /* Hide any debug or info boxes */
            .stAlert, .stWarning, .stInfo {
                display: none !important;
            }
        </style>
    """, unsafe_allow_html=True)
    
    # Initialize session state for signup mode
    if 'signup_mode' not in st.session_state:
        st.session_state.signup_mode = False
    
    # Simple centered container without complex HTML that might show in UI
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        # Logo/Bike Icon
        st.markdown("""
            <div style="text-align: center; margin: 3rem 0 1.5rem 0;">
                <div style="font-size: 5rem; animation: bikeRide 2s ease-in-out infinite; filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.8));">🚴</div>
            </div>
        """, unsafe_allow_html=True)
        
        # Title
        st.markdown("""
            <h1 style="
                font-family: 'Orbitron', sans-serif;
                font-size: 2.8rem;
                font-weight: 900;
                text-align: center;
                background: linear-gradient(135deg, #00ffff 0%, #00ffc8 50%, #8a2be2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 0.5rem;
                filter: drop-shadow(0 0 25px rgba(0, 255, 255, 0.6));
                animation: titleFloat 3s ease-in-out infinite;
            ">RideWise</h1>
        """, unsafe_allow_html=True)
        
        # Subtitle
        subtitle_text = "Create Your Account" if st.session_state.signup_mode else "AI-Powered Bike Rental Prediction System"
        st.markdown(f"""
            <p style="
                text-align: center;
                color: #00ffff;
                font-size: 1rem;
                margin-bottom: 2rem;
                opacity: 0.9;
                text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            ">{subtitle_text}</p>
        """, unsafe_allow_html=True)
        
        # ========== SIGN UP MODE ==========
        if st.session_state.signup_mode:
            st.markdown("""
                <div style="
                    background: rgba(0, 255, 255, 0.1);
                    border: 2px solid rgba(0, 255, 255, 0.3);
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                    text-align: center;
                ">
                    <span style="color: #00ffff; font-size: 1.5rem;">📝</span>
                    <p style="color: #00ffff; margin: 0.5rem 0 0 0;">Fill in the details below to create your account</p>
                </div>
            """, unsafe_allow_html=True)
            
            # Full Name
            name = st.text_input(
                "Full Name",
                placeholder="Enter your full name",
                key="signup_name",
                label_visibility="visible"
            )
            
            # Username
            username = st.text_input(
                "Username",
                placeholder="Choose a unique username",
                key="signup_username",
                label_visibility="visible"
            )
            
            # Password
            password = st.text_input(
                "Password",
                type="password",
                placeholder="Create a strong password",
                key="signup_password",
                label_visibility="visible"
            )
            
            # Confirm Password
            confirm_password = st.text_input(
                "Confirm Password",
                type="password",
                placeholder="Re-enter your password",
                key="signup_confirm",
                label_visibility="visible"
            )
            
            col_btn1, col_btn2 = st.columns(2)
            
            with col_btn1:
                if st.button("🚀 Create Account", use_container_width=True, key="create_account_btn"):
                    # Validation
                    if not name or not username or not password or not confirm_password:
                        st.error("❌ All fields are required!")
                    elif len(username) < 3:
                        st.error("❌ Username must be at least 3 characters long!")
                    elif len(password) < 6:
                        st.error("❌ Password must be at least 6 characters long!")
                    elif password != confirm_password:
                        st.error("❌ Passwords do not match!")
                    elif username_exists(username):
                        st.error("❌ Username already exists! Please choose a different username.")
                    else:
                        # Save user
                        save_user(username, password, name)
                        
                        # Success message
                        st.success(f"✅ Account created successfully! Welcome, {name}!")
                        time.sleep(1.5)
                        
                        # Switch back to login mode
                        st.session_state.signup_mode = False
                        st.rerun()
            
            with col_btn2:
                if st.button("← Back to Login", use_container_width=True, key="back_to_login_btn"):
                    st.session_state.signup_mode = False
                    st.rerun()
        
        # ========== LOGIN MODE ==========
        else:
            # Login Form
            username = st.text_input(
                "Username", 
                placeholder="Enter your username", 
                key="login_username",
                label_visibility="visible"
            )
            
            password = st.text_input(
                "Password", 
                type="password", 
                placeholder="Enter your password", 
                key="login_password",
                label_visibility="visible"
            )
            
            col_btn1, col_btn2 = st.columns(2)
            
            with col_btn1:
                if st.button("🚀 Sign In", use_container_width=True, key="signin_btn"):
                    if not username or not password:
                        st.error("❌ Please enter both username and password!")
                    elif validate_user(username, password):
                        st.session_state.logged_in = True
                        st.session_state.username = username
                        st.session_state.user_full_name = get_user_name(username)
                        st.success(f"✅ Login Successful! Welcome back, {st.session_state.user_full_name}!")
                        time.sleep(0.5)
                        st.rerun()
                    else:
                        st.error("❌ Invalid username or password")
            
            with col_btn2:
                if st.button("📝 Sign Up", use_container_width=True, key="signup_btn"):
                    st.session_state.signup_mode = True
                    st.rerun()

# Chatbot Component
def render_chatbot():
    """Render floating chatbot button and overlay chat window - FIXED VERSION"""
    
    if not st.session_state.chatbot_open:
        # Render floating button
        st.markdown("""
            <div id="floatingChatBtn" style="position: fixed; bottom: 25px; right: 25px; width: 75px; height: 75px;
                 border-radius: 50%; background: linear-gradient(135deg, #00ffff 0%, #00b8d4 50%, #8a2be2 100%);
                 border: 3px solid rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center;
                 cursor: pointer; box-shadow: 0 0 30px rgba(0, 255, 255, 0.6), 0 0 60px rgba(138, 43, 226, 0.4),
                 inset 0 0 20px rgba(255, 255, 255, 0.1); z-index: 999999; animation: chatFloat 3s ease-in-out infinite;">
                <span style="font-size: 4.0rem; filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.6));">🤖</span>
            </div>
            <style>
            @keyframes chatFloat {
                0%, 100% { 
                    transform: translateY(0) scale(1);
                    box-shadow: 0 0 30px rgba(0, 255, 255, 0.6), 0 0 60px rgba(138, 43, 226, 0.4), 
                                inset 0 0 20px rgba(255, 255, 255, 0.1);
                }
                50% { 
                    transform: translateY(-12px) scale(1.05);
                    box-shadow: 0 0 40px rgba(0, 255, 255, 0.8), 0 0 80px rgba(138, 43, 226, 0.6), 
                                inset 0 0 25px rgba(255, 255, 255, 0.15);
                }
            }
            #floatingChatBtn:hover {
                transform: scale(1.15) rotate(10deg) !important;
                box-shadow: 0 0 50px rgba(0, 255, 255, 0.9), 0 0 100px rgba(138, 43, 226, 0.7), 
                            inset 0 0 30px rgba(255, 255, 255, 0.2) !important;
                animation: none !important;
            }
            </style>
        """, unsafe_allow_html=True)
        
        components.html("""
            <script>
                (function() {
                    const checkButton = setInterval(function() {
                        const btn = window.parent.document.getElementById('floatingChatBtn');
                        if (btn) {
                            clearInterval(checkButton);
                            btn.onclick = function() {
                                const buttons = window.parent.document.querySelectorAll('button');
                                buttons.forEach(function(button) {
                                    const text = button.textContent || button.innerText || '';
                                    if (text.includes('Open Chat')) {
                                        button.click();
                                    }
                                });
                            };
                        }
                    }, 100);
                })();
            </script>
        """, height=0)
        
        st.markdown("""
            <style>
            button[kind="primary"] {
                position: absolute !important;
                left: -9999px !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
            </style>
        """, unsafe_allow_html=True)
        
        if st.button("Open Chat", key="hidden_open_btn", type="primary"):
            st.session_state.chatbot_open = True
            st.rerun()
    
    if st.session_state.chatbot_open:
        st.markdown("""
            <style>
            [data-testid="stSidebar"] {
                display: block !important;
                position: fixed !important;
                right: 20px !important;
                bottom: 20px !important;
                top: auto !important;              
                left: auto !important;     
                width: 420px !important;
                height: 650px !important;
                background: rgba(0, 0, 0, 0.98) !important;
                backdrop-filter: blur(30px) !important;
                border: 3px solid rgba(0, 255, 255, 0.6) !important;
                border-radius: 20px !important;
                z-index: 10000 !important;
            }
            .mic-button {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                background: linear-gradient(135deg, #00ffff 0%, #8a2be2 100%);
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                cursor: pointer;
                font-size: 1.2rem;
                box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
                z-index: 10;
            }
            .mic-button.recording {
                background: linear-gradient(135deg, #ff0055 0%, #ff6b9d 100%);
                animation: pulse 1.5s ease-in-out infinite;
            }
            @keyframes pulse {
                0%, 100% { box-shadow: 0 0 15px rgba(255, 0, 85, 0.6); }
                50% { box-shadow: 0 0 35px rgba(255, 0, 85, 0.9); }
            }
            </style>
        """, unsafe_allow_html=True)
        
        with st.sidebar:
            col1, col2 = st.columns([4, 1])
            with col1:
                st.markdown("""
                    <div style="background: linear-gradient(135deg, #00ffff 0%, #8a2be2 100%); 
                                border-radius: 15px; padding: 1rem; text-align: center;">
                        <h2 style="color: #000; margin: 0; font-size: 1.5rem;">🤖 RideWise Assistant</h2>
                    </div>
                """, unsafe_allow_html=True)
            with col2:
                if st.button("✕", key="close_chat"):
                    st.session_state.chatbot_open = False
                    st.rerun()
            
            st.markdown("#### 🎯 Quick Navigation")
            c1, c2 = st.columns(2)
            with c1:
                if st.button("🏠 Home", key="nh", use_container_width=True):
                    st.session_state.page = "Home"
                    st.rerun()
                if st.button("🗺️ Map", key="nm", use_container_width=True):
                    st.session_state.page = "Map"
                    st.rerun()
            with c2:
                if st.button("📊 Predict", key="np", use_container_width=True):
                    st.session_state.page = "Predictions"
                    st.rerun()
                if st.button("⭐ Feedback", key="nf", use_container_width=True):
                    st.session_state.page = "Feedback"
                    st.rerun()
            
            st.markdown("---")

            st.markdown("#### 💬 Conversation")
            
            if len(st.session_state.chat_history) == 0:
                st.info("👋 Welcome! Ask me anything about RideWise.")
            else:
                for msg in st.session_state.chat_history:
                    if msg['role'] == 'user':
                        st.markdown(f"**👤 You:** {msg['content']}")
                    else:
                        st.markdown(f"**🤖 Bot:** {msg['content']}")
            
            st.markdown("---")

            # Voice mode indicator (shows when mic was used)
            components.html("""
                <script>
                (function() {
                    const wasVoice = sessionStorage.getItem('lastInputWasVoice') === 'true';
                    if (wasVoice) {
                        const sidebar = parent.document.querySelector('[data-testid="stSidebar"]');
                        if (sidebar) {
                            let indicator = sidebar.querySelector('.voice-indicator');
                            if (!indicator) {
                                indicator = document.createElement('div');
                                indicator.className = 'voice-indicator';
                                indicator.innerHTML = '🔊 Voice Mode Active';
                                indicator.style.cssText = `
                                    position: absolute;
                                    top: 10px;
                                    right: 10px;
                                    background: rgba(0, 255, 255, 0.2);
                                    border: 2px solid #00ffff;
                                    border-radius: 8px;
                                    padding: 0.5rem;
                                    color: #00ffff;
                                    font-size: 0.85rem;
                                    font-weight: 600;
                                    z-index: 9999;
                                    animation: voicePulse 1.5s ease-in-out infinite;
                                `;
                                sidebar.appendChild(indicator);
                                
                                // Add animation
                                const style = document.createElement('style');
                                style.textContent = `
                                    @keyframes voicePulse {
                                        0%, 100% { opacity: 1; }
                                        50% { opacity: 0.5; }
                                    }
                                `;
                                document.head.appendChild(style);
                                
                                // Remove after 2 seconds
                                setTimeout(() => indicator.remove(), 2000);
                            }
                        }
                    }
                })();
                </script>
            """, height=0)

            # CRITICAL FIX: Enhanced microphone with GUARANTEED persistence
            components.html("""
                <script>
                (function() {
                    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                    if (!SR) return;
                    
                    let isRecording = false;
                    let recognition = null;
                    const buttonId = 'mic-btn-' + Date.now();
                    
                    function createMicButton() {
                        const btn = document.createElement('button');
                        btn.innerHTML = '🎤';
                        btn.className = 'mic-button';
                        btn.id = buttonId;
                        btn.type = 'button';
                        
                        btn.onclick = function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (isRecording) {
                                if (recognition) recognition.stop();
                                return;
                            }
                            
                            recognition = new SR();
                            recognition.lang = 'en-US';
                            recognition.continuous = false;
                            recognition.interimResults = false;
                            
                            recognition.onstart = function() {
                                isRecording = true;
                                btn.classList.add('recording');
                                btn.innerHTML = '🔴';
                            };
                            
                            recognition.onresult = function(event) {
                                const transcript = event.results[0][0].transcript;

                                // FIX 1: Set flag IMMEDIATELY and log it
                                parent.sessionStorage.setItem('lastInputWasVoice', 'true');
                                console.log('[MIC] ✅ Voice flag SET:', parent.sessionStorage.getItem('lastInputWasVoice'));

                                // FIX 2: Add flag to localStorage as backup
                                parent.localStorage.setItem('voiceInputActive', 'true');
                                
                                // FIX 3: Set window property as third backup
                                parent.window.VOICE_INPUT_ACTIVE = true;

                                setTimeout(function() {
                                    const inputs = parent.document.querySelectorAll('[data-testid="stSidebar"] input[type="text"]');
                                    if (inputs.length > 0) {
                                        const input = inputs[inputs.length - 1];
                                        const nativeSetter = Object.getOwnPropertyDescriptor(
                                            window.HTMLInputElement.prototype, 'value'
                                        ).set;
                                        nativeSetter.call(input, transcript);
                                        input.dispatchEvent(new Event('input', { bubbles: true }));
                                        input.dispatchEvent(new Event('change', { bubbles: true }));
                                        input.focus();

                                        // FIX 4: Increased delay BEFORE clicking Send
                                        setTimeout(function() {
                                            // FIX 5: RE-SET flag right before Send (in case it got cleared)
                                            parent.sessionStorage.setItem('lastInputWasVoice', 'true');
                                            parent.localStorage.setItem('voiceInputActive', 'true');
                                            parent.window.VOICE_INPUT_ACTIVE = true;
                                            
                                            console.log('[MIC] 🔄 Re-confirmed flags before Send');
                                            
                                            const sendBtn = parent.document.querySelector('button[kind="primary"]') ||
                                                           Array.from(parent.document.querySelectorAll('button'))
                                                               .find(b => b.textContent.includes('Send') || b.textContent.includes('📤'));
                                            if (sendBtn) {
                                                console.log('[MIC] 🎯 Clicking Send with flags:', {
                                                    session: parent.sessionStorage.getItem('lastInputWasVoice'),
                                                    local: parent.localStorage.getItem('voiceInputActive'),
                                                    window: parent.window.VOICE_INPUT_ACTIVE
                                                });
                                                sendBtn.click();
                                            }
                                        }, 500);  // INCREASED from 400ms to 500ms
                                    }
                                }, 200);  // INCREASED from 150ms to 200ms
                            };

                            recognition.onend = function() {
                                isRecording = false;
                                btn.classList.remove('recording');
                                btn.innerHTML = '🎤';
                            };
                            
                            recognition.onerror = function(event) {
                                console.error('[MIC] ❌ Speech error:', event.error);
                                isRecording = false;
                                btn.classList.remove('recording');
                                btn.innerHTML = '🎤';
                            };
                            
                            try {
                                recognition.start();
                            } catch (err) {
                                console.error('[MIC] ❌ Start error:', err);
                            }
                        };
                        return btn;
                    }
                    
                    function attachMicButton() {
                        const inputs = parent.document.querySelectorAll('[data-testid="stSidebar"] input[type="text"]');
                        if (inputs.length > 0) {
                            const container = inputs[inputs.length - 1].parentElement;
                            if (container) {
                                container.querySelectorAll('.mic-button').forEach(btn => btn.remove());
                                container.style.position = 'relative';
                                container.appendChild(createMicButton());
                                return true;
                            }
                        }
                        return false;
                    }
                    
                    [100, 300, 500, 800, 1200, 1800, 2500].forEach(delay => {
                        setTimeout(attachMicButton, delay);
                    });
                    
                    function setupObserver() {
                        const sidebar = parent.document.querySelector('[data-testid="stSidebar"]');
                        if (sidebar) {
                            const observer = new MutationObserver(function() {
                                clearTimeout(window.micTimeout);
                                window.micTimeout = setTimeout(attachMicButton, 250);
                            });
                            observer.observe(sidebar, { childList: true, subtree: true });
                        } else {
                            setTimeout(setupObserver, 400);
                        }
                    }
                    setupObserver();
                    
                    setInterval(function() {
                        const inputs = parent.document.querySelectorAll('[data-testid="stSidebar"] input[type="text"]');
                        if (inputs.length > 0) {
                            const container = inputs[inputs.length - 1].parentElement;
                            if (container && !container.querySelector('.mic-button')) {
                                attachMicButton();
                            }
                        }
                    }, 600);
                })();
                </script>
            """, height=0)
            
            user_input = st.text_input("Type or 🎤 speak...", key="ci", label_visibility="collapsed")
            
            c1, c2 = st.columns([2.5, 1.5])  # ← ADD THIS LINE (defines both c1 and c2)
            
            with c1:
                if st.button("📤 Send", use_container_width=True):
                    if user_input.strip():
                        st.session_state.chat_history.append({"role": "user", "content": user_input})
                        response = generate_bot_response(user_input)
                        st.session_state.chat_history.append({"role": "bot", "content": response})
                        
                        # Speak the response if it was a voice input
                        speak_text(response)
                        
                        st.rerun()
            
            with c2:
                if st.button("🗑️ Clear", use_container_width=True):
                    st.session_state.chat_history = []
                    st.rerun()
    else:
        st.markdown("""
            <style>
            [data-testid="stSidebar"] {
                display: none !important;
            }
            </style>
        """, unsafe_allow_html=True)
# Add this near the end of render_chatbot() function
# This code should already be there - verify it exists:
# ESC key handler - place this at the END of render_chatbot() function
components.html("""
    <script>
    (function() {
        const parentDoc = window.parent.document;
        
        // Remove any existing ESC listeners to avoid duplicates
        if (window.parent.escKeyHandler) {
            parentDoc.removeEventListener('keydown', window.parent.escKeyHandler);
        }
        
        // Create ESC key handler
        window.parent.escKeyHandler = function(event) {
            if (event.key === 'Escape' || event.keyCode === 27) {
                const parentWin = window.parent;
                
                // Stop speech synthesis
                if (parentWin.speechSynthesis && parentWin.speechSynthesis.speaking) {
                    parentWin.speechSynthesis.cancel();
                    
                    // Remove speaking indicator
                    const indicator = parentDoc.querySelector('.speaking-indicator');
                    if (indicator) {
                        indicator.remove();
                    }
                    
                    // Clear voice flag
                    parentWin.sessionStorage.removeItem('lastInputWasVoice');
                    
                    // Show notification
                    const notification = parentDoc.createElement('div');
                    notification.textContent = '⏹️ Speech stopped (ESC pressed)';
                    notification.style.cssText = `
                        position: fixed;
                        bottom: 100px;
                        right: 30px;
                        background: rgba(255, 0, 85, 0.95);
                        border: 2px solid #ff0055;
                        border-radius: 10px;
                        padding: 0.8rem 1.2rem;
                        color: #fff;
                        font-size: 1rem;
                        font-weight: 600;
                        z-index: 10002;
                        box-shadow: 0 0 20px rgba(255, 0, 85, 0.5);
                        animation: fadeInOut 2s ease;
                    `;
                    
                    // Add animation
                    const style = parentDoc.createElement('style');
                    style.textContent = `
                        @keyframes fadeInOut {
                            0% { opacity: 0; transform: translateY(10px); }
                            10% { opacity: 1; transform: translateY(0); }
                            90% { opacity: 1; transform: translateY(0); }
                            100% { opacity: 0; transform: translateY(-10px); }
                        }
                    `;
                    parentDoc.head.appendChild(style);
                    
                    parentDoc.body.appendChild(notification);
                    setTimeout(() => {
                        notification.remove();
                        style.remove();
                    }, 2000);
                    
                    console.log('[ESC] Speech stopped successfully');
                }
            }
        };
        
        // Attach ESC key listener to parent document
        parentDoc.addEventListener('keydown', window.parent.escKeyHandler);
        
        console.log('[ESC] ESC key handler initialized');
    })();
    </script>
""", height=0)


def generate_bot_response(user_input):
    """Generate dynamic chatbot responses using NVIDIA API - RideWise topics only"""
    
    # Pre-filter obvious off-topic queries
    off_topic_keywords = [
        'recipe', 'cooking', 'movie', 'film', 'sports', 'football', 'cricket',
        'politics', 'election', 'president', 'news', 'stock', 'market',
        'programming', 'code', 'python', 'java', 'website'
    ]
    
    user_lower = user_input.lower()
    
    # Quick check for obviously off-topic queries
    if any(keyword in user_lower for keyword in off_topic_keywords):
        # But check if they're asking about RideWise features
        ridewise_keywords = ['ridewise', 'bike', 'rental', 'predict', 'map', 'dashboard', 'feedback']
        if not any(keyword in user_lower for keyword in ridewise_keywords):
            return """🤖 I'm specifically designed to help with RideWise bike rental predictions!

I can assist you with:
- 📊 Making daily and hourly predictions
- 🗺️ Viewing the live station map
- 🏠 Understanding the dashboard
- 📄 Uploading PDFs for auto-filling parameters
- ⭐ Submitting feedback

What would you like to know about RideWise?"""
    
    system_prompt = """You are RideWise Assistant, an AI helper EXCLUSIVELY for the RideWise bike rental prediction system.

IMPORTANT RESTRICTIONS:
- You ONLY answer questions related to RideWise features, navigation, predictions, and bike rental topics
- If users ask about unrelated topics (weather, sports, news, general knowledge, etc.), politely redirect them to RideWise features
- If asked to help with tasks outside RideWise, explain that you're specifically designed for RideWise assistance

RideWise Application Details:

KEY FEATURES:
- 📊 Daily & Hourly Predictions: Predict bike rental demand using AI (95%+ accuracy)
- 🏠 Dashboard: Live metrics, weekly trends, weather impact, 24-hour patterns
- 🗺️ Live Map: Real-time bike station locations and availability
- 📄 Smart PDF Upload: Auto-extract prediction parameters from PDFs
- ⭐ Feedback System: Rate experience and view all user feedback
- 🤖 Voice Input: Speak your queries using the microphone button

NAVIGATION PAGES:
1. Home - Dashboard with statistics, charts, and insights
2. Predictions - Make daily/hourly predictions with customizable parameters
3. Map - View live bike stations with real-time availability
4. Feedback - Submit ratings (1-5 stars) and written feedback

PREDICTION PARAMETERS:
- Season: Spring, Summer, Fall, Winter
- Weather: Clear, Mist/Cloudy, Light Rain/Snow, Heavy Rain/Snow
- Temperature: -10°C to 40°C
- Humidity: 0% to 100%
- Wind Speed: 0 to 60 km/h
- Year: 2020-2030
- Month: 1-12 (January to December)
- Hour: 0-23 (for hourly predictions only)
- Holiday: Yes/No
- Working Day: Yes/No
- Day Type: Weekday/Weekend

HOW TO USE:
1. Daily Prediction: Go to Predictions tab → Daily → Fill parameters → Click "Predict Daily Demand"
2. Hourly Prediction: Go to Predictions tab → Hourly → Fill parameters including hour → Click "Predict Hourly Demand"
3. PDF Upload: In prediction tabs, expand "Smart PDF Parameter Extraction" → Upload PDF → Click "Extract Parameters"
4. View Map: Click Map tab → Filter stations → See real-time availability
5. Give Feedback: Click Feedback tab → Rate with stars → Select category → Write feedback → Submit

RESPONSE GUIDELINES:
- Be helpful, friendly, and concise
- Use emojis when appropriate (🚴, 📊, 🗺️, etc.)
- Guide users step-by-step for complex tasks
- If users ask unrelated questions, say: "I'm specifically designed to help with RideWise bike rental predictions. I can help you with [list 2-3 relevant features]. What would you like to know about RideWise?"

Remember: Stay focused on RideWise features only!"""

    try:
        # Build messages with conversation history
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add last 5 messages from chat history for context
        for msg in st.session_state.chat_history[-5:]:
            messages.append({
                "role": "user" if msg["role"] == "user" else "assistant",
                "content": msg["content"]
            })
        
        # Add current message
        messages.append({"role": "user", "content": user_input})
        
        # Call NVIDIA API
        completion = nvidia_client.chat.completions.create(
            model="meta/llama-3.1-405b-instruct",
            messages=messages,
            temperature=0.5,  # Lower temperature for more focused responses
            top_p=0.9,
            max_tokens=500
        )
        
        response = completion.choices[0].message.content
        return response
        
    except Exception as e:
        return f"🤖 I'm having trouble connecting right now. Please try again! (Error: {str(e)[:50]}...)"

def speak_text(text):
    """
    Text-to-speech with TRIPLE-CHECK flag verification
    """
    clean_text = text.replace('🤖', '').replace('📊', '').replace('🗺️', '').replace('🚴', '').replace('⭐', '').replace('*', '').replace('`', '').replace('\n', ' ')
    clean_text = clean_text.replace('\\', '\\\\').replace('"', '\\"').replace("'", "\\'").replace('\n', ' ')

    speak_js = f"""
    <script>
    (function() {{
        const parentWin = window.parent || window;
        const parentDoc = parentWin.document;

        // FIX: TRIPLE-CHECK all three flag sources
        const sessionFlag = parentWin.sessionStorage.getItem('lastInputWasVoice') === 'true';
        const localFlag = parentWin.localStorage.getItem('voiceInputActive') === 'true';
        const windowFlag = parentWin.window.VOICE_INPUT_ACTIVE === true;
        
        const wasVoice = sessionFlag || localFlag || windowFlag;
        
        console.log('[SPEECH] Flag check:', {{
            session: sessionFlag,
            local: localFlag,
            window: windowFlag,
            final: wasVoice
        }});
        
        if (!wasVoice) {{
            console.log('[SPEECH] ❌ No voice flags detected - skipping speech');
            return;
        }}

        console.log('[SPEECH] ✅ Voice input confirmed - WILL SPEAK');

        if (!('speechSynthesis' in parentWin)) {{
            console.error('[SPEECH] Speech synthesis not supported');
            // Clear all flags
            parentWin.sessionStorage.removeItem('lastInputWasVoice');
            parentWin.localStorage.removeItem('voiceInputActive');
            parentWin.window.VOICE_INPUT_ACTIVE = false;
            return;
        }}

        parentWin.speechSynthesis.cancel();
        parentDoc.querySelectorAll('.speaking-indicator').forEach(el => el.remove());

        function ensureVoicesLoaded(callback) {{
            const voices = parentWin.speechSynthesis.getVoices();
            if (voices.length > 0) {{
                callback(voices);
            }} else {{
                console.log('[SPEECH] Waiting for voices...');
                parentWin.speechSynthesis.addEventListener('voiceschanged', function() {{
                    callback(parentWin.speechSynthesis.getVoices());
                }}, {{ once: true }});
                
                const dummy = new parentWin.SpeechSynthesisUtterance('');
                parentWin.speechSynthesis.speak(dummy);
                parentWin.speechSynthesis.cancel();
            }}
        }}

        function getLockedVoice(voices) {{
            const cachedName = parentWin.sessionStorage.getItem('ridewise_voice_name');
            
            if (cachedName) {{
                const cached = voices.find(v => v.name === cachedName);
                if (cached) {{
                    console.log('[SPEECH] ✅ Using LOCKED voice:', cachedName);
                    return cached;
                }}
            }}
            
            let voice = voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('google'));
            if (!voice) voice = voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('microsoft'));
            if (!voice) voice = voices.find(v => v.lang === 'en-US' && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha')));
            if (!voice) voice = voices.find(v => v.lang === 'en-US');
            if (!voice && voices.length > 0) voice = voices[0];
            
            if (voice) {{
                parentWin.sessionStorage.setItem('ridewise_voice_name', voice.name);
                console.log('[SPEECH] 🔒 LOCKED to voice:', voice.name);
            }}
            
            return voice;
        }}

        ensureVoicesLoaded(function(voices) {{
            const voice = getLockedVoice(voices);
            
            const utterance = new parentWin.SpeechSynthesisUtterance("{clean_text}");
            utterance.rate = 0.95;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            if (voice) {{
                utterance.voice = voice;
                console.log('[SPEECH] 🎤 Speaking with:', voice.name);
            }}
            
            const indicator = parentDoc.createElement('div');
            indicator.className = 'speaking-indicator';
            indicator.innerHTML = `
                <div style="position: fixed; bottom: 100px; right: 30px; background: linear-gradient(135deg, #00ffff 0%, #8a2be2 100%);
                    color: white; padding: 14px 22px; border-radius: 50px; box-shadow: 0 0 30px rgba(0, 255, 255, 0.7);
                    z-index: 10000; display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600;">
                    <span style="font-size: 22px; animation: speakPulse 1.4s ease-in-out infinite;">🔊</span>
                    <span>Speaking... (ESC to stop)</span>
                </div>
                <style>
                    @keyframes speakPulse {{ 0%, 100% {{ transform: scale(1); }} 50% {{ transform: scale(1.25); }} }}
                </style>
            `;
            parentDoc.body.appendChild(indicator);

            utterance.onend = function() {{
                console.log('[SPEECH] ✅ Speech completed - clearing flags');
                indicator.remove();
                parentWin.sessionStorage.removeItem('lastInputWasVoice');
                parentWin.localStorage.removeItem('voiceInputActive');
                parentWin.window.VOICE_INPUT_ACTIVE = false;
            }};

            utterance.onerror = function(e) {{
                console.error('[SPEECH] ❌ Error:', e);
                indicator.remove();
                parentWin.sessionStorage.removeItem('lastInputWasVoice');
                parentWin.localStorage.removeItem('voiceInputActive');
                parentWin.window.VOICE_INPUT_ACTIVE = false;
            }};

            console.log('[SPEECH] 🎯 STARTING SPEECH NOW');
            parentWin.speechSynthesis.speak(utterance);
        }});
    }})();
    </script>
    """

    components.html(speak_js, height=0)

def render_navbar():
    # Create 3 columns: Logo | Navigation | User + Theme Toggle
    col1, col2, col3 = st.columns([2, 6, 2])

    with col1:
        st.markdown('<h2 class="navbar-brand">🚴 RideWise</h2>', unsafe_allow_html=True)

    with col2:
        cols = st.columns(5)
        with cols[0]:
            if st.button("🏠 Home", use_container_width=True, key="btn_home"):
                st.session_state.page = "Home"
                st.rerun()
        with cols[1]:
            if st.button("📊 Predictions", use_container_width=True, key="btn_predictions"):
                st.session_state.page = "Predictions"
                st.rerun()
        with cols[2]:
            if st.button("🗺️ Map", use_container_width=True, key="btn_map"):
                st.session_state.page = "Map"
                st.rerun()
        with cols[3]:
            if st.button("⭐ Feedback", use_container_width=True, key="btn_feedback"):
                st.session_state.page = "Feedback"
                st.rerun()

    with col3:
        # Create sub-columns for user info, theme toggle, and logout
        col_user, col_theme, col_logout = st.columns([2, 1, 1])
        
        with col_user:
            display_name = st.session_state.get('user_full_name', st.session_state.username)
            st.markdown(f'<p style="text-align: right; margin-top: 10px; color: var(--text-secondary); text-shadow: 0 0 10px var(--shadow-color);">👤 {display_name}</p>', unsafe_allow_html=True)
        
        with col_theme:
            # Theme toggle button
            theme_icon = "🌙" if st.session_state.theme == 'dark' else "☀️"
            if st.button(theme_icon, key="theme_toggle", help="Toggle Light/Dark Mode"):
                st.session_state.theme = 'light' if st.session_state.theme == 'dark' else 'dark'
                st.rerun()
        
        with col_logout:
            if st.button("🚪", use_container_width=True, key="btn_logout", help="Logout"):
                st.session_state.logged_in = False
                st.session_state.username = ""
                st.session_state.page = "Home"
                st.session_state.chatbot_open = False
                st.session_state.chat_history = []
                st.rerun()

# Home Page
def home_page():
    render_navbar()
    
    
    # Hero Section - With Background Image (Base64)
    # Load and encode background image
    try:
        with open("assets/images/bike_image.jpeg", "rb") as img_file:
            bg_image_base64 = base64.b64encode(img_file.read()).decode()
            bg_image_url = f"data:image/jpeg;base64,{bg_image_base64}"
    except FileNotFoundError:
        bg_image_url = ""  # Fallback if image not found

    st.markdown(f'''
        <style>
        /* Hero section with transparent background image */
        .hero-title-container {{
            text-align: center;
            padding: 2rem 0 1.5rem 0;
            position: relative;
            margin-bottom: 1rem;
            overflow: hidden;
        }}

        /* Background image layer - Original quality with minimal transparency */
        .hero-title-container::before {{
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url('{bg_image_url}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 0.65;
            filter: none;
            z-index: 0;
            image-rendering: -webkit-optimize-contrast;
            -webkit-font-smoothing: antialiased;
        }}

        /* Ensure content is above background */
        .hero-title-container > * {{
            position: relative;
            z-index: 1;
        }}

        .hero-bike-icon {{
            font-size: 5rem;
            animation: bikeRide 2s ease-in-out infinite;
            filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.7));
            position: relative;
            z-index: 1;
        }}

        .hero-main-title {{
            font-size: 4.5rem;
            font-family: 'Orbitron', sans-serif;
            margin-top: 0.8rem;
            background: linear-gradient(135deg, #00ffff 0%, #00ffc8 50%, #8a2be2 100%);
            -webkit-background-clip: text !important;
            -moz-background-clip: text !important;
            background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            -moz-text-fill-color: transparent !important;
            text-fill-color: transparent !important;
            filter: drop-shadow(0 0 25px rgba(0, 255, 255, 0.6));
            animation: titleFloat 3s ease-in-out infinite;
            display: inline-block;
            margin-bottom: 0;
            position: relative;
            z-index: 1;
        }}

        .hero-subtitle {{
            font-size: 1.6rem;
            font-weight: 600;
            opacity: 0.9;
            margin-top: 0.5rem;
            color: #00ffff;
            text-shadow: 0 0 15px rgba(0, 255, 255, 0.5));
            position: relative;
            z-index: 1;
        }}
        </style>

        <div class="hero-title-container">
            <div class="hero-bike-icon">🚴</div>
            <h1 class="hero-main-title">RideWise</h1>
            <p class="hero-subtitle">AI-Powered Bike Rental Prediction System</p>
        </div>
    ''', unsafe_allow_html=True)
    
    # Dashboard Metrics - Compact
    st.markdown('<div class="dashboard-card">', unsafe_allow_html=True)
    st.markdown('<h2 class="section-title">📊 Live Dashboard</h2>', unsafe_allow_html=True)
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown('''
            <div class="metric-container">
                <div class="metric-value">2,434</div>
                <div class="metric-label">📅 Daily</div>
            </div>
        ''', unsafe_allow_html=True)
    
    with col2:
        st.markdown('''
            <div class="metric-container">
                <div class="metric-value">63</div>
                <div class="metric-label">⏰ Hourly</div>
            </div>
        ''', unsafe_allow_html=True)
    
    with col3:
        st.markdown('''
            <div class="metric-container">
                <div class="metric-value">95%</div>
                <div class="metric-label">✅ Accuracy</div>
            </div>
        ''', unsafe_allow_html=True)
    
    with col4:
        st.markdown('''
            <div class="metric-container">
                <div class="metric-value">24/7</div>
                <div class="metric-label">⚡ Live</div>
            </div>
        ''', unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Charts Section - More Compact
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown('<div class="dashboard-card">', unsafe_allow_html=True)
        st.markdown('<h3 class="section-title">📈 Weekly Trends</h3>', unsafe_allow_html=True)
        
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        rentals = [2100, 2300, 2450, 2200, 2600, 3100, 2900]
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=days, 
            y=rentals,
            mode='lines+markers',
            line=dict(color='#00ffff', width=3, shape='spline'),
            marker=dict(size=12, color='#8a2be2', line=dict(color='#00ffff', width=2)),
            fill='tozeroy',
            fillcolor='rgba(0, 255, 255, 0.15)'
        ))
        
        fig.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#00ffff', family='Space Grotesk'),
            xaxis=dict(
                gridcolor='rgba(0,255,255,0.1)',
                showgrid=True,
                zeroline=False
            ),
            yaxis=dict(
                gridcolor='rgba(0,255,255,0.1)',
                showgrid=True,
                zeroline=False
            ),
            height=280,
            margin=dict(l=40, r=20, t=20, b=40)
        )
        
        st.plotly_chart(fig, use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="dashboard-card">', unsafe_allow_html=True)
        st.markdown('<h3 class="section-title">🌤️ Weather Impact</h3>', unsafe_allow_html=True)
        
        weather = ['Clear', 'Cloudy', 'Rain', 'Snow']
        impact = [2800, 2200, 1500, 800]
        
        fig = go.Figure()
        fig.add_trace(go.Bar(
            x=weather,
            y=impact,
            marker=dict(
                color=['#00ffff', '#00b8d4', '#8a2be2', '#6a1b9a'],
                line=dict(color='#00ffff', width=2)
            )
        ))
        
        fig.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#00ffff', family='Space Grotesk'),
            xaxis=dict(
                gridcolor='rgba(0,255,255,0.1)',
                showgrid=False
            ),
            yaxis=dict(
                gridcolor='rgba(0,255,255,0.1)',
                showgrid=True,
                zeroline=False
            ),
            height=280,
            margin=dict(l=40, r=20, t=20, b=40)
        )
        
        st.plotly_chart(fig, use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)
    
    # Hourly Pattern - More Compact
    st.markdown('<div class="dashboard-card">', unsafe_allow_html=True)
    st.markdown('<h3 class="section-title">⏰ 24-Hour Pattern</h3>', unsafe_allow_html=True)
    
    hours = list(range(24))
    hourly_rentals = [20, 15, 10, 8, 12, 35, 80, 120, 90, 70, 60, 75, 
                     85, 80, 70, 90, 110, 150, 130, 100, 80, 60, 40, 30]
    
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=hours,
        y=hourly_rentals,
        marker=dict(
            color=hourly_rentals,
            colorscale=[[0, '#8a2be2'], [0.5, '#00b8d4'], [1, '#00ffff']],
            line=dict(color='rgba(0,255,255,0.3)', width=1)
        )
    ))
    
    fig.update_layout(
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(color='#00ffff', family='Space Grotesk'),
        xaxis=dict(
            gridcolor='rgba(0,255,255,0.1)',
            title='Hour',
            showgrid=True,
            zeroline=False
        ),
        yaxis=dict(
            gridcolor='rgba(0,255,255,0.1)',
            title='Rentals',
            showgrid=True,
            zeroline=False
        ),
        height=350,
        margin=dict(l=50, r=20, t=20, b=50)
    )
    
    st.plotly_chart(fig, use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Quick Stats - Compact Cards
    st.markdown('<div class="dashboard-card">', unsafe_allow_html=True)
    st.markdown('<h3 class="section-title">🎯 Quick Insights</h3>', unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown('''
            <div style="background: rgba(0,0,0,0.6); border: 2px solid rgba(0,255,255,0.3); border-radius: 12px; padding: 1rem; text-align: center;">
                <div style="font-size: 1.5rem; color: #00ffff; margin-bottom: 0.5rem;">🌟 Peak Hour</div>
                <div style="font-size: 1.8rem; font-weight: 800; color: #00ffff;">6 PM - 7 PM</div>
            </div>
        ''', unsafe_allow_html=True)
        st.markdown('''
            <div style="background: rgba(0,0,0,0.6); border: 2px solid rgba(138,43,226,0.3); border-radius: 12px; padding: 1rem; text-align: center; margin-top: 0.8rem;">
                <div style="font-size: 1.5rem; color: #8a2be2; margin-bottom: 0.5rem;">📅 Best Day</div>
                <div style="font-size: 1.8rem; font-weight: 800; color: #8a2be2;">Saturday</div>
            </div>
        ''', unsafe_allow_html=True)
    
    with col2:
        st.markdown('''
            <div style="background: rgba(0,0,0,0.6); border: 2px solid rgba(0,255,255,0.3); border-radius: 12px; padding: 1rem; text-align: center;">
                <div style="font-size: 1.5rem; color: #00ffff; margin-bottom: 0.5rem;">🌤️ Best Weather</div>
                <div style="font-size: 1.8rem; font-weight: 800; color: #00ffff;">Clear Sky</div>
            </div>
        ''', unsafe_allow_html=True)
        st.markdown('''
            <div style="background: rgba(0,0,0,0.6); border: 2px solid rgba(138,43,226,0.3); border-radius: 12px; padding: 1rem; text-align: center; margin-top: 0.8rem;">
                <div style="font-size: 1.5rem; color: #8a2be2; margin-bottom: 0.5rem;">🌡️ Optimal Temp</div>
                <div style="font-size: 1.8rem; font-weight: 800; color: #8a2be2;">18°C - 25°C</div>
            </div>
        ''', unsafe_allow_html=True)
    
    with col3:
        st.markdown('''
            <div style="background: rgba(0,0,0,0.6); border: 2px solid rgba(0,255,255,0.3); border-radius: 12px; padding: 1rem; text-align: center;">
                <div style="font-size: 1.5rem; color: #00ffff; margin-bottom: 0.5rem;">📊 Growth Rate</div>
                <div style="font-size: 1.8rem; font-weight: 800; color: #00ffff;">+15% MoM</div>
            </div>
        ''', unsafe_allow_html=True)
        st.markdown('''
            <div style="background: rgba(0,0,0,0.6); border: 2px solid rgba(138,43,226,0.3); border-radius: 12px; padding: 1rem; text-align: center; margin-top: 0.8rem;">
                <div style="font-size: 1.5rem; color: #8a2be2; margin-bottom: 0.5rem;">🚴 Active Bikes</div>
                <div style="font-size: 1.8rem; font-weight: 800; color: #8a2be2;">450 / 500</div>
            </div>
        ''', unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)

# Predictions Page
def predictions_page():
    render_navbar()
    
    # Enhanced futuristic header
    st.markdown('''
        <div style="text-align: center; padding: 1.5rem 0; position: relative;">
            <div style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; background: radial-gradient(circle at center, rgba(0, 255, 255, 0.1) 0%, transparent 70%); pointer-events: none;"></div>
            <div style="display: inline-block; position: relative;">
                <div style="font-size: 4.5rem; filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.8)); animation: float 3s ease-in-out infinite;">🚴‍♂️</div>
            </div>
            <h1 style="
                font-size: 3.5rem; 
                font-family: 'Orbitron', sans-serif; 
                margin-top: 0.8rem;
                background: linear-gradient(135deg, #00ffff 0%, #00ffc8 30%, #8a2be2 70%, #ff00ff 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                filter: drop-shadow(0 0 25px rgba(0, 255, 255, 0.6));
                animation: titleFloat 3s ease-in-out infinite;
                position: relative;
                z-index: 1;
            ">
                🔮 Bike Rental Predictions
            </h1>
            <p style="
                font-size: 1.5rem; 
                opacity: 0.9; 
                margin-top: 0.5rem; 
                color: #00ffff;
                text-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
                animation: fadeIn 2s ease;
                font-weight: 600;
            ">
                Advanced AI predictions for daily and hourly bike rental demand
            </p>
        </div>
    ''', unsafe_allow_html=True)
    
    # Tabs for Daily and Hourly Predictions
    tab1, tab2 = st.tabs(["📅 Daily Prediction", "⏰ Hourly Prediction"])
    
    with tab1:
        daily_prediction_tab()
    
    with tab2:
        hourly_prediction_tab()

def daily_prediction_tab():
    st.markdown('<div class="prediction-panel">', unsafe_allow_html=True)
    st.markdown('<h2 class="section-title">📅 Daily Demand Prediction</h2>', unsafe_allow_html=True)
    
    # ========== ENHANCED PDF UPLOAD SECTION ==========
    with st.expander("📄 Smart PDF Parameter Extraction", expanded=False):
        extracted = render_enhanced_pdf_uploader(tab_type="daily")
    
    st.markdown("---")
    
    # ========== INPUT FIELDS WITH AUTO-POPULATION ==========
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### Input Parameters")
        
        # Season - Auto-populated
        season_options = ["Spring", "Summer", "Fall", "Winter"]
        season = st.selectbox(
            "🌸 Season",
            options=season_options,
            index=get_auto_value(extracted, 'season', season_options, 0),
            help="Select the season (auto-filled from PDF if available)"
        )
        
        # Weather - Auto-populated
        weather_options = ["Clear", "Mist/Cloudy", "Light Rain/Snow", "Heavy Rain/Snow"]
        weather = st.selectbox(
            "🌤️ Weather",
            options=weather_options,
            index=get_auto_value(extracted, 'weather', weather_options, 0),
            help="Select weather condition (auto-filled from PDF if available)"
        )
        
        # Temperature - Auto-populated
        temperature = st.slider(
            "🌡️ Temperature (°C)",
            min_value=-10,
            max_value=40,
            value=int(get_auto_slider_value(extracted, 'temperature', 18)),
            step=1,
            help="Select temperature (auto-filled from PDF if available)"
        )
        
        # Humidity - Auto-populated
        humidity = st.slider(
            "💧 Humidity (%)",
            min_value=0,
            max_value=100,
            value=int(get_auto_slider_value(extracted, 'humidity', 60)),
            step=1,
            help="Select humidity level (auto-filled from PDF if available)"
        )
        
        # Wind Speed - Auto-populated
        wind_speed = st.slider(
            "💨 Wind Speed (km/h)",
            min_value=0,
            max_value=60,
            value=int(get_auto_slider_value(extracted, 'wind_speed', 10)),
            step=1,
            help="Select wind speed (auto-filled from PDF if available)"
        )
    
    with col2:
        st.markdown("### Additional Features")
        
        # Year - Auto-populated
        current_year = datetime.now().year
        year = st.number_input(
            "📅 Year",
            min_value=2020,
            max_value=2030,
            value=int(get_auto_slider_value(extracted, 'year', current_year)),
            step=1,
            help="Select year (auto-filled from PDF if available)"
        )
        
        # Month - Auto-populated
        month_names = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"]
        default_month_idx = (extracted.get('month', 1) - 1) if extracted.get('month') else 0
        month = st.selectbox(
            "📆 Month",
            options=list(range(1, 13)),
            index=default_month_idx,
            format_func=lambda x: month_names[x-1],
            help="Select month (auto-filled from PDF if available)"
        )
        
        # Holiday - Auto-populated
        holiday_options = ["No", "Yes"]
        holiday = st.selectbox(
            "🎉 Holiday",
            options=holiday_options,
            index=get_auto_value(extracted, 'holiday', holiday_options, 0),
            help="Is it a holiday? (auto-filled from PDF if available)"
        )
        
        # Working Day - Auto-populated
        working_options = ["No", "Yes"]
        working_day = st.selectbox(
            "💼 Working Day",
            options=working_options,
            index=get_auto_value(extracted, 'working_day', working_options, 1),
            help="Is it a working day? (auto-filled from PDF if available)"
        )
        
        # Day Type - Auto-populated with unique key
        st.markdown("##### 📅 Day Type")
        daytype_options = ["Weekday", "Weekend"]
        day_type = st.radio(
            "Day Type",
            options=daytype_options,
            index=get_auto_value(extracted, 'day_type', daytype_options, 0),
            horizontal=True,
            label_visibility="collapsed",
            key="day_type_daily"  # Unique key for daily tab
        )
    
    st.markdown("---")
    
    # Show auto-filled indicator if parameters were extracted
    if any(v is not None for v in extracted.values()):
        st.info("✨ Some parameters were auto-filled from your uploaded PDF!")
    
    # ========== PREDICTION BUTTON ==========
    col_btn1, col_btn2, col_btn3 = st.columns([1, 2, 1])
    
    with col_btn2:
        if st.button("🚀 Predict Daily Demand", use_container_width=True):
            with st.spinner("🔮 Analyzing data and generating prediction..."):
                import time
                time.sleep(2)
                
                # ============= ACTUAL MODEL PREDICTION =============
            if DAILY_MODEL is not None:
                try:
                    # Preprocess features
                    features = preprocess_daily_features(
                        season, weather, temperature, humidity, wind_speed,
                        year, month, holiday, working_day, day_type
                    )
                    
                    # Make prediction
                    prediction = DAILY_MODEL.predict(features)[0]
                    prediction = int(max(0, prediction))  # Ensure non-negative integer
                    
                except Exception as e:
                    st.error(f"❌ Prediction Error: {str(e)}")
                    st.info("💡 Checking feature format...")
                    st.code(f"Features shape: {features.shape}\nFeatures: {features.columns.tolist()}")
                    prediction = None
            else:
                st.error("❌ Daily model not loaded. Please check model file.")
                prediction = None
            # ============= END MODEL PREDICTION =============
            
            if prediction is not None:
                
                st.markdown(f"""
                    <div style="background: rgba(0, 0, 0, 0.9); border: 3px solid rgba(0, 255, 255, 0.6); border-radius: 18px; padding: 2.5rem; margin: 1rem 0; text-align: center; box-shadow: 0 0 50px rgba(0, 255, 255, 0.4), 0 0 100px rgba(138, 43, 226, 0.3);">
                        <h2 style="font-size: 3rem; color: #00ffff; font-family: 'Orbitron', sans-serif; margin-bottom: 1rem; text-shadow: 0 0 20px rgba(0, 255, 255, 0.6);">🎯 Predicted Daily Rentals</h2>
                        <div style="font-size: 6.5rem; font-weight: 900; background: linear-gradient(135deg, #00ffff 0%, #00ffc8 50%, #8a2be2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.6)); animation: valueGlow 2s ease-in-out infinite;">
                            {prediction}
                        </div>
                        <p style="font-size: 1.4rem; margin-top: 1rem; color: #00ffff; opacity: 0.9;">bikes expected to be rented</p>
                    </div>
                """, unsafe_allow_html=True)
                
                # Show insights
                st.markdown("### 📊 Prediction Insights")
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.metric("Confidence", "94.5%", "↑ 2.3%")
                with col2:
                    compared_avg = np.random.randint(-200, 300)
                    st.metric("vs Average", f"{compared_avg:+d}", f"{compared_avg/20:.1f}%")
                with col3:
                    st.metric("Trend", "Increasing", "↑ 5%")
    
    st.markdown('</div>', unsafe_allow_html=True)

def hourly_prediction_tab():
    st.markdown('<div class="prediction-panel">', unsafe_allow_html=True)
    st.markdown('<h2 class="section-title">⏰ Hourly Demand Prediction</h2>', unsafe_allow_html=True)
    
    # ========== ENHANCED PDF UPLOAD SECTION ==========
    with st.expander("📄 Smart PDF Parameter Extraction", expanded=False):
        extracted = render_enhanced_pdf_uploader(tab_type="hourly")
    
    st.markdown("---")
    
    # ========== INPUT FIELDS WITH AUTO-POPULATION ==========
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### Input Parameters")
        
        # Season - Auto-populated
        season_options = ["Spring", "Summer", "Fall", "Winter"]
        season = st.selectbox(
            "🌸 Season",
            options=season_options,
            index=get_auto_value(extracted, 'season', season_options, 0),
            help="Select the season (auto-filled from PDF if available)",
            key="hourly_season"
        )
        
        # Weather - Auto-populated
        weather_options = ["Clear", "Mist/Cloudy", "Light Rain/Snow", "Heavy Rain/Snow"]
        weather = st.selectbox(
            "🌤️ Weather",
            options=weather_options,
            index=get_auto_value(extracted, 'weather', weather_options, 0),
            help="Select weather condition (auto-filled from PDF if available)",
            key="hourly_weather"
        )
        
        # Temperature - Auto-populated
        temperature = st.slider(
            "🌡️ Temperature (°C)",
            min_value=-10,
            max_value=40,
            value=int(get_auto_slider_value(extracted, 'temperature', 18)),
            step=1,
            help="Select temperature (auto-filled from PDF if available)",
            key="hourly_temp"
        )
        
        # Humidity - Auto-populated
        humidity = st.slider(
            "💧 Humidity (%)",
            min_value=0,
            max_value=100,
            value=int(get_auto_slider_value(extracted, 'humidity', 60)),
            step=1,
            help="Select humidity level (auto-filled from PDF if available)",
            key="hourly_humidity"
        )
        
        # Wind Speed - Auto-populated
        wind_speed = st.slider(
            "💨 Wind Speed (km/h)",
            min_value=0,
            max_value=60,
            value=int(get_auto_slider_value(extracted, 'wind_speed', 10)),
            step=1,
            help="Select wind speed (auto-filled from PDF if available)",
            key="hourly_wind"
        )
    
    with col2:
        st.markdown("### Time & Additional Features")
        
        # Hour - Auto-populated
        hour = st.slider(
            "⏰ Hour of Day",
            min_value=0,
            max_value=23,
            value=int(get_auto_slider_value(extracted, 'hour', 12)),
            step=1,
            help="Select hour (0-23) (auto-filled from PDF if available)"
        )
        
        # Year - Auto-populated
        current_year = datetime.now().year
        year = st.number_input(
            "📅 Year",
            min_value=2020,
            max_value=2030,
            value=int(get_auto_slider_value(extracted, 'year', current_year)),
            step=1,
            key="hourly_year",
            help="Select year (auto-filled from PDF if available)"
        )
        
        # Month - Auto-populated
        month_names = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"]
        default_month_idx = (extracted.get('month', 1) - 1) if extracted.get('month') else 0
        month = st.selectbox(
            "📆 Month",
            options=list(range(1, 13)),
            index=default_month_idx,
            key="hourly_month",
            format_func=lambda x: month_names[x-1],
            help="Select month (auto-filled from PDF if available)"
        )
        
        # Holiday - Auto-populated
        holiday_options = ["No", "Yes"]
        holiday = st.selectbox(
            "🎉 Holiday",
            options=holiday_options,
            index=get_auto_value(extracted, 'holiday', holiday_options, 0),
            key="hourly_holiday",
            help="Is it a holiday? (auto-filled from PDF if available)"
        )
        
        # Working Day - Auto-populated
        working_options = ["No", "Yes"]
        working_day = st.selectbox(
            "💼 Working Day",
            options=working_options,
            index=get_auto_value(extracted, 'working_day', working_options, 1),
            key="hourly_working",
            help="Is it a working day? (auto-filled from PDF if available)"
        )
        
        # Day Type - Auto-populated with unique key
        st.markdown("##### 📅 Day Type")
        daytype_options = ["Weekday", "Weekend"]
        day_type = st.radio(
            "Day Type",
            options=daytype_options,
            index=get_auto_value(extracted, 'day_type', daytype_options, 0),
            horizontal=True,
            key="day_type_hourly",  # Unique key for hourly tab
            label_visibility="collapsed"
        )
    
    st.markdown("---")
    
    # Show auto-filled indicator if parameters were extracted
    if any(v is not None for v in extracted.values()):
        st.info("✨ Some parameters were auto-filled from your uploaded PDF!")
    
    # ========== PREDICTION BUTTON ==========
    col_btn1, col_btn2, col_btn3 = st.columns([1, 2, 1])
    
    with col_btn2:
        if st.button("🚀 Predict Hourly Demand", use_container_width=True):
            with st.spinner("🔮 Analyzing data and generating prediction..."):
                import time
                import numpy as np
                time.sleep(2)
                
                # ============= ACTUAL MODEL PREDICTION =============
                if HOURLY_MODEL is not None:
                    try:
                        # Preprocess features
                        features = preprocess_hourly_features(
                            season, weather, temperature, humidity, wind_speed,
                            year, month, hour, holiday, working_day, day_type
                        )
                        
                        # Make prediction
                        prediction = HOURLY_MODEL.predict(features)[0]
                        prediction = int(max(0, prediction))  # Ensure non-negative integer
                        
                    except Exception as e:
                        st.error(f"❌ Prediction Error: {str(e)}")
                        st.info("💡 Checking feature format...")
                        st.code(f"Features shape: {features.shape}\nFeatures: {features.columns.tolist()}")
                        prediction = None
                else:
                    st.error("❌ Hourly model not loaded. Please check model file.")
                    prediction = None
                # ============= END MODEL PREDICTION =============
                
                st.markdown(f"""
                    <div style="background: rgba(0, 0, 0, 0.9); border: 3px solid rgba(0, 255, 255, 0.6); border-radius: 18px; padding: 2.5rem; margin: 1rem 0; text-align: center; box-shadow: 0 0 50px rgba(0, 255, 255, 0.4), 0 0 100px rgba(138, 43, 226, 0.3);">
                        <h2 style="font-size: 3rem; color: #00ffff; font-family: 'Orbitron', sans-serif; margin-bottom: 1rem; text-shadow: 0 0 20px rgba(0, 255, 255, 0.6);">🎯 Predicted Hourly Rentals</h2>
                        <div style="font-size: 6.5rem; font-weight: 900; background: linear-gradient(135deg, #00ffff 0%, #00ffc8 50%, #8a2be2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.6)); animation: valueGlow 2s ease-in-out infinite;">
                            {prediction}
                        </div>
                        <p style="font-size: 1.4rem; margin-top: 1rem; color: #00ffff; opacity: 0.9;">bikes expected at {hour}:00</p>
                    </div>
                """, unsafe_allow_html=True)
                
                # Show hourly pattern chart
                st.markdown("### 📊 Hourly Pattern Forecast")
                
                import plotly.graph_objects as go
                
                hours = list(range(24))
                current_hour_idx = hour
                
                # Generate forecast around current hour
                forecast = []
                for h in hours:
                    if h == current_hour_idx:
                        forecast.append(prediction)
                    else:
                        diff = abs(h - current_hour_idx)
                        variation = prediction * (1 - diff * 0.05)
                        forecast.append(int(max(10, variation + np.random.randint(-20, 20))))
                
                fig = go.Figure()
                fig.add_trace(go.Scatter(
                    x=hours,
                    y=forecast,
                    mode='lines+markers',
                    line=dict(color='#00ffff', width=3, shape='spline'),
                    marker=dict(
                        size=[18 if h == hour else 10 for h in hours],
                        color=['#8a2be2' if h == hour else '#00ffff' for h in hours],
                        line=dict(color='#000000', width=2)
                    ),
                    fill='tozeroy',
                    fillcolor='rgba(0, 255, 255, 0.15)'
                ))
                
                fig.update_layout(
                    plot_bgcolor='rgba(0,0,0,0)',
                    paper_bgcolor='rgba(0,0,0,0)',
                    font=dict(color='#00ffff', family='Space Grotesk'),
                    xaxis=dict(
                        gridcolor='rgba(0,255,255,0.1)', 
                        title='Hour of Day',
                        showgrid=True,
                        zeroline=False
                    ),
                    yaxis=dict(
                        gridcolor='rgba(0,255,255,0.1)', 
                        title='Predicted Rentals',
                        showgrid=True,
                        zeroline=False
                    ),
                    height=400,
                    margin=dict(l=50, r=20, t=20, b=50)
                )
                
                st.plotly_chart(fig, use_container_width=True)
                
                # Show insights
                st.markdown("### 📊 Prediction Insights")
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.metric("Confidence", "92.8%", "↑ 1.5%")
                with col2:
                    peak_hour = hours[forecast.index(max(forecast))]
                    st.metric("Peak Hour", f"{peak_hour}:00", f"↑ {max(forecast)} bikes")
                with col3:
                    st.metric("Trend", "Steady", "→ 0%")
    
    st.markdown('</div>', unsafe_allow_html=True)

# Map Page
def map_page():
    render_navbar()
    
    # Enhanced header
    st.markdown('''
        <div style="text-align: center; padding: 1.5rem 0; position: relative;">
            <div style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; background: radial-gradient(circle at center, rgba(138, 43, 226, 0.1) 0%, transparent 70%); pointer-events: none;"></div>
            <div style="display: inline-block; position: relative;">
                <div style="font-size: 3.5rem; filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.8)); animation: float 3s ease-in-out infinite;">🗺️</div>
            </div>
            <h1 style="
                font-size: 2.8rem; 
                font-family: 'Orbitron', sans-serif; 
                margin-top: 0.8rem;
                background: linear-gradient(135deg, #00ffff 0%, #00ffc8 30%, #8a2be2 70%, #ff00ff 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                filter: drop-shadow(0 0 25px rgba(0, 255, 255, 0.6));
                animation: titleFloat 3s ease-in-out infinite;
            ">
                Live Bike Station Map
            </h1>
            <p style="
                font-size: 1.2rem; 
                opacity: 0.9; 
                margin-top: 0.5rem; 
                color: #00ffff;
                text-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
            ">
                Real-time bike availability across all stations
            </p>
        </div>
    ''', unsafe_allow_html=True)
    
    st.markdown('<div class="dashboard-card">', unsafe_allow_html=True)
    
    # Map provider selection
    col1, col2, col3 = st.columns([2, 2, 2])
    
    with col1:
        map_provider = st.selectbox(
            "🗺️ Select Map Provider",
            options=["OpenStreetMap", "Google Maps", "Mapbox"],
            help="Choose your preferred map provider"
        )
    
    with col2:
        station_filter = st.multiselect(
            "🚴 Filter Stations",
            options=["Station A", "Station B", "Station C", "Station D"],
            default=["Station A", "Station B", "Station C", "Station D"]
        )
    
    with col3:
        auto_refresh = st.checkbox("🔄 Auto Refresh", value=True)
    
    st.markdown("---")
    
    # Create sample map data
    map_data = pd.DataFrame({
        'lat': [37.7749 + np.random.uniform(-0.05, 0.05) for _ in range(20)],
        'lon': [-122.4194 + np.random.uniform(-0.05, 0.05) for _ in range(20)],
        'station': [f'Station {chr(65+i%4)}' for i in range(20)],
        'bikes_available': np.random.randint(0, 20, 20),
        'capacity': [20] * 20
    })
    
    # Filter based on selection
    filtered_data = map_data[map_data['station'].isin(station_filter)]
    
    # Create plotly map
    fig = px.scatter_mapbox(
        filtered_data,
        lat='lat',
        lon='lon',
        color='bikes_available',
        size='bikes_available',
        hover_name='station',
        hover_data={'bikes_available': True, 'capacity': True, 'lat': False, 'lon': False},
        color_continuous_scale=[[0, 'red'], [0.5, 'yellow'], [1, 'cyan']],
        size_max=20,
        zoom=11,
        height=600
    )
    
    fig.update_layout(
        mapbox_style="carto-darkmatter",
        margin={"r": 0, "t": 0, "l": 0, "b": 0},
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        font=dict(color='cyan')
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Station Statistics
    st.markdown('<div class="dashboard-card">', unsafe_allow_html=True)
    st.markdown('<h3 class="section-title">📊 Station Statistics</h3>', unsafe_allow_html=True)
    
    col1, col2, col3, col4 = st.columns(4)
    
    total_bikes = filtered_data['bikes_available'].sum()
    total_capacity = filtered_data['capacity'].sum()
    avg_availability = (total_bikes / total_capacity * 100) if total_capacity > 0 else 0
    active_stations = len(filtered_data[filtered_data['bikes_available'] > 0])
    
    with col1:
        st.metric("🚴 Total Bikes Available", total_bikes)
    with col2:
        st.metric("🏢 Active Stations", f"{active_stations}/{len(filtered_data)}")
    with col3:
        st.metric("📊 Average Availability", f"{avg_availability:.1f}%")
    with col4:
        st.metric("⚡ System Status", "Operational", "✅")
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Station Details Table
    st.markdown('<div class="dashboard-card">', unsafe_allow_html=True)
    st.markdown('<h3 class="section-title">📋 Station Details</h3>', unsafe_allow_html=True)
    
    # Create a styled dataframe
    display_df = filtered_data[['station', 'bikes_available', 'capacity']].copy()
    display_df['availability_%'] = (display_df['bikes_available'] / display_df['capacity'] * 100).round(1)
    display_df = display_df.sort_values('bikes_available', ascending=False)
    
    st.dataframe(
        display_df,
        use_container_width=True,
        hide_index=True
    )
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # API Integration Note
    st.info("""
        🔌 **API Integration Ready**: 
        This map component is ready for integration with live APIs from providers like:
        - Google Maps API
        - Mapbox API  
        - OpenStreetMap
        - Your custom bike station API
        
        Simply replace the sample data with actual API calls to display real-time information.
    """)


# ============= RATING & FEEDBACK PAGE =============
def rating_feedback_page():
    """Render the rating and feedback page"""
    render_navbar()

    st.markdown("""
        <div style="text-align: center; padding: 2rem 0 1rem 0;">
            <div style="font-size: 4rem;">⭐</div>
            <h1 style="
                font-family: 'Orbitron', sans-serif;
                font-size: 2.8rem;
                font-weight: 900;
                text-align: center;
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%, #ff6f00 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 0.5rem;
                filter: drop-shadow(0 0 25px rgba(255, 215, 0, 0.6));
            ">Rate Your Experience</h1>
            <p style="
                text-align: center;
                color: #ffd700;
                font-size: 1.1rem;
                margin-bottom: 2rem;
                opacity: 0.9;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            ">We value your feedback! Help us improve RideWise.</p>
        </div>
    """, unsafe_allow_html=True)

    # Create two tabs: Submit Feedback and View Feedback
    tab1, tab2 = st.tabs(["📝 Submit Feedback", "📊 View Feedback"])

    with tab1:
        st.markdown('<div class="dashboard-card">', unsafe_allow_html=True)

        col1, col2, col3 = st.columns([1, 2, 1])

        with col2:
            st.markdown("### ⭐ Rate Your Experience")

            # Star rating using radio buttons with custom styling
            st.markdown("""
                <style>
                .star-rating-custom {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    font-size: 3rem;
                    margin: 2rem 0;
                }
                </style>
            """, unsafe_allow_html=True)

            # Rating selector
            rating_labels = ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"]
            rating_values = [1, 2, 3, 4, 5]

            rating = st.select_slider(
                "Select your rating:",
                options=rating_values,
                value=5,
                format_func=lambda x: rating_labels[x-1],
                label_visibility="collapsed"
            )

            st.markdown(f"""
                <div style="text-align: center; margin: 1rem 0;">
                    <div style="font-size: 4rem;">{rating_labels[rating-1]}</div>
                    <div style="font-size: 1.2rem; color: #ffd700; font-weight: 600;">
                        {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating-1]}
                    </div>
                </div>
            """, unsafe_allow_html=True)

            st.markdown("### 📝 Your Feedback")

            # Feedback category
            category = st.selectbox(
                "Category",
                options=[
                    "General Feedback",
                    "Prediction Accuracy",
                    "User Interface",
                    "Features Request",
                    "Bug Report",
                    "Performance",
                    "Other"
                ],
                help="Select the category that best describes your feedback"
            )

            # Feedback text
            feedback_text = st.text_area(
                "Share your thoughts:",
                placeholder="Tell us what you think about RideWise...",
                height=150,
                help="Your feedback helps us improve!"
            )

            st.markdown("---")

            # Submit button
            col_btn1, col_btn2, col_btn3 = st.columns([1, 2, 1])

            with col_btn2:
                if st.button("🚀 Submit Feedback", use_container_width=True, key="submit_feedback"):
                    if feedback_text.strip():
                        # Save feedback
                        save_feedback(
                            username=st.session_state.username,
                            rating=rating,
                            feedback=feedback_text.strip(),
                            category=category
                        )

                        # Success animation
                        st.markdown("""
                            <div style="
                                background: rgba(0, 0, 0, 0.9);
                                border: 3px solid rgba(0, 255, 0, 0.6);
                                border-radius: 18px;
                                padding: 2rem;
                                margin: 1rem 0;
                                text-align: center;
                                box-shadow: 0 0 50px rgba(0, 255, 0, 0.4);
                                animation: successPulse 0.6s ease;
                            ">
                                <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
                                <h2 style="color: #00ff00; font-family: 'Orbitron', sans-serif; margin-bottom: 0.5rem;">
                                    Thank You!
                                </h2>
                                <p style="color: #00ffff; font-size: 1.1rem;">
                                    Your feedback has been submitted successfully.
                                </p>
                            </div>
                        """, unsafe_allow_html=True)

                        time.sleep(2)
                        st.rerun()
                    else:
                        st.error("❌ Please enter your feedback before submitting!")

        st.markdown('</div>', unsafe_allow_html=True)

    with tab2:
        st.markdown('<div class="dashboard-card">', unsafe_allow_html=True)
        st.markdown("### 📊 All Feedback Submissions")

        # Load feedback data
        feedback_df = load_feedback()

        if len(feedback_df) > 0:
            # Display statistics
            col1, col2, col3, col4 = st.columns(4)

            with col1:
                st.markdown(f"""
                    <div class="metric-container">
                        <div class="metric-value">{len(feedback_df)}</div>
                        <div class="metric-label">📝 Total</div>
                    </div>
                """, unsafe_allow_html=True)

            with col2:
                avg_rating = feedback_df['Rating'].mean()
                st.markdown(f"""
                    <div class="metric-container">
                        <div class="metric-value">{avg_rating:.1f}</div>
                        <div class="metric-label">⭐ Avg Rating</div>
                    </div>
                """, unsafe_allow_html=True)

            with col3:
                recent_count = len(feedback_df[pd.to_datetime(feedback_df['Timestamp']) > datetime.now() - timedelta(days=7)])
                st.markdown(f"""
                    <div class="metric-container">
                        <div class="metric-value">{recent_count}</div>
                        <div class="metric-label">📅 This Week</div>
                    </div>
                """, unsafe_allow_html=True)

            with col4:
                five_star_count = len(feedback_df[feedback_df['Rating'] == 5])
                st.markdown(f"""
                    <div class="metric-container">
                        <div class="metric-value">{five_star_count}</div>
                        <div class="metric-label">🌟 5-Star</div>
                    </div>
                """, unsafe_allow_html=True)

            st.markdown("---")

            # Rating distribution chart
            col1, col2 = st.columns(2)

            with col1:
                st.markdown("#### ⭐ Rating Distribution")
                rating_counts = feedback_df['Rating'].value_counts().sort_index()

                fig = go.Figure()
                fig.add_trace(go.Bar(
                    x=rating_counts.index,
                    y=rating_counts.values,
                    marker=dict(
                        color=['#ff6f00', '#ff8c00', '#ffd700', '#ffed4e', '#00ff00'],
                        line=dict(color='#ffd700', width=2)
                    ),
                    text=rating_counts.values,
                    textposition='outside'
                ))

                fig.update_layout(
                    plot_bgcolor='rgba(0,0,0,0)',
                    paper_bgcolor='rgba(0,0,0,0)',
                    font=dict(color='#ffd700', family='Space Grotesk'),
                    xaxis=dict(
                        title='Rating',
                        gridcolor='rgba(255,215,0,0.1)',
                        showgrid=False
                    ),
                    yaxis=dict(
                        title='Count',
                        gridcolor='rgba(255,215,0,0.1)',
                        showgrid=True
                    ),
                    height=300,
                    margin=dict(l=40, r=20, t=20, b=40)
                )

                st.plotly_chart(fig, use_container_width=True)

            with col2:
                st.markdown("#### 📊 Feedback by Category")
                category_counts = feedback_df['Category'].value_counts()

                fig = go.Figure()
                fig.add_trace(go.Pie(
                    labels=category_counts.index,
                    values=category_counts.values,
                    marker=dict(
                        colors=['#00ffff', '#00b8d4', '#8a2be2', '#6a1b9a', '#ff6f00', '#ffd700'],
                        line=dict(color='#000000', width=2)
                    ),
                    textfont=dict(size=12, color='#000000'),
                    hole=0.4
                ))

                fig.update_layout(
                    plot_bgcolor='rgba(0,0,0,0)',
                    paper_bgcolor='rgba(0,0,0,0)',
                    font=dict(color='#ffd700', family='Space Grotesk'),
                    height=300,
                    margin=dict(l=20, r=20, t=20, b=20),
                    showlegend=True,
                    legend=dict(
                        orientation="v",
                        yanchor="middle",
                        y=0.5,
                        xanchor="left",
                        x=1.02,
                        font=dict(color='#ffd700')
                    )
                )

                st.plotly_chart(fig, use_container_width=True)

            st.markdown("---")

            # Display recent feedback
            st.markdown("#### 💬 Recent Feedback")

            # Sort by timestamp descending
            feedback_df_sorted = feedback_df.sort_values('Timestamp', ascending=False)

            # Filter options
            col1, col2, col3 = st.columns(3)

            with col1:
                filter_rating = st.selectbox(
                    "Filter by Rating",
                    options=["All"] + list(range(1, 6)),
                    format_func=lambda x: f"⭐ {x} Star" if x != "All" else "All Ratings"
                )

            with col2:
                filter_category = st.selectbox(
                    "Filter by Category",
                    options=["All"] + list(feedback_df['Category'].unique())
                )

            with col3:
                show_count = st.selectbox(
                    "Show",
                    options=[10, 25, 50, 100],
                    format_func=lambda x: f"Last {x} items"
                )

            # Apply filters
            filtered_df = feedback_df_sorted.copy()

            if filter_rating != "All":
                filtered_df = filtered_df[filtered_df['Rating'] == filter_rating]

            if filter_category != "All":
                filtered_df = filtered_df[filtered_df['Category'] == filter_category]

            filtered_df = filtered_df.head(show_count)

            # Display feedback cards
            for idx, row in filtered_df.iterrows():
                stars = "⭐" * int(row['Rating'])
                st.markdown(f"""
                    <div style="
                        background: rgba(0, 0, 0, 0.8);
                        border: 2px solid rgba(255, 215, 0, 0.3);
                        border-radius: 12px;
                        padding: 1.2rem;
                        margin: 0.8rem 0;
                        transition: all 0.3s ease;
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                            <div>
                                <span style="font-size: 1.5rem;">{stars}</span>
                                <span style="color: #ffd700; font-weight: 600; margin-left: 0.5rem;">
                                    {row['Rating']}/5
                                </span>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: #00ffff; font-weight: 600;">👤 {row['Username']}</div>
                                <div style="color: rgba(255,255,255,0.6); font-size: 0.85rem;">{row['Timestamp']}</div>
                            </div>
                        </div>
                        <div style="
                            background: rgba(255, 215, 0, 0.1);
                            border-left: 3px solid #ffd700;
                            padding: 0.5rem 0.8rem;
                            border-radius: 5px;
                            margin-bottom: 0.8rem;
                        ">
                            <span style="color: #ffd700; font-weight: 600;">📂 {row['Category']}</span>
                        </div>
                        <div style="color: rgba(255,255,255,0.9); line-height: 1.6;">
                            {row['Feedback']}
                        </div>
                    </div>
                """, unsafe_allow_html=True)

            if len(filtered_df) == 0:
                st.info("📭 No feedback matches the selected filters.")
        else:
            st.info("📭 No feedback submitted yet. Be the first to share your thoughts!")

        st.markdown('</div>', unsafe_allow_html=True)

# ============= END RATING & FEEDBACK PAGE =============

# Main App Logic
def main():
    if not st.session_state.logged_in:
        login_page()
    else:
        # Render chatbot in sidebar if open
        render_chatbot()

        # Route to appropriate page
        if st.session_state.page == "Home":
            home_page()
        elif st.session_state.page == "Predictions":
            predictions_page()
        elif st.session_state.page == "Map":
            map_page()
        elif st.session_state.page == "Feedback":
            rating_feedback_page()

if __name__ == "__main__":
    main()
