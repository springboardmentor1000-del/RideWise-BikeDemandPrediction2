import { useState } from "react";
import HourInputPanel from "../components/HourInputPanel";
import PredictionResult from "../components/PredictionResult";
import { predictHourly } from "../api/predictApi";
import RideWiseBackground from "../background/NewBackground";
import Navbar from "../components/Navbar";
import SideNavbar from "../components/Sidebar";
import TenMinutePredictionChart from "../components/TenMinutePredictionChart";

export default function HourPrediction() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handlePredict(formData) {
    try {
      setLoading(true);
      const res = await predictHourly(formData);
      setResult(res);
    } catch (err) {
      alert("Prediction failed");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <RideWiseBackground>
        <div className="w-full min-h-screen px-10 pt-8">
              <Navbar />
              <div className="w-64 h-full">
                <SideNavbar />
              </div>
        {/* Title */}
          <div className="min-h-screen pl-64 pr-10 pt-13">
            <h1 classNaame="text-3xl font-semibold text-white mb-2">
              Hour-wise AI Prediction
            </h1>
            <p className="text-purple-200 mb-8">
              Select date & hour, adjust conditions and click{" "}
            <span className="font-semibold text-white">Predict Rentals</span>
            </p>
          
        {/* MAIN GRID — SAME AS DAY PAGE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            
              {/* LEFT — Hour Input Card */}
              <HourInputPanel onPredict={handlePredict}/>
              
              {/* RIGHT — Ready to Predict */}
              <div className="flex flex-col gap-6">
                <div
                  className=" rounded-2xl border border-white/10
                  bg-white/5 backdrop-blur-md
                  flex flex-col items-center justify-center
                  text-center"
                >
                  {!result && !loading && (
                    <div>
                      <div className="text-4xl mb-4">📍</div>
                      <h3 className="text-xl text-white mb-2">
                        Ready to Predict
                      </h3>
                      <p className="text-purple-200 text-sm">
                        Adjust inputs and click Predict Rentals
                        <span className="text-white font-medium">
                          Predict Rentals
                        </span>
                      </p>
                    </div>
                  )}
                  {loading && (
                    <p className="text-white animate-pulse">
                      Predicting demand...
                    </p>
                  )}
                  {result && (
                    <div>
                      <h3 className="text-xl text-white mb-4">
                        Prediction Result
                      </h3>
                      <p className="text-purple-200">
                        Hour: <span className="text-white">{result.hour}:00</span>
                      </p>
                      <p className="text-3xl font-bold text-cyan-400 mt-2">
                        {result.prediction} Rentals
                      </p>
                      <p className="text-sm text-purple-300 mt-2">
                        Confidence: {Math.round(result.confidence * 100)}%
                      </p>
                    </div>
                  )}
                </div>
                  {result && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
                      <h4 className="text-white mb-4 text-center">
                        10-Minute Demand Distribution
                      </h4>

                      <TenMinutePredictionChart
                        data={result.ten_minute_predictions}
                      />
                    </div>
                  )}
              </div>
            
          </div>
           
      </div>
      </div>
      </RideWiseBackground>
    </div>
  );
}
