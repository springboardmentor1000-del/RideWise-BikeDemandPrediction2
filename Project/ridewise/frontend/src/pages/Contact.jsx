import RideWiseBackground from "../background/NewBackground";
import Navbar from "../components/Navbar";

export default function Contact() {
  return (
    <div className="min-h-screen text-white">
      {/* Background already applied globally */}
      <RideWiseBackground>
      <Navbar />

      <main className="pt-32 px-10 max-w-7xl mx-auto">

        {/* ===== HERO ===== */}
        <section className="text-center mb-20">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Get In Touch
          </h1>
          <p className="mt-6 text-gray-400 max-w-3xl mx-auto text-lg">
            Have questions about RideWise? We'd love to hear from you.
            Send us a message and we'll respond within 24 hours.
          </p>
        </section>

        {/* ===== MAIN CONTENT ===== */}
        <section className="grid grid-cols-3 gap-8 mb-24">

          {/* ===== CONTACT FORM ===== */}
          <div className="col-span-2 p-8 rounded-2xl bg-black/30 border border-white/10">
            <h2 className="text-3xl font-semibold mb-8">Send Us a Message</h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <Input label="Name *" placeholder="John Doe" />
              <Input label="Email *" placeholder="john@example.com" />
            </div>

            <Input
              label="Company"
              placeholder="Your company name"
              className="mb-6"
            />

            <Textarea
              label="Message *"
              placeholder="Tell us about your needs..."
            />

            <button
              className="mt-8 w-full py-4 rounded-xl
              bg-gradient-to-r from-cyan-400 to-purple-500
              text-black font-semibold flex items-center justify-center gap-2"
            >
              ✈️ Send Message
            </button>
          </div>

          {/* ===== RIGHT INFO PANEL ===== */}
          <div className="space-y-6">

            {/* Contact Info */}
            <div className="p-8 rounded-2xl bg-black/30 border border-white/10">
              <h3 className="text-2xl font-semibold mb-6">
                Contact Information
              </h3>

              <InfoRow title="Email" value="contact@ridewise.ai" />
              <InfoRow title="Phone" value="+91 98xyz 76543" />
              <InfoRow title="Office" value="New Delhi, India" />
            </div>

            {/* Business Inquiries */}
            <div className="p-8 rounded-2xl bg-black/30 border border-white/10">
              <h3 className="text-2xl font-semibold mb-4">
                Business Inquiries
              </h3>
              <p className="text-gray-400 mb-4">
                Interested in enterprise solutions or partnerships?
              </p>
              <div className="bg-black/40 border border-white/10 rounded-lg
                py-3 px-4 text-center font-medium">
                business@ridewise.ai
              </div>
            </div>

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
            <p>Made with ❤️ · Version 1.0.0</p>
          </div>
        </footer>

      </main>
      </RideWiseBackground>
    </div>
  );
}

/* ===== REUSABLE COMPONENTS ===== */

function Input({ label, placeholder, className }) {
  return (
    <div className={className}>
      <label className="block mb-2 text-gray-400">{label}</label>
      <input
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg
        bg-black/40 border border-white/10 text-white outline-none"
      />
    </div>
  );
}

function Textarea({ label, placeholder }) {
  return (
    <div>
      <label className="block mb-2 text-gray-400">{label}</label>
      <textarea
        rows={6}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg
        bg-black/40 border border-white/10 text-white outline-none resize-none"
      />
    </div>
  );
}

function InfoRow({ title, value }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-full bg-cyan-500/20
        flex items-center justify-center">
        📍
      </div>
      <div>
        <p className="text-gray-400">{title}</p>
        <p className="font-medium">{value}</p>
      </div>
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
