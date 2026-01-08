import pandas as pd
import pickle
import os

from feature_engineering import (
    prepare_day_features,
    prepare_hour_features
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DAY_MODEL_PATH = os.path.join(BASE_DIR, "models", "lightGBM_day_model.pkl")
HOUR_MODEL_PATH = os.path.join(BASE_DIR, "models", "lightGBM_hour_model.pkl")

DAY_DATA_PATH = os.path.join(BASE_DIR, "data", "day.csv")
HOUR_DATA_PATH = os.path.join(BASE_DIR, "data", "hour.csv")


# ===============================
# LOAD MODELS
# ===============================
with open(DAY_MODEL_PATH, "rb") as f:
    day_model = pickle.load(f)

with open(HOUR_MODEL_PATH, "rb") as f:
    hour_model = pickle.load(f)

print("✅ Models loaded successfully")


# ===============================
# DAILY PREDICTION (WINDOW-BASED)
# ===============================
def predict_daily(features: dict) -> int:
    df = pd.read_csv(DAY_DATA_PATH)

    # 🔑 Take last 8 days (required for lag=7)
    df_window = df.tail(8).copy()

    idx = df_window.index[-1]

    # Override LAST DAY with user inputs
    df_window.loc[idx, "season"] = features["season"]
    df_window.loc[idx, "weathersit"] = features["weather"]
    df_window.loc[idx, "temp"] = features["temp"]
    df_window.loc[idx, "hum"] = features["humidity"]
    df_window.loc[idx, "windspeed"] = features["windspeed"]
    df_window.loc[idx, "workingday"] = 0 if features["is_weekend"] else 1

    X, _ = prepare_day_features(df_window, fit_scaler=True)

    # Predict last row
    prediction = day_model.predict(X.tail(1))[0]
    return int(round(prediction))


# ===============================
# HOURLY PREDICTION (WINDOW-BASED)
# ===============================
def predict_hourly(features: dict) -> int:
    df = pd.read_csv(HOUR_DATA_PATH)

    # 🔑 Take last 25 hours (required for lag=24)
    df_window = df.tail(25).copy()

    idx = df_window.index[-1]

    df_window.loc[idx, "season"] = features["season"]
    df_window.loc[idx, "weathersit"] = features["weather"]
    df_window.loc[idx, "temp"] = features["temp"]
    df_window.loc[idx, "hum"] = features["humidity"]
    df_window.loc[idx, "windspeed"] = features["windspeed"]
    df_window.loc[idx, "hr"] = features["hour"]
    df_window.loc[idx, "workingday"] = 0 if features["is_weekend"] else 1

    X, _ = prepare_hour_features(df_window, fit_scaler=True)

    prediction = hour_model.predict(X.tail(1))[0]
    return int(round(prediction))


# ===============================
# CLI TEST
# ===============================
if __name__ == "__main__":
    print("\nTesting Daily Prediction...")
    print(
        predict_daily({
            "season": 2,
            "weather": 1,
            "temp": 0.6,
            "humidity": 0.65,
            "windspeed": 0.3,
            "is_weekend": 1
        })
    )

    print("\nTesting Hourly Prediction...")
    print(
        predict_hourly({
            "season": 2,
            "weather": 1,
            "temp": 0.6,
            "humidity": 0.65,
            "windspeed": 0.3,
            "hour": 9,
            "is_weekend": 0
        })
    )

    print("\n✅ Prediction pipeline working correctly")
