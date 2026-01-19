import { useState } from "react";
import "../../styles/dashboard.css";

const API = "http://127.0.0.1:8000";

export default function PdfPredict() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("daily");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    if (!file) {
      alert("Please upload a PDF or Image");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);

      const res = await fetch(`${API}/predict/from-file`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Prediction failed");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Unable to process file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">PDF / Image Demand Prediction</h1>
      <p className="page-subtitle">
        Upload a document and let RideWise AI predict demand automatically
      </p>

      <div className="card pdf-card">
        {/* FILE UPLOAD */}
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {/* MODE SELECT */}
        <div className="toggle-row">
          <button
            className={mode === "daily" ? "pill active" : "pill"}
            onClick={() => setMode("daily")}
          >
            Daily Prediction
          </button>
          <button
            className={mode === "hourly" ? "pill active" : "pill"}
            onClick={() => setMode("hourly")}
          >
            Hourly Prediction
          </button>
        </div>

        <button className="primary-btn" onClick={handlePredict}>
          {loading ? "Analyzing..." : "Predict from File"}
        </button>

        {error && <p className="error">{error}</p>}
      </div>

      {/* RESULT */}
      {result && (
        <div className="card result-card">
          <h3>Prediction Result</h3>
          <div className="result-box big">
            <span>
              {result.mode === "daily"
                ? "Daily Demand"
                : "Hourly Demand"}
            </span>
            <strong>{result.prediction}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
