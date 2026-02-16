import sys
import json
import numpy as np
import os
import joblib

model_type = sys.argv[1]
input_data = json.loads(sys.argv[2])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "day_bike_demand_model.pkl")

model = joblib.load(MODEL_PATH)

features = np.array([input_data["features"]], dtype=float)
prediction = model.predict(features)[0]

print(json.dumps({
    "model": "day",
    "prediction": int(round(prediction))
}))
