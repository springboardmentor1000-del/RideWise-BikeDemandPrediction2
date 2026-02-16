import { useNavigate } from "react-router-dom";
import RideWiseBackground from "../background/NewBackground";
import Navbar from "../components/Navbar";
import Logo from "../logo/Logo";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen text-white">
      {/* Same background already applied globally */}
      <RideWiseBackground>
            <div className="pt-10 max-w-7xl mx-auto px-3 h-20 flex items-center justify-between">
            {/* LEFT: Logo */}
            <div className="flex items-center">
                <Logo />
                </div>
            </div>

      <main className="pt-32 px-10 max-w-7xl mx-auto">

        {/* ================= HERO ================= */}
        <section className="text-center mb-28">
          <h1 className="text-6xl font-bold leading-tight
            bg-gradient-to-r from-cyan-400 to-purple-500
            bg-clip-text text-transparent">
            AI-Powered Bike Rental <br /> Demand Prediction
          </h1>

          <p className="mt-6 text-gray-400 max-w-3xl mx-auto text-lg">
            RideWise helps cities and bike-sharing operators predict demand,
            optimize fleets, and deliver a seamless riding experience using
            advanced AI models.
          </p>

          <div className="mt-10 flex justify-center gap-6">
            <button className="px-8 py-4 rounded-xl font-semibold
              bg-gradient-to-r from-cyan-400 to-purple-500 text-black" onClick={() => navigate("/auth")}>
              Get Started
            </button>

            <button className="px-8 py-4 rounded-xl font-semibold
              border border-white/20 hover:bg-white/5" onClick={() => navigate("/auth")}>
              View Demo
            </button>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="grid grid-cols-3 gap-8 mb-28">
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
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="mb-28">
          <h2 className="text-4xl font-bold text-center mb-14">
            How RideWise Works
          </h2>

          <div className="grid grid-cols-3 gap-8">
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
        <section className="grid grid-cols-4 gap-8 mb-28">
          <StatCard value="98.5%" label="Prediction Accuracy" />
          <StatCard value="10M+" label="Predictions Made" />
          <StatCard value="70+" label="Stations Tracked" />
          <StatCard value="24/7" label="Real-Time Insights" />
        </section>

        {/* ================= USE CASES ================= */}
        <section className="mb-28">
          <h2 className="text-4xl font-bold text-center mb-14">
            Who Uses RideWise?
          </h2>

          <div className="grid grid-cols-3 gap-8">
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

        {/* ================= CTA ================= */}
        <section className="mb-32">
          <div className="rounded-2xl bg-gradient-to-r
            from-cyan-500/10 to-purple-500/10
            border border-cyan-400/30 p-16 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Start Optimizing Your Bike Fleet Today
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto mb-8">
              Join operators worldwide who trust RideWise to power their
              bike-sharing decisions with AI.
            </p>

            <button className="px-10 py-4 rounded-xl font-semibold
              bg-gradient-to-r from-cyan-400 to-purple-500 text-black" onClick={() => navigate("/auth")}>
              Try RideWise Now
            </button>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="border-t border-white/10 pt-12 pb-6 text-gray-400">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-3">RideWise</h3>
              <p className="text-sm">
                Smart AI-powered bike rental predictions for modern mobility.
              </p>
            </div>

            <FooterCol title="Product" items={["AI Predictions", "Station Map", "Pricing"]} />
            <FooterCol title="Company" items={["About", "Contact", "Careers"]} />
            <FooterCol title="Legal" items={["Privacy Policy", "Terms", "Disclaimer"]} />
          </div>

          <div className="flex justify-between text-sm">
            <p>© 2026 RideWise. All rights reserved.</p>
            
          </div>
        </footer>

      </main>
      </RideWiseBackground>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function FeatureCard({ title, text }) {
  return (
    <div className="p-8 rounded-2xl bg-black/30 border border-white/10">
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
    <div className="p-8 rounded-2xl bg-black/30 border border-white/10">
      <h3 className="text-2xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400">{text}</p>
    </div>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <h4 className="text-white font-semibold mb-3">{title}</h4>
      <ul className="space-y-2 text-sm">
        {items.map((i) => (
          <li key={i} className="hover:text-white cursor-pointer">{i}</li>
        ))}
      </ul>
    </div>
  );
}
