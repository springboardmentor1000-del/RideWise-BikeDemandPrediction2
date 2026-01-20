import numpy as np
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
import joblib
from django.conf import settings
import os
from .forms import DayPredictionForm, HourPredictionForm
from datetime import datetime
from django.http import HttpResponse
from .models import Reservation
from django.template.loader import render_to_string
# predictor/views.py (Add these imports and function)
import io
from django.http import FileResponse
from reportlab.pdfgen import canvas
from django.shortcuts import get_object_or_404

import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Review

import requests


# NEW: Loading the model object directly as saved by your training script
day_model = joblib.load("predictor/models/bike_demand_day_model.pkl")
hour_model = joblib.load("predictor/models/bike_demand_hour_model.pkl")



def home(request):
    # If the user is already logged in, send them to the dashboard instead of the landing page
    if request.user.is_authenticated:
        return redirect('dashboard')
    # If not logged in, show the landing page (hero section with slideshow)
    return render(request, 'predictor/home.html')


def login_view(request):
    if request.method == 'POST':
        user = authenticate(
            request,
            username=request.POST['username'],
            password=request.POST['password']
        )
        if user:
            login(request, user)
            return redirect('dashboard')
    return render(request, 'predictor/login.html')


def logout_view(request):
    logout(request)
    return redirect('home')

def signup_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        confirm_password = request.POST['confirm_password']

        # 1. Check if passwords match
        if password != confirm_password:
            return render(request, 'predictor/signup.html', {'error': 'Passwords do not match'})

        # 2. Check if username already exists
        if User.objects.filter(username=username).exists():
            return render(request, 'predictor/signup.html', {'error': 'Username already taken'})

        # 3. Create user with email
        User.objects.create_user(username=username, email=email, password=password)
        return redirect('login')
        
    return render(request, 'predictor/signup.html')


@login_required
def dashboard(request):
    # Fetch all reservations for the logged-in user
    reservations = Reservation.objects.filter(user=request.user).order_some_by('-created_at')
    return render(request, 'predictor/dashboard.html', {
        'reservations': reservations
    })

@login_required
def download_slip(request, reservation_id):
    # Get the specific reservation
    res = get_object_or_404(Reservation, id=reservation_id, user=request.user)
    
    # Create a file-like buffer to receive PDF data
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer)

    # Header
    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, 800, "🚲 RideWise Reservation Slip")
    
    # Reservation Details
    p.setFont("Helvetica", 12)
    p.drawString(100, 750, f"Reservation ID: #RW-{res.id}")
    p.drawString(100, 730, f"Customer: {res.user.username}")
    p.drawString(100, 710, f"Station: {res.station}")
    p.drawString(100, 690, f"Date: {res.date}")
    p.drawString(100, 670, f"Time: {res.time}")
    p.drawString(100, 650, f"Duration: {res.duration} Hours")
    p.drawString(100, 630, f"Number of Bikes: {res.num_bikes}")
    p.drawString(100, 610, f"Total Amount: ₹{res.total_amount}")

    # Footer
    p.drawString(100, 550, "Thank you for riding with RideWise!")

    p.showPage()
    p.save()

    buffer.seek(0)
    return FileResponse(buffer, as_attachment=True, filename=f"slip_{res.id}.pdf") #

@login_required
def predict_selection(request):
    return render(request, 'predictor/predict.html')

@login_required
def book_day(request):
    prediction = None
    if request.method == "POST":
        try:
            date_obj = datetime.strptime(request.POST["date"], "%Y-%m-%d")

            # 1. Collect inputs
            season = int(request.POST["season"])
            weathersit = int(request.POST["weathersit"])
            temp = float(request.POST["temp"])
            hum = float(request.POST["hum"])
            windspeed = float(request.POST["windspeed"])
            weekday = date_obj.weekday()

            features = [
                season,                  # season
                date_obj.year - 2011,   # yr
                date_obj.month,          # mnth
                0,                       # holiday
                weekday,                 # weekday
                1 if weekday < 5 else 0, # workingday
                weathersit,              # weathersit
                temp,                    # temp
                temp,                    # atemp
                hum,                     # hum
                windspeed,               # windspeed
                weekday,                 # weekday_num
                1 if weekday >= 5 else 0 # is_weekend
            ]

            model_input = np.array([features])
            prediction = int(max(0, day_model.predict(model_input)[0]))
        except Exception as e:
            return render(request, "predictor/book_day.html", {"error": f"Error: {e}"})

    return render(request, "predictor/book_day.html", {"prediction": prediction})


# predictor/views.py

# predictor/views.py

@login_required
def book_hour(request):
    prediction = None
    if request.method == 'POST':
        try:
            date_str = request.POST.get('date')
            hour = int(request.POST.get('hour'))
            season = int(request.POST.get('season'))
            weathersit = int(request.POST.get('weathersit'))
            temp = float(request.POST.get('temp'))
            hum = float(request.POST.get('hum'))
            windspeed = float(request.POST.get('windspeed'))
            
            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
            weekday = date_obj.weekday()
            
            input_features = [
                season,                  # season
                date_obj.year - 2011,   # yr
                date_obj.month,          # mnth
                hour,                    # hr
                0,                       # holiday
                weekday,                 # weekday
                1 if weekday < 5 else 0, # workingday
                weathersit,              # weathersit
                temp,                    # temp
                temp,                    # atemp
                hum,                     # hum
                windspeed,               # windspeed
                weekday,                 # weekday_num
                1 if weekday >= 5 else 0 # is_weekend
            ]
            
            # Ensure shape is (1, 14) or (1, 15) as required by XGBoost
            prediction_raw = hour_model.predict(np.array([input_features]))[0]
            prediction = int(max(0, prediction_raw))
            
        except Exception as e:
            return render(request, 'predictor/book_hour.html', {'error': f"Prediction error: {e}"})

    return render(request, 'predictor/book_hour.html', {'prediction': prediction})


