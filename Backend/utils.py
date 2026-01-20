import pdfplumber
import re

def extract_bike_data(pdf_content):
    data = {}
    try:
        with pdfplumber.open(pdf_content) as pdf:
            text = pdf.pages[0].extract_text()
            
            # 1. Date (YYYY-MM-DD)
            date_m = re.search(r'date\s*[:\-]?\s*(\d{4}-\d{2}-\d{2})', text, re.IGNORECASE)
            if date_m: data['date'] = date_m.group(1)

            # 2. Season Mapping (PDF Word -> Form Number)
            season_m = re.search(r'season\s*[:\-]?\s*(\w+)', text, re.IGNORECASE)
            if season_m:
                s_map = {"spring": 1, "summer": 2, "fall": 3, "winter": 4}
                data['season'] = s_map.get(season_m.group(1).lower(), 1)

            # 3. Weather Mapping (PDF Word -> Form Number)
            weather_m = re.search(r'weather\s*[:\-]?\s*(\w+)', text, re.IGNORECASE)
            if weather_m:
                w_map = {"clear": 1, "mist": 2, "rain": 3, "snow": 4}
                data['weathersit'] = w_map.get(weather_m.group(1).lower(), 1)

            # 4. Numeric Values
            temp_m = re.search(r'temp(?:erature)?\s*[:\-]?\s*(\d+\.?\d*)', text, re.IGNORECASE)
            hum_m = re.search(r'hum(?:idity)?\s*[:\-]?\s*(\d+\.?\d*)', text, re.IGNORECASE)
            wind_m = re.search(r'wind(?:speed)?\s*[:\-]?\s*(\d+\.?\d*)', text, re.IGNORECASE)
            hour_m = re.search(r'hour\s*[:\-]?\s*(\d+)', text, re.IGNORECASE)

            if temp_m: data['temp'] = float(temp_m.group(1))
            if hum_m: data['hum'] = float(hum_m.group(1))
            if wind_m: data['windspeed'] = float(wind_m.group(1))
            if hour_m: data['hour'] = int(hour_m.group(1))

    except Exception as e:
        return {"error": str(e)}
    return data