import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Topbar from "../components/layout/Topbar";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

import Home from "../pages/dashboard/Home";
import Predict from "../pages/dashboard/Predict";
import Map from "../pages/dashboard/Map";
import RideWiseAI from "../pages/dashboard/RideWiseAI";
import Profile from "../pages/dashboard/Profile";
import Reservations from "../pages/dashboard/Reservations";
import Review from "../pages/dashboard/Review";
import PdfPredict from "../pages/dashboard/PdfPredict";
import Contact from "../pages/dashboard/Contact";


export default function App() {
  const { user } = useAuth();

  return (
    <>
      {/* ✅ Topbar only after login */}
      {user && <Topbar />}

      <Routes>
        {/* ================= AUTH ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ================= DASHBOARD ================= */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/predict"
          element={
            <ProtectedRoute>
              <Predict />
            </ProtectedRoute>
          }
        />

        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <Map />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai"
          element={
            <ProtectedRoute>
              <RideWiseAI />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reserve"
          element={
            <ProtectedRoute>
              <Reservations />
            </ProtectedRoute>
          }
        />

        {/* ✅ REVIEW MUST BE ABOVE * */}
        <Route
          path="/review"
          element={
            <ProtectedRoute>
              <Review />
            </ProtectedRoute>
          }
        />

        {/* ================= DEFAULT ================= */}
        <Route
          path="*"
          element={<Navigate to={user ? "/home" : "/login"} />}
        />

        <Route
  path="/contact"
  element={
    <ProtectedRoute>
      <Contact />
    </ProtectedRoute>
  }
/>


        <Route
  path="/pdf-predict"
  element={
    <ProtectedRoute>
      <PdfPredict />
    </ProtectedRoute>
  }
/>

      </Routes>
    </>
  );
}
