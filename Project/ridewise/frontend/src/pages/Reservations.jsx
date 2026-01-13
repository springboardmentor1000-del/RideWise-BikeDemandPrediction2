import { useState } from "react";
import Navbar from "../components/Navbar";
import ReservationCard from "../components/ReservationCard";
import RideWiseBackground from "../background/NewBackground";
import SideNavbar from "../components/Sidebar";

export default function Reservations() {
  const [reservations] = useState([
    {
      id: 1,
      station: "Connaught Place, Delhi",
      date: "15/01/2025",
      time: "10:00",
      duration: "2h",
      bikeId: "BK-001",
      status: "Active",
    },
    {
      id: 2,
      station: "Marine Drive, Mumbai",
      date: "12/01/2025",
      time: "14:00",
      duration: "1h",
      bikeId: "BK-042",
      status: "Completed",
    },
  ]);

  return (
    <div className="min-h-screen text-white relative overflow-hidden">

      {/* 🌌 Background */}
      <RideWiseBackground >

      {/* 🔝 Navbar */}
      <div className="relative z-20">
        <Navbar />
      </div>

      {/* 🔹 INTERNAL CSS */}
      <style>{`
        .input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: white;
          transition: all 0.25s ease;
        }
        .input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        .input:focus {
          outline: none;
          border-color: #22d3ee;
          box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.25);
        }
      `}</style>

      {/* 🔹 PAGE CONTENT */}
      <div className="relative z-10 flex pt-28 px-8 gap-8">

        {/* 📌 Sidebar */}
        <SideNavbar />

        {/* ================= NEW RESERVATION ================= */}
        <div className="w-[420px] bg-black/30 backdrop-blur
          border border-white/10 rounded-2xl p-6 h-fit">

          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            🚲 New Reservation
          </h2>

          <label className="block text-sm mb-2">Station</label>
          <select className="input">
            <option>Select station</option>
            <option>Connaught Place, Delhi</option>
            <option>Marine Drive, Mumbai</option>
            <option>MG Road, Bengaluru</option>
          </select>

          <label className="block text-sm mt-4 mb-2">Date</label>
          <input type="date" className="input" />

          <label className="block text-sm mt-4 mb-2">Time</label>
          <input type="time" className="input" />

          <label className="block text-sm mt-4 mb-2">Duration (hours)</label>
          <select className="input">
            <option>1 hour</option>
            <option>2 hours</option>
            <option>3 hours</option>
          </select>

          <button
            className="w-full mt-6 py-3 rounded-xl font-semibold
            bg-gradient-to-r from-cyan-400 to-purple-500
            text-black hover:opacity-90 transition"
          >
            Reserve Bike
          </button>
        </div>

        {/* ================= MY RESERVATIONS ================= */}
        <div className="flex-1 bg-black/30 backdrop-blur
          border border-white/10 rounded-2xl p-6">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              📅 My Reservations
            </h2>

            <input
              className="input w-64"
              placeholder="Search reservations..."
            />
          </div>

          <div className="space-y-4">
            {reservations.map((r) => (
              <ReservationCard key={r.id} data={r} />
            ))}
          </div>
        </div>

      </div>
      </RideWiseBackground>
    </div>
  );
}
