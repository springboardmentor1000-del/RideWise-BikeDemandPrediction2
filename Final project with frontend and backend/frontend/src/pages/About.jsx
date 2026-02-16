import RideWiseBackground from "../background/NewBackground";
import Navbar from "../components/Navbar";

export default function About() {
  return (
    <div className="min-h-screen text-white">
        <RideWiseBackground>
      {/* SAME background as previous pages is already applied globally */}
      <Navbar />

      <main className="pt-32 px-10 max-w-7xl mx-auto">

        {/* ===== HERO ===== */}
        <section className="text-center mb-20">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            About RideWise
          </h1>
          <p className="mt-6 text-gray-400 max-w-3xl mx-auto text-lg">
            We're revolutionizing bike-sharing operations with AI-powered demand
            predictions, helping operators optimize their fleets and improve
            user satisfaction.
          </p>
        </section>

        {/* ===== CORE VALUES ===== */}
        <section className="grid grid-cols-3 gap-8 mb-24">
          <InfoCard
            title="Mission Driven"
            text="Empower bike-sharing operators with AI-powered insights for optimal fleet management."
          />
          <InfoCard
            title="Customer First"
            text="Built with user feedback and designed for real-world operational challenges."
          />
          <InfoCard
            title="Excellence"
            text="98.5% prediction accuracy backed by advanced machine learning models."
            highlight
          />
        </section>

        {/* ===== OUR STORY ===== */}
        <section className="mb-24">
          <div className="rounded-2xl bg-black/30 border border-white/10 p-12 text-center">
            <h2 className="text-4xl font-bold mb-6">Our Story</h2>
            <p className="text-gray-400 max-w-4xl mx-auto leading-relaxed">
              RideWise was born from a simple observation: bike-sharing operators
              were struggling with fleet distribution, leading to frustrated
              users and operational inefficiencies.
              <br /><br />
              Our team of data scientists and industry experts came together to
              build an AI solution that predicts demand patterns with
              unprecedented accuracy. Today, we serve operators across multiple
              cities, helping them make smarter decisions every day.
              <br /><br />
              With over 10 million predictions delivered and a 98.5% accuracy
              rate, we're proud to be the trusted partner for modern bike-sharing
              operations.
            </p>
          </div>
        </section>

        {/* ===== OUR TECHNOLOGY ===== */}
        <section className="mb-24">
          <h2 className="text-4xl font-bold text-center mb-12">
            Our Technology
          </h2>

          <div className="grid grid-cols-3 gap-8">
            <TechCard
              title="Advanced AI Models"
              text="State-of-the-art machine learning algorithms trained on millions of data points."
            />
            <TechCard
              title="Real-Time Analytics"
              text="Instant predictions with sub-50ms response times for time-critical decisions."
            />
            <TechCard
              title="Enterprise Ready"
              text="Secure, scalable infrastructure trusted by leading bike-sharing operators."
            />
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="mb-24">
          <div className="rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10
            border border-cyan-400/30 p-16 text-center">
            <h2 className="text-4xl font-bold mb-4">Join Our Journey</h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              We're constantly innovating and improving. Partner with us to
              transform your bike-sharing operations with cutting-edge AI
              technology.
            </p>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="border-t border-white/10 pt-12 pb-6 text-gray-400">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-3">RideWise</h3>
              <p className="text-sm">
                Smart AI-powered bike rental predictions. Optimize your fleet
                management with data-driven insights.
              </p>
            </div>

            <FooterCol
              title="Product"
              items={["Features", "AI Predictions", "Station Map", "Pricing"]}
            />
            <FooterCol
              title="Company"
              items={["About Us", "Contact", "Careers", "Blog"]}
            />
            <FooterCol
              title="Legal"
              items={[
                "Privacy Policy",
                "Terms of Service",
                "Cookie Policy",
                "Disclaimer",
              ]}
            />
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

/* ===== Reusable Components ===== */

function InfoCard({ title, text, highlight }) {
  return (
    <div
      className={`p-8 rounded-2xl bg-black/30 border ${
        highlight
          ? "border-cyan-400/40"
          : "border-white/10"
      }`}
    >
      <h3 className="text-2xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400">{text}</p>
    </div>
  );
}

function TechCard({ title, text }) {
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
          <li key={i} className="hover:text-white cursor-pointer">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