def fetch_weather_data(request):
    date_str = request.GET.get('date')
    lat = request.GET.get('lat')
    lon = request.GET.get('lon')
    
    API_KEY = os.getenv("OPENWEATHER_API_KEY")
    
    # Use coordinates if provided, otherwise fallback to a default city
    if lat and lon:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    else:
        url = f"https://api.openweathermap.org/data/2.5/weather?q=London&appid={API_KEY}&units=metric"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if response.status_code != 200:
            return JsonResponse({"error": "Weather data unavailable"}, status=400)

        # Mapping Month to Season
        month = datetime.strptime(date_str, "%Y-%m-%d").month
        season_map = {12: 4, 1: 4, 2: 4, 3: 1, 4: 1, 5: 1, 6: 2, 7: 2, 8: 2, 9: 3, 10: 3, 11: 3}
        
        # Weather situation mapping
        weather_main = data['weather'][0]['main']
        weathersit = 1 # Clear
        if "Cloud" in weather_main or "Mist" in weather_main:
            weathersit = 2
        elif "Rain" in weather_main or "Snow" in weather_main:
            weathersit = 3

        return JsonResponse({
            "temp": data['main']['temp'],
            "hum": data['main']['humidity'],
            "windspeed": data['wind']['speed'],
            "weathersit": weathersit,
            "season": season_map.get(month, 1)
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# predictor/views.py
@login_required
def station_map(request):
    return render(request, 'predictor/stations.html')

@login_required
def reservation_view(request):
    if request.method == 'POST':
        station = request.POST.get('station')
        date = request.POST.get('date')
        time = request.POST.get('time')
        # Force a maximum of 24 hours
        duration = min(int(request.POST.get('duration')), 24)
        num_bikes = int(request.POST.get('num_bikes'))
        
        # Backend Tiered Pricing Logic
        if duration >= 24:
            base_price = 250
        elif duration >= 12:
            base_price = 200
        elif duration >= 6:
            base_price = 120
        else:
            base_price = 50 * duration
            
        total_amount = base_price * num_bikes
        
        Reservation.objects.create(
            user=request.user,
            station=station,
            date=date,
            time=time,
            duration=duration,
            num_bikes=num_bikes,
            total_amount=total_amount
        )
        return redirect('dashboard')

    return render(request, 'predictor/reservation.html')

    
# Add this to handle Dashboard display
@login_required
def dashboard(request):
    user_reservations = Reservation.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'predictor/dashboard.html', {'reservations': user_reservations})

def about(request):
    return render(request, 'predictor/about.html')

@login_required
def reviews(request):
    if request.method == 'POST':
        comment = request.POST.get('comment')
        if comment:
            Review.objects.create(user=request.user, comment=comment)
            return redirect('reviews')

    all_reviews = Review.objects.all().order_by('-created_at')
    return render(request, 'predictor/reviews.html', {'reviews': all_reviews})


@login_required
def profile(request):
    return render(request, 'predictor/profile.html')

#parser api
from django.http import JsonResponse
from .utils import extract_bike_data
import io

def extract_pdf_api(request):
    if request.method == 'POST' and request.FILES.get('pdf_file'):
        try:
            pdf_file = request.FILES['pdf_file']
            pdf_content = io.BytesIO(pdf_file.read())
            
            # Use your utility function to extract values
            from .utils import extract_bike_data
            extracted_data = extract_bike_data(pdf_content)
            
            return JsonResponse(extracted_data)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=400)

#chatbot
import requests
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

# predictor/views.py
# predictor/views.py

@csrf_exempt
def gemini_chat(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_message = data.get("message", "")
            api_key = settings.GEMINI_API_KEY
            
            # UPDATED URL: Using gemini-2.0-flash which is the current standard
            # Change this line in your gemini_chat function:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={api_key}"
            
            system_prompt = """
            You are the official RideWise Assistant. You only answer questions about the RideWise platform.
            RideWise is a bike-demand prediction and trip planning service.
            
            Key Features of RideWise:
            1. Prediction: We use machine learning to predict bike availability and demand.
            2. Trip Planning: Users can enter pickup and destination to plan bike routes.
            3. Management: Users can view history and payments in the 'Account' menu.
            
            Guidelines:
            - Be brief and helpful.
            - If a user asks something unrelated to bikes or RideWise, politely redirect them.
            - Mention specific website UI elements like 'Search bars' or 'Menu icon'.
            """

            payload = {
                "system_instruction": {
                    "parts": [{"text": system_prompt}]
                },
                "contents": [
                    {
                        "parts": [{"text": user_message}]
                    }
                ]
            }

            response = requests.post(url, headers={'Content-Type': 'application/json'}, json=payload)
            response_data = response.json()

            # predictor/views.py (around line 228)

            if response.status_code == 200:
                bot_reply = response_data['candidates'][0]['content']['parts'][0]['text']
                return JsonResponse({"reply": bot_reply})
            elif response.status_code == 429:
                # This specifically handles the Quota Exceeded error
                return JsonResponse({"reply": "I'm resting for a moment. Please wait about 30 seconds before asking again!"})
            else:
                print(f"!!! GOOGLE API ERROR ({response.status_code}): {response_data}")
                return JsonResponse({"reply": "I am experiencing a service connection issue."})

        except Exception as e:
            print(f"!!! SYSTEM ERROR: {str(e)}")
            return JsonResponse({"reply": "Internal system error."})