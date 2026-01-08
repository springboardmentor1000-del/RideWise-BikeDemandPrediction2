import pandas as pd
import pickle
import os

from feature_engineering import prepare_day_features, prepare_hour_features
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DAY_MODEL_PATH = os.path.join(BASE_DIR, "models", "lightGBM_day_model.pkl")
HOUR_MODEL_PATH = os.path.join(BASE_DIR, "models", "lightGBM_hour_model.pkl")

DAY_DATA_PATH = os.path.join(BASE_DIR, "data", "day.csv")
HOUR_DATA_PATH = os.path.join(BASE_DIR, "data", "hour.csv")


# ===============================
# DAILY MODEL EVALUATION
# ===============================
def evaluate_day():
    df = pd.read_csv(DAY_DATA_PATH)

    X, _ = prepare_day_features(df, fit_scaler=True)
    y_true = df.loc[X.index, "cnt"]

    with open(DAY_MODEL_PATH, "rb") as f:
        model = pickle.load(f)

    y_pred = model.predict(X)

    r2 = r2_score(y_true, y_pred)
    rmse = mean_squared_error(y_true, y_pred) ** 0.5
    mae = mean_absolute_error(y_true, y_pred)

    return r2, rmse, mae


# ===============================
# HOURLY MODEL EVALUATION
# ===============================
def evaluate_hour():
    df = pd.read_csv(HOUR_DATA_PATH)

    X, _ = prepare_hour_features(df, fit_scaler=True)
    y_true = df.loc[X.index, "cnt"]

    with open(HOUR_MODEL_PATH, "rb") as f:
        model = pickle.load(f)

    y_pred = model.predict(X)

    r2 = r2_score(y_true, y_pred)
    rmse = mean_squared_error(y_true, y_pred) ** 0.5
    mae = mean_absolute_error(y_true, y_pred)

    return r2, rmse, mae


# ===============================
# CLI RUN
# ===============================
if __name__ == "__main__":
    day_r2, day_rmse, day_mae = evaluate_day()
    hour_r2, hour_rmse, hour_mae = evaluate_hour()

    print("\n📅 DAILY MODEL PERFORMANCE")
    print(f"R² Score: {day_r2:.4f} ({day_r2*100:.2f}%)")
    print(f"RMSE: {day_rmse:.2f}")
    print(f"MAE: {day_mae:.2f}")

    print("\n⏰ HOURLY MODEL PERFORMANCE")
    print(f"R² Score: {hour_r2:.4f} ({hour_r2*100:.2f}%)")
    print(f"RMSE: {hour_rmse:.2f}")
    print(f"MAE: {hour_mae:.2f}")
