import { useNavigate } from "react-router-dom";
import RideWiseBackground from "../background/NewBackground";
import Navbar from "../components/Navbar";
import Logo from "../logo/Logo";

export default function Home() {
  const navigate = useNavigate();
  return (
    <RideWiseBackground>
      
      {/* Page Wrapper */}
      <div className="min-h-screen text-white">

        {/* Navbar (fixed) */}
        <div className="fixed top-0 left-0 w-full z-50">
          <Navbar />
        </div>

        {/* Scrollable Content */}
        <main className="pt-28 px-6">

          {/* HERO SECTION */}
          <section className="min-h-[50vh] flex flex-col items-center justify-center text-center">
            
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

            <div className="mt-10 flex gap-4">
              
              <button className="px-8 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition" onClick={() => navigate("/map")}>
                📍 View Station Map
              </button>
            </div>
          </section>

          {/* FEATURES */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-20">
            <Feature title="99.5% Accuracy" desc="Highly accurate demand prediction" />
            <Feature title="<50ms Response" desc="Lightning fast predictions" />
            <Feature title="24/7 Available" desc="Always-on AI system" />
          </section>

          {/* EXTRA CONTENT (forces scroll) */}
          <section className="h-[100vh] flex items-center justify-center text-white/50">
            Scroll content continues here...
          </section>

        </main>
      </div>
    </RideWiseBackground>
  );
}

const Feature = ({ title, desc }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-lg">
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-white/60 mt-2">{desc}</p>
  </div>
);
