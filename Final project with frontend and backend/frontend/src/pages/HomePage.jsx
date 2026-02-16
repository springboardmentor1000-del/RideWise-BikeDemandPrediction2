import { useNavigate } from "react-router-dom";
import RideWiseBackground from "../background/NewBackground";
import Navbar from "../components/Navbar";
import Logo from "../logo/Logo";

export default function Home() {
  const navigate = useNavigate();

  return (
    <RideWiseBackground>
      <div className="min-h-screen text-white">

        {/* Navbar */}
        <div className="fixed top-0 left-0 w-full z-50">
          <Navbar />
        </div>

        {/* Content */}
        <main className="pt-32 px-6 max-w-7xl mx-auto space-y-10">

          {/* ================= HERO ================= */}
          <section className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <span className="mb-4 px-4 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-sm">
              ✨ Powered by Advanced ML
            </span>

            <div className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              <Logo />
            </div>

            <p className="mt-6 max-w-2xl text-white/70 text-lg">
              AI Powered Bike Rental Prediction – Make data-driven decisions for
              optimal fleet management and user satisfaction.
            </p>

            <div className="mt-10">
              <button
                onClick={() => navigate("/map")}
                className="px-8 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition"
              >
                📍 View Station Map
              </button>
            </div>
          </section>

          {/* ================= QUICK FEATURES ================= */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Feature title="99.5% Accuracy" desc="Highly accurate demand prediction" />
            <Feature title="<50ms Response" desc="Lightning fast predictions" />
            <Feature title="24/7 Available" desc="Always-on AI system" />
          </section>

          {/* ================= CORE FEATURES ================= */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                title="AI Demand Prediction"
                text="Predict hourly and daily bike demand using machine learning trained on real-world data."
              />
              <FeatureCard
                title="Real-Time Station Tracking"
                text="Monitor bike availability and demand levels across stations on an interactive map."
              />
              <FeatureCard
                title="Smart Fleet Optimization"
                text="Reduce shortages and oversupply by making data-driven fleet decisions."
              />
            </div>
          </section>

          {/* ================= HOW IT WORKS ================= */}
          <section>
            <h2 className="text-4xl font-bold text-center mb-14">
              How RideWise Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepCard
                step="01"
                title="Collect Data"
                text="Weather, seasonality, historical rentals, and station activity are continuously analyzed."
              />
              <StepCard
                step="02"
                title="AI Prediction"
                text="Advanced ML models forecast demand patterns with high accuracy."
              />
              <StepCard
                step="03"
                title="Take Action"
                text="Operators rebalance bikes, plan inventory, and improve rider satisfaction."
              />
            </div>
          </section>

          {/* ================= STATS ================= */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="98.5%" label="Prediction Accuracy" />
            <StatCard value="10M+" label="Predictions Made" />
            <StatCard value="70+" label="Stations Tracked" />
            <StatCard value="24/7" label="Real-Time Insights" />
          </section>

          {/* ================= USE CASES ================= */}
          <section>
            <h2 className="text-4xl font-bold text-center mb-14">
              Who Uses RideWise?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <UseCaseCard
                title="City Planners"
                text="Improve urban mobility and reduce congestion with smarter bike allocation."
              />
              <UseCaseCard
                title="Bike-Sharing Companies"
                text="Optimize fleet operations and reduce operational costs."
              />
              <UseCaseCard
                title="Campus & Enterprises"
                text="Manage internal mobility systems with accurate demand forecasting."
              />
            </div>
          </section>

        </main>
      </div>
    </RideWiseBackground>
  );
}

/* ================= COMPONENTS ================= */

const Feature = ({ title, desc }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-lg hover:bg-white/10 transition">
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-white/60 mt-2">{desc}</p>
  </div>
);

function FeatureCard({ title, text }) {
  return (
    <div className="p-8 rounded-2xl bg-black/30 border border-white/10 hover:border-cyan-400/30 transition">
      <h3 className="text-2xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400">{text}</p>
    </div>
  );
}

function StepCard({ step, title, text }) {
  return (
    <div className="p-8 rounded-2xl bg-black/30 border border-white/10">
      <span className="text-cyan-400 font-bold text-lg">{step}</span>
      <h3 className="text-2xl font-semibold mt-2 mb-3">{title}</h3>
      <p className="text-gray-400">{text}</p>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="p-8 rounded-2xl bg-black/30 border border-white/10 text-center">
      <h3 className="text-4xl font-bold text-cyan-400">{value}</h3>
      <p className="text-gray-400 mt-2">{label}</p>
    </div>
  );
}

function UseCaseCard({ title, text }) {
  return (
    <div className="p-8 rounded-2xl bg-black/30 border border-white/10 hover:border-purple-400/30 transition">
      <h3 className="text-2xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400">{text}</p>
    </div>
  );
}
