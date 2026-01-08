import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler


# ===============================
# COMMON SEVERITY MAPS
# ===============================
season_severity = {1: 1, 2: 0, 3: 1, 4: 2}
weather_severity = {1: 0, 2: 1, 3: 2, 4: 3}


# ===============================
# DAY FEATURE ENGINEERING
# ===============================
def prepare_day_features(df, fit_scaler=False, scaler=None):
    df = df.copy()

    # Remove leakage columns
    df.drop(columns=["casual", "registered"], inplace=True, errors="ignore")

    # Date processing
    df["dteday"] = pd.to_datetime(df["dteday"])
    df["month"] = df["dteday"].dt.month
    df["weekday"] = df["dteday"].dt.weekday
    df["is_weekend"] = df["weekday"].isin([5, 6]).astype(int)

    # Cyclic month encoding
    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)

    # Weather interaction
    df["temp_humidity"] = df["temp"] * df["hum"]
    df["temp_windspeed"] = df["temp"] * df["windspeed"]

    # Working day indicator
    df["is_working_day"] = (
        (df["workingday"] == 1) & (df["holiday"] == 0)
    ).astype(int)

    # Severity feature
    df["severity"] = (
        df["season"].map(season_severity)
        + df["weathersit"].map(weather_severity)
    )

    # Sort for time-based features
    df = df.sort_values("dteday")

    # Lag & rolling features
    df["cnt_lag_7"] = df["cnt"].shift(7)
    df["cnt_diff_7"] = df["cnt"] - df["cnt_lag_7"]
    df["rolling_mean_7"] = df["cnt"].rolling(7).mean()

    # Scaling
    scale_cols = ["temp", "hum", "windspeed", "temp_humidity", "temp_windspeed"]
    if fit_scaler:
        scaler = StandardScaler()
        df[scale_cols] = scaler.fit_transform(df[scale_cols])
    else:
        df[scale_cols] = scaler.transform(df[scale_cols])

    # Cleanup
    df.drop(columns=["instant", "dteday", "weekday"], inplace=True, errors="ignore")
    df.dropna(inplace=True)

    X = df.drop("cnt", axis=1)
    return X, scaler


# ===============================
# HOUR FEATURE ENGINEERING
# ===============================
def prepare_hour_features(df, fit_scaler=False, scaler=None):
    df = df.copy()

    # Remove leakage columns
    df.drop(columns=["casual", "registered"], inplace=True, errors="ignore")

    # Date & time
    df["dteday"] = pd.to_datetime(df["dteday"])
    df["hour"] = df["hr"]
    df["weekday"] = df["dteday"].dt.weekday
    df["is_weekend"] = df["weekday"].isin([5, 6]).astype(int)

    # Cyclic hour encoding
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)

    # Time blocks
    def assign_time_block(hour):
        if 0 <= hour <= 5:
            return "late_night"
        elif 6 <= hour <= 10:
            return "start_day"
        elif 11 <= hour <= 16:
            return "mid_day"
        else:
            return "end_day"

    df["time_block"] = df["hour"].apply(assign_time_block)
    df = pd.get_dummies(df, columns=["time_block"], drop_first=True)

    # Weather interaction
    df["temp_humidity"] = df["temp"] * df["hum"]
    df["temp_windspeed"] = df["temp"] * df["windspeed"]

    # Working day
    df["is_working_day"] = (
        (df["workingday"] == 1) & (df["holiday"] == 0)
    ).astype(int)

    # Severity
    season_severity = {1: 1, 2: 0, 3: 1, 4: 2}
    weather_severity = {1: 0, 2: 1, 3: 2, 4: 3}

    df["severity"] = (
        df["season"].map(season_severity)
        + df["weathersit"].map(weather_severity)
    )

    # Sort for lag features
    df = df.sort_values(["dteday", "hour"])

    # Lag & rolling features
    df["cnt_lag_1"] = df["cnt"].shift(1)
    df["cnt_lag_24"] = df["cnt"].shift(24)
    df["cnt_diff_1"] = df["cnt"] - df["cnt_lag_1"]
    df["rolling_mean_24"] = df["cnt"].rolling(24).mean()

    # Scaling
    scale_cols = ["temp", "hum", "windspeed", "temp_humidity", "temp_windspeed"]
    if fit_scaler:
        scaler = StandardScaler()
        df[scale_cols] = scaler.fit_transform(df[scale_cols])
    else:
        df[scale_cols] = scaler.transform(df[scale_cols])

    # Cleanup
    df.drop(columns=["instant", "dteday", "hr", "weekday"], inplace=True, errors="ignore")
    df.dropna(inplace=True)

    X = df.drop("cnt", axis=1)
    return X, scaler
