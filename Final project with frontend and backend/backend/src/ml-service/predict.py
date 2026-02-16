import sys
import pickle
import json
import numpy as np

# --------- Read inputs ----------
model_type = sys.argv[1]          # "day" or "hour"
input_data = json.loads(sys.argv[2])

# --------- Load model ----------
if model_type == "day":
    with open("ml/day_bike_demand_model.pkl", "rb") as f:
        model = pickle.load(f)
elif model_type == "hour":
    with open("ml/hour_model.pkl", "rb") as f:
        model = pickle.load(f)
else:
    raise ValueError("Invalid model type")

# --------- Extract features ----------
# MUST be list of numbers in correct order
features = np.array([input_data["features"]], dtype=float)

# --------- Predict ----------
prediction = model.predict(features)[0]

# --------- Output ----------
print(json.dumps({
    "model": model_type,
    "prediction": int(round(prediction))
}))
