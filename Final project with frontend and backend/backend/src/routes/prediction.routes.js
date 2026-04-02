import express from "express";
const router = express.Router();
import { spawn } from "child_process";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * DAY-WISE BIKE RENTAL PREDICTION
 */
router.post("/day", (req, res) => {
    console.log("📥 Received day prediction input:", req.body);
    const features = req.body.features;
    console.log("📥 Features received:", features);
        console.log("📥 Input received:", req.body);
    const pythonFile = path.join(
      process.cwd(),
      "src",
      "ml-service",
      "day_predict.py"
    )
    const python = spawn("python", [
        pythonFile,
        "day",
        JSON.stringify(req.body)
    ]);
    let result = "";
    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.stderr.on("data", (err) => {
      console.error("❌ Python error:", err.toString());
    });
    // -----------------------------
  // ✅ FINAL RESPONSE
  // -----------------------------
    python.on("close", () => {
      try {
        const parsed = JSON.parse(result);
        console.log("📤 Prediction:", parsed);
        res.json(parsed);
        console.log(parsed)
      } catch (e) {
        res.status(500).json({ error: "Prediction failed" });
      }
    });
    // console.log("📤 Sending prediction:", response);
    // res.json(response);
});
router.post("/hourly", (req, res) => {
  console.log("📥 Received hourly prediction input:", req.body);

  const pythonFile = path.join(
    process.cwd(),
    "src",
    "ml-service",
    "hour_predict.py"
  );

  const python = spawn("python", [
    pythonFile,
    JSON.stringify(req.body)
  ]);

  let result = "";

  python.stdout.on("data", (data) => {
    result += data.toString();
  });

  python.stderr.on("data", (err) => {
    console.error("❌ Python error:", err.toString());
  });

  python.on("close", () => {
    try {
      const parsed = JSON.parse(result);
      console.log("📤 Hourly Prediction:", parsed);
      res.json(parsed);
    } catch (e) {
      console.error("❌ JSON Parse Error:", e, result);
      res.status(500).json({ error: "Prediction failed" });
    }
  });
});
export default router;
