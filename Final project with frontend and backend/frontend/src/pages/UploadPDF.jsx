import { useState } from "react";
import Navbar from "../components/Navbar";
import RideWiseBackground from "../background/NewBackground";
import { useNavigate } from "react-router-dom";
import SideNavbar from "../components/Sidebar";
import { UploadCloud, FileText, CloudSun, Thermometer, Bike } from "lucide-react";

export default function UploadPDF() 
{
  const [file, setFile] = useState(null);
  const [insights, setInsights] = useState(null);
  const navigate = useNavigate();

  const uploadPDF = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("pdf", file);

    const res = await fetch("http://localhost:5000/api/analyze-pdf", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setInsights(data);
  };

  return (
    <RideWiseBackground>
      <Navbar />
      <SideNavbar />

      <main className="ml-[260px] pt-28 px-10 text-white min-h-screen">
         <div className="
          max-w-4xl mx-auto mb-12
          p-8 rounded-3xl
          bg-white/5 backdrop-blur-xl
          border border-white/10
          text-center
        ">
          <div className="flex justify-center mb-4">
            <div className="
              w-14 h-14 rounded-full
              bg-gradient-to-r from-cyan-400 to-purple-500
              flex items-center justify-center
              text-black
            ">
              <UploadCloud size={28} />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">Upload PDF</h1>
          <p className="text-white/60 mb-6">
            Upload a bike rental or city mobility report
          </p>

          <div className="flex justify-center gap-4">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-md px-6 py-2 rounded-xl
                bg-gradient-to-r from-cyan-400 to-purple-500
                text-black font-medium
                hover:opacity-90 transition"
            />
            <button
              onClick={uploadPDF}
              className="
                px-6 py-2 rounded-xl
                bg-gradient-to-r from-cyan-400 to-purple-500
                text-black font-medium
                hover:opacity-90 transition
              "
            >
              Analyze PDF
            </button>
          </div>
        </div>

        {/* INSIGHTS */}
        {/* ===== CONTENT GRID ===== */}
        {insights && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

            {/* PDF PREVIEW */}
            <div className="
              h-[420px]
              rounded-2xl overflow-hidden
              bg-white/5 backdrop-blur-xl
              border border-white/10
            ">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <FileText size={18} />
                <p className="text-sm font-medium">PDF Preview</p>
              </div>

              <iframe
                src={URL.createObjectURL(file)}
                title="PDF Preview"
                className="w-full h-full"
              />
            </div>

            {/* AI INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Insight icon={<Bike />} title="Rental Demand" value={insights.rentals} />
              <Insight icon={<CloudSun />} title="Weather" value={insights.weather} />
              <Insight icon={<Thermometer />} title="Temperature" value={insights.temperature} />
              <Insight icon={<Bike />} title="Availability" value={insights.availability} />
            </div>
          </div>
        )}


        {/* REDIRECT */}
        {insights && (
          <div className="mt-12 flex justify-center gap-6">
            <button
              onClick={() => navigate("/predict/hour")}
              className="px-6 py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition"
            >
              ⏰ Hour Prediction →
            </button>

            <button
              onClick={() => navigate("/predict/day")}
              className="px-6 py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition"
            >
              📅 Day Prediction →
            </button>
          </div>
        )}
      </main>
    </RideWiseBackground>
  );
}
/* ===== Insight Card ===== */
const Insight = ({ icon, title, value }) => (
  <div className="
    p-6 rounded-2xl
    bg-white/5 backdrop-blur-xl
    border border-white/10
    hover:scale-[1.03]
    hover:shadow-purple-500/30
    transition
  ">
    <div className="flex items-center gap-3 mb-3">
      <div className="
        w-9 h-9 rounded-full
        bg-gradient-to-r from-cyan-400 to-purple-500
        text-black flex items-center justify-center
      ">
        {icon}
      </div>
      <p className="font-medium">{title}</p>
    </div>
    <p className="text-white/80 text-md leading-relaxed">
      {value || "Not available in Document"}
    </p>
  </div>
);
