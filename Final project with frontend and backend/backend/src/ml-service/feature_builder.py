import numpy as np
import pandas as pd
from datetime import datetime

def build_features(input_data, history_df, hr):
    date = datetime.fromisoformat(input_data["date"])

    features = {}

    # ---- BASIC ----
    features["season"] = (date.month % 12) // 3 + 1
    features["yr"] = date.year - 2011
    features["holiday"] = input_data["holiday"]
    features["workingday"] = 0 if features["holiday"] else 1
    features["weathersit"] = input_data["weathersit"]

    features["temp"] = input_data["temperature"] / 41
    features["atemp"] = input_data["atemp"] / 50
    features["hum"] = input_data["humidity"] / 100
    features["windspeed"] = input_data["windspeed"] / 67

    # ---- TIME ----
    features["hr"] = hr
    features["dayofweek"] = date.weekday()
    features["weekofyear"] = date.isocalendar().week
    features["dayofyear"] = date.timetuple().tm_yday
    features["is_weekend"] = 1 if features["dayofweek"] >= 5 else 0
    features["is_rush_hour"] = 1 if hr in [8,9,17,18] else 0
    features["is_night"] = 1 if hr < 6 or hr > 22 else 0

    # ---- CYCLICAL ----
    features["hr_sin"] = np.sin(2 * np.pi * hr / 24)
    features["hr_cos"] = np.cos(2 * np.pi * hr / 24)
    features["mnth_sin"] = np.sin(2 * np.pi * date.month / 12)
    features["mnth_cos"] = np.cos(2 * np.pi * date.month / 12)

    # ---- WEATHER DERIVED ----
    features["temp_diff"] = features["atemp"] - features["temp"]
    features["temp_hum"] = features["temp"] * features["hum"]
    features["temp_wind"] = features["temp"] * features["windspeed"]
    features["weather_severity"] = features["weathersit"] * 2
    features["comfort_index"] = 1 - abs(features["temp"] - 0.5)

    # ---- LAGS (from history) ----
    features["cnt_lag_1"] = history_df.iloc[-1]["cnt"]
    features["cnt_lag_24"] = history_df.iloc[-24]["cnt"]
    features["cnt_lag_168"] = history_df.iloc[-168]["cnt"]

    features["cnt_roll_7"] = history_df.tail(7)["cnt"].mean()
    features["cnt_roll_24"] = history_df.tail(24)["cnt"].mean()
    features["cnt_roll_168"] = history_df.tail(168)["cnt"].mean()

    features["cnt_trend"] = history_df.tail(24)["cnt"].diff().mean()
    features["cnt_zscore"] = (
        (features["cnt_lag_1"] - history_df["cnt"].mean()) /
        history_df["cnt"].std()
    )

    features["hour_bucket"] = hr // 4
    features["work_rush"] = features["workingday"] * features["is_rush_hour"]
    features["pre_holiday"] = 0
    features["post_holiday"] = 0
    features["temp_change"] = 0
    features["hum_change"] = 0

    return features
