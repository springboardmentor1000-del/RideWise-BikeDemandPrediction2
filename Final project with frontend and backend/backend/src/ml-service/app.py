from flask import Flask, request, jsonify
import pickle

app = Flask(__name__)
model = pickle.load(open("model.pkl", "rb"))

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    features = [
        data["season"],
        data["temp"],
        data["humidity"],
        data["windspeed"]
    ]
    prediction = model.predict([features])
    return jsonify({"demand": int(prediction[0])})

app.run(port=8000)
