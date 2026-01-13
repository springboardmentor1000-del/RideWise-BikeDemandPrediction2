import { useState } from "react";
import {
  FiHome,
  FiTrendingUp,
  FiMapPin,
  FiInfo,
  FiMail,
  FiSun,
  FiUser,
  FiMenu,
  FiX
} from "react-icons/fi";

import Logo from "../logo/Logo";
import { NavLink, useNavigate } from "react-router-dom"
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [predictOpen, setPredictOpen] = useState(false);

  const navigate = useNavigate();
  return (
    <nav className="
      fixed top-0 left-0 w-full z-50
      bg-black/40 backdrop-blur-xl
      border-b border-white/10
    ">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* LEFT: Logo */}
        <div className="flex items-center gap-3">
          <Logo />
        </div>

        {/* CENTER: Desktop Menu */}
        <ul className="hidden md:flex items-center gap-10 text-white/80">
          <NavItem to="/home" icon={<FiHome />} label="Home" />
          <div className="relative">
            <button
              onClick={() => setPredictOpen(!predictOpen)}
              className="
                flex items-center gap-2 px-4 py-2 rounded-xl
                text-white/80 hover:bg-white/5 transition
              "
            >
              <FiTrendingUp className="text-lg" />
              <span className="text-sm font-medium">Predict</span>
            </button>

            {/* Dropdown */}
            {predictOpen && (
              <div className="
                absolute top-12 left-0
                w-44 rounded-xl
                bg-black/70 backdrop-blur-xl
                border border-white/10
                shadow-xl
                overflow-hidden
              ">
                <button
                  onClick={() => {
                    setPredictOpen(false);
                    navigate("/predict/day");
                  }}
                  className="
                    w-full px-4 py-3 text-left
                    text-white/80 hover:bg-white/5
                    flex items-center gap-2
                  "
                >
                  📅 Day Prediction
                </button>

                <button
                  onClick={() => {
                    setPredictOpen(false);
                    navigate("/predict/hour");
                  }}
                  className="
                    w-full px-4 py-3 text-left
                    text-white/80 hover:bg-white/5
                    flex items-center gap-2
                  "
                >
                  ⏰ Hour Prediction
                </button>
              </div>
            )}
          </div>

          <NavItem to="/map" icon={<FiMapPin />} label="Map" />
          <NavItem to="/aboutus" icon={<FiInfo />} label="About" />
          <NavItem to="/contact" icon={<FiMail />} label="Contact" />
        </ul>

        {/* RIGHT: Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <NavLink className="
            px-5 py-2 rounded-xl text-white font-medium
            bg-gradient-to-r from-cyan-400 to-purple-500
            hover:opacity-90 transition
          " onClick={() => navigate("/reserve")}>
            Reserve Bike
          </NavLink>

          <IconButton icon={<FiSun />} />
          <NavLink to="/profile">
            <IconButton icon={<FiUser />}  />
          </NavLink>
          
        </div>

        {/* MOBILE: Hamburger */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setOpen(!open)}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* MOBILE MENU PANEL */}
      {open && (
        <div className="
          md:hidden
          bg-black/60 backdrop-blur-xl
          border-t border-white/10
        ">
          <ul className="flex flex-col px-6 py-6 gap-4 text-white/80">
            <MobileItem to="/home" icon={<FiHome />} label="Home" />
              <div className="space-y-2">
              <button
                onClick={() => navigate("/predict/day")}
                className="
                  w-full flex items-center gap-2 px-4 py-2 rounded-xl
                  text-white hover:bg-white/5
                "
              >
                <FiTrendingUp />
                Day Prediction
              </button>

              <button
                onClick={() => navigate("/predict/hour")}
                className="
                  w-full flex items-center gap-2 px-4 py-2 rounded-xl
                  text-white hover:bg-white/5
                "
              >
                <FiTrendingUp />
                Hour Prediction
              </button>
            </div>

            <MobileItem to="/map" icon={<FiMapPin />} label="Map" />
            <MobileItem to="/aboutus" icon={<FiInfo />} label="About" />
            <MobileItem to="/contact" icon={<FiMail />} label="Contact" />

            <div className="flex gap-3 pt-4">
              <button className="
                flex-1 py-3 rounded-xl text-white font-medium
                bg-gradient-to-r from-cyan-400 to-purple-500
              ">
                Reserve Bike
              </button>

              <IconButton icon={<FiSun />} />
              <NavLink to="/profile">
                <IconButton icon={<FiUser />} />
              </NavLink>
            </div>
          </ul>
        </div>
      )}
    </nav>
  );
}

/* ---------- Reusable ---------- */

const NavItem = ({ to , icon, label }) => (
  <NavLink to={to} className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 rounded-xl transition
        ${isActive
          ? "bg-white/10 text-cyan-400"
          : "text-white hover:bg-white/5"}`}>
    <span className="text-lg">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </NavLink>
);

const MobileItem = ({to, icon, label }) => (
  <NavLink to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 rounded-xl transition
        ${isActive
          ? "bg-white/10 text-cyan-400"
          : "text-white hover:bg-white/5"}`
      }>
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </NavLink>
);

const IconButton = ({ icon }) => (
  <button className="
    w-10 h-10 rounded-full
    bg-white/5 border border-white/10
    flex items-center justify-center
    text-white/80
    hover:bg-white/10 hover:text-cyan-300
    transition
  ">
    {icon}
  </button>
);
