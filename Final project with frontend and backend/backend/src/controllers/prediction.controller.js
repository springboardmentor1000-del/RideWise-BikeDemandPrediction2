import { runPrediction } from "../services/python.service.js";

import { spawn } from "child_process";
import path from "path";

export const dayPrediction = async (req, res) => {
  try {
    const { day, temperature, humidity, season, isHoliday } = req.body;
    // TODO: pass to ML model
    const predictedDemand = Math.floor(
      200 + temperature * 3 - humidity + (isHoliday ? -40 : 30)
    );
    res.json({
      success: true,
      predictionType: "day",
      day,
      demand: predictedDemand,
      confidence: "92%"
    });
    
  } catch {
    res.status(500).json({ message: "Day prediction failed" });
  }
};

export const predictHourly = (req, res) => {
  try {
    const payload = req.body;

    const pythonPath = "python"; // or full path if needed
    const scriptPath = path.join(
      process.cwd(),
      "backend",
      "ml-service",
      "hour_predict.py"
    );

    const py = spawn(pythonPath, [
      scriptPath,
      JSON.stringify(payload),
    ]);

    let result = "";

    py.stdout.on("data", (data) => {
      result += data.toString();
    });

    py.stderr.on("data", (err) => {
      console.error("Python error:", err.toString());
    });

    py.on("close", () => {
      try {
        const parsed = JSON.parse(result);
        res.json(parsed);
      } catch (e) {
        res.status(500).json({
          error: "Prediction failed",
          raw: result,
        });
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
