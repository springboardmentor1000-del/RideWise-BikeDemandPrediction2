import { useEffect, useState } from "react";
import RideWiseBackground from "../background/NewBackground";
import Navbar from "../components/Navbar";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import UserLocationMap from "../components/UserLocationMap";
import {useNavigate } from "react-router-dom";
export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "" });
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  /* ================= FETCH USER PROFILE ================= */
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetch(`http://localhost:5000/api/user/me?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          name: data.name || "",
          email: data.email || "",
        });
      });
  }, [user, navigate]);


  /* ================= FETCH LOCATION ================= */
  useEffect(() => {
    const fetchLocation = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/location");
      const data = await res.json();
      setLocation(data);
    } catch {
      setLocation(null);
    }
  };
  // console.log("MAP COORDS:", location.latitude, location.longitude);

  fetchLocation();
  }, []);
  useEffect(() => {
    console.log("LOCATION FROM BACKEND (FRONTEND):", location);
  }, [location]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= UPDATE PROFILE ================= */
  const handleUpdate = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: form.name,
          email: form.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      localStorage.setItem("user", JSON.stringify(data));
      alert("Profile updated successfully");
    } catch {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <RideWiseBackground>
        <Navbar />

        <div className="relative z-10 pt-28 px-10">

          {/* ================= TOP GRID ================= */}
          <div className="grid grid-cols-3 gap-8">

            {/* ===== PROFILE CARD ===== */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">My Profile</h2>

              <div className="flex flex-col gap-4">
                <Input
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />

                <Input
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />

                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className={`mt-4 py-3 rounded-xl font-semibold
                    bg-gradient-to-r from-cyan-400 to-purple-500
                    text-black transition
                    ${loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
                <button
                  onClick={() => setOpen(true)}
                  className="
                    w-full py-2 rounded-xl mb-3
                    bg-white/10 hover:bg-white/20 transition
                  "
                >
                  Change Password
                </button>
                <ForgotPasswordModal
                  isOpen={open}
                  onClose={() => setOpen(false)}
                />
                {/* LOGOUT */}
                <button
                  onClick={logout}
                  className="
                    w-full py-2 rounded-xl
                    bg-red-500/80 hover:bg-red-500 transition
                  "
                >
                  Logout
                </button>
              </div>
            </div>

            {/* ===== LOCATION / SESSION INFO ===== */}
            <div className="col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Location & Session</h2>

            {location ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Info label="City" value={location.city === "N/A" ? "Localhost(Dev Mode)":location.city} />
                  <Info label="Region" value={location.region} />
                  <Info label="Country" value={location.country} />
                  <Info label="IP Address" value={location.ip} />
                  <Info label="Timezone" value={location.timezone} />
                  <Info label="ISP" value={location.isp} />
                </div>

                {/* MAP */}
                <UserLocationMap location={{
                    lat: location.latitude,
                    lng: location.longitude,
                  }} />
              </>
            ) : (
              <p className="text-white/60">Detecting location...</p>
            )}
          </div>

          </div>

          {/* ================= USER ACTIVITY ================= */}
          <div className="mt-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6">User Activity</h2>

            <div className="grid grid-cols-4 gap-6 text-center">
              <Stat title="Reservations" value="12" />
              <Stat title="Predictions Used" value="38" />
              <Stat title="Stations Viewed" value="15" />
              <Stat title="Last Login" value="Today" />
            </div>
          </div>

        </div>
      </RideWiseBackground>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-white/70 text-sm">{label}</label>
    <input
      {...props}
      className="bg-black/30 border border-white/20
        rounded-lg px-4 py-2 text-white
        focus:outline-none focus:border-cyan-400"
    />
  </div>
);

const Info = ({ label, value }) => (
  <div>
    <p className="text-white/60 text-sm">{label}</p>
    <p className="font-medium">{value || "-"}</p>
  </div>
);

const Stat = ({ title, value }) => (
  <div className="bg-black/30 rounded-xl p-4">
    <p className="text-white/60 text-sm">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);
