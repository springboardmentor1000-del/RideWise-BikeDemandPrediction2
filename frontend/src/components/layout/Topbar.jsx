import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/dashboard.css";

export default function Topbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="topbar">
      {/* LEFT */}
      <div className="topbar-left">
        <div className="logo">🚲</div>
        <span className="brand">RideWise</span>
      </div>

      {/* CENTER */}
      <nav className="topbar-nav">
        <NavLink to="/home">Home</NavLink>
        <NavLink to="/predict">Predict</NavLink>
        <NavLink to="/map">Map</NavLink>
        <NavLink to="/ai">RideWise AI</NavLink>
        <NavLink to="/review">Review</NavLink>

      </nav>

      {/* RIGHT */}
      <div className="topbar-right">
        {/* ✅ FIXED RESERVE BUTTON */}
        <button
          className="reserve-btn"
          onClick={() => navigate("/reserve")}
        >
          Reserve Bike
        </button>

        <div className="profile-wrapper">
          <div
            className="profile-circle"
            onClick={() => setOpen(!open)}
          >
            👤
          </div>

          {open && (
            <div className="profile-dropdown">
              <p className="email">{user?.email}</p>
              <button
                className="logout-btn"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
