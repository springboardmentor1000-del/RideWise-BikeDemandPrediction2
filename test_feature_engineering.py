print("🔥 test_feature_engineering.py is running 🔥")

import pandas as pd
from backend.feature_engineering import prepare_day_features, prepare_hour_features

df_day = pd.read_csv("data/day.csv")
df_hour = pd.read_csv("data/hour.csv")

X_day, _ = prepare_day_features(df_day, fit_scaler=True)
X_hour, _ = prepare_hour_features(df_hour, fit_scaler=True)

print("DAY FEATURES SHAPE:", X_day.shape)
print("HOUR FEATURES SHAPE:", X_hour.shape)

print("✅ Feature engineering test successful")
