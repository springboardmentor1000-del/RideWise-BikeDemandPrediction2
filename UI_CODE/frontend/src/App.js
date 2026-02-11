import React, { useState, useEffect } from "react";
import {
  MapPin,
  MessageCircle,
  X,
  Send,
  User,
  Lock,
  Home,
  TrendingUp,
  Bike,
  MessageSquare,
  LogOut,
  Mail,
  ChevronRight,
  Star,
  Loader,
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Check,
  Filter,
  Settings,
  Bell,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Zap,
  Heart,
  Users,
  Award,
} from "lucide-react";
import AuthPage from "./AuthPage";
import SettingsPage from "./SettingsPage";
import { useToast } from "./components/Toast";
import LoadingSkeleton from "./components/LoadingSkeleton";
import { ExportButton } from "./utils/exportCSV";

// API Configuration
const API_BASE_URL = "https://bikerental-ai.onrender.com";

export default function BikeRentalApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [chatOpen, setChatOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [appTheme, setAppTheme] = useState(() => {
    const saved = localStorage.getItem("app-theme");
    return saved ? JSON.parse(saved) : { bg: "#0a0e1a", accent: "#667eea" };
  });
  const { showToast, ToastComponent } = useToast();
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  // Add this after the appTheme state
  const textColor = appTheme.bg === "#f8fafc" ? "#1e293b" : "white";
  const secondaryTextColor = appTheme.bg === "#f8fafc" ? "#64748b" : "#94a3b8";

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      const saved = localStorage.getItem("app-theme");
      if (saved) {
        setAppTheme(JSON.parse(saved));
      }
    };

    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);
  // Fetch bookings from backend
  // Fetch bookings from backend when user logs in
  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser?.email) return;

      setIsLoadingBookings(true);
      try {
        console.log(`📊 Fetching bookings for: ${currentUser.email}`);
        const response = await fetch(
          `${API_BASE_URL}/api/bookings?user_email=${encodeURIComponent(currentUser.email)}`,
        );
        const data = await response.json();

        if (data.success) {
          setBookings(data.bookings);
          showToast(`Loaded ${data.bookings.length} bookings`, "success");
          console.log(
            `✅ Loaded ${data.bookings.length} bookings from database`,
          );
        } else {
          showToast("Failed to load bookings", "error");
          console.error("Failed to fetch bookings:", data.error);
        }
      } catch (error) {
        showToast("Error loading bookings", "error");
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoadingBookings(false);
      }
    };

    if (isLoggedIn && currentUser) {
      fetchBookings();
    }
  }, [isLoggedIn]);
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab("home");
  };

  const handleBookingComplete = async (booking) => {
    console.log("📥 Booking completed:", booking);

    // Add to state immediately
    setBookings((prevBookings) => [booking, ...prevBookings]);

    // Fetch updated bookings from backend to sync
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`);
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
        console.log("✅ Bookings synced from backend");
      }
    } catch (error) {
      console.error("Error syncing bookings:", error);
    }
  };
  const handleDeleteBooking = async (bookingId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/bookings/${bookingId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (data.success) {
        setBookings((prevBookings) =>
          prevBookings.filter((b) => b.id !== bookingId),
        );
        showToast("Booking cancelled successfully", "success");
      } else {
        showToast("Failed to delete booking", "error");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      showToast("Error deleting booking", "error");
    }
  };

  if (!isLoggedIn) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: appTheme.bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.2) 0%, transparent 50%)",
          animation: "float 25s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(90deg, rgba(102, 126, 234, 0.05) 1px, transparent 1px), linear-gradient(rgba(102, 126, 234, 0.05) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          transform: "perspective(1000px) rotateX(60deg) translateZ(-200px)",
          transformOrigin: "center top",
        }}
      />

      <Header
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <div
        style={{
          padding: "20px",
          maxWidth: "1400px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {activeTab === "home" && <HomePage setActiveTab={setActiveTab} />}
        {activeTab === "book" && (
          <BookPage
            onBookingComplete={handleBookingComplete}
            user={currentUser}
          />
        )}
        {activeTab === "prediction" && <PredictionPage user={currentUser} />}
        {activeTab === "reviews" && <ReviewsPage user={currentUser} />}
        {activeTab === "profile" && (
          <ProfilePage
            user={currentUser}
            setCurrentUser={setCurrentUser}
            bookings={bookings}
            onDeleteBooking={handleDeleteBooking}
            isLoadingBookings={isLoadingBookings}
            showToast={showToast}
          />
        )}
      </div>

      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "65px",
          height: "65px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 10px 40px rgba(102, 126, 234, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          animation: "pulse 2s infinite",
        }}
      >
        <MessageCircle size={30} color="white" />
      </button>

      {chatOpen && (
        <SmartChatBot
          onClose={() => setChatOpen(false)}
          setActiveTab={setActiveTab}
          onBookingComplete={handleBookingComplete}
          user={currentUser}
        />
      )}
      {ToastComponent}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 10px 40px rgba(102, 126, 234, 0.5), 0 0 0 0 rgba(102, 126, 234, 0.7); }
          50% { box-shadow: 0 10px 40px rgba(102, 126, 234, 0.5), 0 0 0 20px rgba(102, 126, 234, 0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function Header({ user, activeTab, setActiveTab, onLogout }) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "book", label: "Book", icon: MapPin },
    { id: "prediction", label: "Predict", icon: TrendingUp },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <header
      style={{
        background: "rgba(10, 14, 26, 0.8)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid rgba(102, 126, 234, 0.2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "15px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
          }}
        >
          <Bike size={26} color="white" />
        </div>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              color: "textColor",
              fontWeight: "bold",
            }}
          >
            BikeRental AI
          </h1>
          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
            Smart Urban Mobility India
          </p>
        </div>
      </div>

      <nav style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "5px" }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "10px",
                  background:
                    activeTab === tab.id
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "transparent",
                  color: activeTab === tab.id ? "white" : "#cbd5e1",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.3s",
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginLeft: "20px",
            padding: "10px 15px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span style={{ fontSize: "14px", color: "white", fontWeight: "600" }}>
            {user?.name || "User"}
          </span>
          <button
            onClick={onLogout}
            style={{
              padding: "6px 12px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontWeight: "bold",
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}

function HomePage({ setActiveTab }) {
  return (
    <div>
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          borderRadius: "30px",
          padding: "80px 60px",
          textAlign: "center",
          boxShadow: "0 25px 80px rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(102, 126, 234, 0.2)",
          marginBottom: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "62px",
            margin: "0 0 20px 0",
            background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "bold",
          }}
        >
          India's Smartest Bike Sharing
        </h1>
        <p style={{ fontSize: "22px", color: "#cbd5e1", marginBottom: "40px" }}>
          AI-powered predictions • Real-time availability • 50+ Cities
        </p>

        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
          <button
            onClick={() => setActiveTab("book")}
            style={{
              padding: "18px 45px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "14px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 12px 35px rgba(102, 126, 234, 0.4)",
            }}
          >
            Book Now
          </button>
          <button
            onClick={() => setActiveTab("prediction")}
            style={{
              padding: "18px 45px",
              background: "rgba(255, 255, 255, 0.1)",
              color: "white",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "14px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            AI Predictions
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {[
          { icon: Bike, value: "10,000+", label: "Bikes", color: "#667eea" },
          { icon: Users, value: "5L+", label: "Riders", color: "#764ba2" },
          { icon: MapPin, value: "50+", label: "Cities", color: "#10b981" },
          { icon: Award, value: "4.8★", label: "Rating", color: "#f59e0b" },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(20px)",
                borderRadius: "20px",
                padding: "35px",
                textAlign: "center",
                border: "1px solid rgba(102, 126, 234, 0.2)",
              }}
            >
              <Icon
                size={35}
                color={stat.color}
                style={{ marginBottom: "15px" }}
              />
              <div
                style={{
                  fontSize: "38px",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "8px",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "16px", color: "#cbd5e1" }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          borderRadius: "25px",
          padding: "50px 40px",
          border: "1px solid rgba(102, 126, 234, 0.2)",
          marginBottom: "40px",
        }}
      >
        <h2
          style={{
            color: "white",
            textAlign: "center",
            fontSize: "36px",
            marginBottom: "40px",
          }}
        >
          How It Works
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "30px",
          }}
        >
          {[
            {
              step: "1",
              icon: MapPin,
              title: "Find Station",
              desc: "Locate nearest bike station using our interactive map",
            },
            {
              step: "2",
              icon: Bike,
              title: "Choose Bike",
              desc: "Select from electric or comfort bikes based on your needs",
            },
            {
              step: "3",
              icon: CreditCard,
              title: "Pay & Ride",
              desc: "Secure payment and instant unlock via app",
            },
            {
              step: "4",
              icon: CheckCircle,
              title: "Return",
              desc: "Drop at any station and get instant refund for unused time",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  background: "rgba(30, 41, 59, 0.5)",
                  borderRadius: "18px",
                  padding: "30px",
                  textAlign: "center",
                  position: "relative",
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-15px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  {item.step}
                </div>
                <Icon
                  size={40}
                  color="#667eea"
                  style={{ marginTop: "20px", marginBottom: "15px" }}
                />
                <h3
                  style={{
                    color: "white",
                    fontSize: "20px",
                    marginBottom: "10px",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          borderRadius: "25px",
          padding: "50px 40px",
          border: "1px solid rgba(102, 126, 234, 0.2)",
          marginBottom: "40px",
        }}
      >
        <h2
          style={{
            color: "white",
            textAlign: "center",
            fontSize: "36px",
            marginBottom: "40px",
          }}
        >
          Why Choose Us?
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "25px",
          }}
        >
          {[
            {
              icon: Zap,
              title: "AI-Powered",
              desc: "Machine learning predicts demand and optimizes bike distribution",
              color: "#f59e0b",
            },
            {
              icon: Shield,
              title: "Safe & Secure",
              desc: "GPS tracking, insurance coverage, and 24/7 customer support",
              color: "#10b981",
            },
            {
              icon: Heart,
              title: "Eco-Friendly",
              desc: "Reduce carbon footprint - each ride saves 1.2kg CO₂ emissions",
              color: "#ef4444",
            },
            {
              icon: DollarSign,
              title: "Affordable",
              desc: "Starting at just ₹25/hour with flexible membership plans",
              color: "#667eea",
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                style={{
                  background: "rgba(30, 41, 59, 0.5)",
                  borderRadius: "18px",
                  padding: "30px",
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                }}
              >
                <Icon
                  size={35}
                  color={feature.color}
                  style={{ marginBottom: "15px" }}
                />
                <h3
                  style={{
                    color: "white",
                    fontSize: "20px",
                    marginBottom: "10px",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)",
          borderRadius: "25px",
          padding: "50px",
          textAlign: "center",
          border: "1px solid rgba(102, 126, 234, 0.3)",
        }}
      >
        <h2 style={{ color: "white", fontSize: "32px", marginBottom: "15px" }}>
          Join 5 Lakh+ Happy Riders
        </h2>
        <p style={{ color: "#cbd5e1", fontSize: "18px", marginBottom: "30px" }}>
          Start your eco-friendly journey today
        </p>
        <button
          onClick={() => setActiveTab("book")}
          style={{
            padding: "18px 50px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 12px 35px rgba(102, 126, 234, 0.4)",
          }}
        >
          Get Started →
        </button>
      </div>
    </div>
  );
}

function BookPage({ onBookingComplete, user }) {
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedBike, setSelectedBike] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    duration: 2,
    startTime: "10:00",
    date: new Date().toISOString().split("T")[0],
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);

  const stations = [
    {
      id: 1,
      name: "Connaught Place Hub",
      city: "New Delhi",
      distance: "0.5 km",
      bikesAvailable: 12,
      lat: 28.6315,
      lng: 77.2167,
      bikes: [
        {
          id: 1,
          type: "Electric Bike",
          category: "Unisex",
          battery: "90%",
          rating: 4.8,
          pricePerHour: 40,
        },
        {
          id: 2,
          type: "Comfort Bike",
          category: "Women",
          battery: "N/A",
          rating: 4.9,
          pricePerHour: 25,
        },
      ],
    },
    {
      id: 2,
      name: "Bandra Station",
      city: "Mumbai",
      distance: "1.2 km",
      bikesAvailable: 8,
      lat: 19.0596,
      lng: 72.8295,
      bikes: [
        {
          id: 3,
          type: "Electric Bike",
          category: "Unisex",
          battery: "85%",
          rating: 4.7,
          pricePerHour: 45,
        },
      ],
    },
    {
      id: 3,
      name: "MG Road Station",
      city: "Bangalore",
      distance: "0.8 km",
      bikesAvailable: 15,
      lat: 12.9716,
      lng: 77.5946,
      bikes: [
        {
          id: 4,
          type: "Comfort Bike",
          category: "Women",
          battery: "N/A",
          rating: 4.8,
          pricePerHour: 25,
        },
      ],
    },
  ];

  useEffect(() => {
    if (mapInitialized) return;

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      setTimeout(() => {
        const mapEl = document.getElementById("bike-map");
        if (typeof window.L !== "undefined" && mapEl && !mapEl._leaflet_id) {
          const map = window.L.map("bike-map").setView([20.5937, 78.9629], 5);
          window.L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              attribution: "© OpenStreetMap contributors",
            },
          ).addTo(map);

          stations.forEach((station) => {
            const marker = window.L.marker([station.lat, station.lng]).addTo(
              map,
            );
            marker.bindPopup(
              `<b>${station.name}</b><br/>${station.city}<br/>${station.bikesAvailable} bikes`,
            );
            marker.on("click", () => setSelectedStation(station.id));
          });

          setMapInitialized(true);
        }
      }, 100);
    };
    document.head.appendChild(script);

    return () => {
      const mapEl = document.getElementById("bike-map");
      if (mapEl && mapEl._leaflet_id && window.L) {
        mapEl._leaflet_id = null;
      }
    };
  }, [mapInitialized]);

  const handleBookNow = (bike, station) => {
    setSelectedBike({
      ...bike,
      stationName: station.name,
      stationCity: station.city,
    });
    setShowBookingModal(true);
  };

  const processPayment = async () => {
    setPaymentProcessing(true);

    try {
      // Save booking to backend database
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: user.email, // ADD THIS LINE
          city: selectedBike.stationCity,
          bike_type: selectedBike.type,
          duration: bookingDetails.duration,
          date: bookingDetails.date,
          start_time: bookingDetails.startTime,
          total_price: selectedBike.pricePerHour * bookingDetails.duration,
          status: "confirmed",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentProcessing(false);
        setShowPaymentModal(false);

        // Create booking object with backend ID
        const booking = {
          id: data.booking_id,
          bike: selectedBike.type,
          station: selectedBike.stationName,
          city: selectedBike.stationCity,
          date: bookingDetails.date,
          startTime: bookingDetails.startTime,
          duration: bookingDetails.duration,
          totalPrice: selectedBike.pricePerHour * bookingDetails.duration,
          status: "confirmed",
        };

        onBookingComplete(booking);
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      } else {
        throw new Error("Booking failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentProcessing(false);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div>
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          padding: "30px",
          marginBottom: "20px",
          border: "1px solid rgba(102, 126, 234, 0.2)",
        }}
      >
        <h2 style={{ color: "white", marginBottom: "15px" }}>
          🗺️ Find Bikes Across India
        </h2>
        <div
          id="bike-map"
          style={{
            height: "450px",
            borderRadius: "15px",
            border: "2px solid rgba(102, 126, 234, 0.3)",
            background: "rgba(30, 41, 59, 0.5)",
          }}
        />
        <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "12px" }}>
          📍 Map loads automatically • Click markers to view stations
        </p>
      </div>

      <h3 style={{ color: "white", marginBottom: "15px" }}>
        Available Stations
      </h3>
      {stations.map((station) => (
        <div
          key={station.id}
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            borderRadius: "15px",
            padding: "20px",
            marginBottom: "15px",
            border: "1px solid rgba(102, 126, 234, 0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "15px",
            }}
          >
            <div>
              <h4 style={{ color: "white", margin: "0 0 8px 0" }}>
                {station.name}
              </h4>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>
                📍 {station.city} • 🚲 {station.bikesAvailable} bikes
              </p>
            </div>
            <button
              onClick={() =>
                setSelectedStation(
                  selectedStation === station.id ? null : station.id,
                )
              }
              style={{
                padding: "10px 24px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              View Bikes
            </button>
          </div>

          {selectedStation === station.id && (
            <div
              style={{
                borderTop: "1px solid rgba(102, 126, 234, 0.2)",
                paddingTop: "15px",
              }}
            >
              {station.bikes.map((bike) => (
                <div
                  key={bike.id}
                  style={{
                    background: "rgba(30, 41, 59, 0.5)",
                    borderRadius: "12px",
                    padding: "18px",
                    marginBottom: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      {bike.type}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "13px" }}>
                      {bike.category} • ⭐ {bike.rating} • ₹{bike.pricePerHour}
                      /hr
                      {bike.battery !== "N/A" && ` • 🔋 ${bike.battery}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookNow(bike, station)}
                    style={{
                      padding: "12px 24px",
                      background: "rgba(16, 185, 129, 0.2)",
                      color: "#10b981",
                      border: "2px solid rgba(16, 185, 129, 0.4)",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {showBookingModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowBookingModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(15, 23, 42, 0.98)",
              borderRadius: "20px",
              padding: "40px",
              maxWidth: "500px",
              width: "90%",
              border: "1px solid rgba(102, 126, 234, 0.3)",
            }}
          >
            <h2 style={{ color: "white", marginBottom: "20px" }}>
              📅 Booking Details
            </h2>

            <div
              style={{
                background: "rgba(30, 41, 59, 0.5)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{ color: "white", fontWeight: "bold", fontSize: "18px" }}
              >
                {selectedBike?.type}
              </div>
              <div style={{ color: "#94a3b8", marginTop: "5px" }}>
                📍 {selectedBike?.stationName}, {selectedBike?.stationCity}
                <br />
                💵 ₹{selectedBike?.pricePerHour}/hour
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  color: "#cbd5e1",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Date
              </label>
              <input
                type="date"
                value={bookingDetails.date}
                onChange={(e) =>
                  setBookingDetails({ ...bookingDetails, date: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "rgba(30, 41, 59, 0.5)",
                  border: "1px solid rgba(102, 126, 234, 0.3)",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  color: "#cbd5e1",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Duration: {bookingDetails.duration}h
              </label>
              <input
                type="range"
                min="1"
                max="8"
                value={bookingDetails.duration}
                onChange={(e) =>
                  setBookingDetails({
                    ...bookingDetails,
                    duration: parseInt(e.target.value),
                  })
                }
                style={{ width: "100%" }}
              />
            </div>

            <div
              style={{
                background: "rgba(102, 126, 234, 0.2)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  color: "#10b981",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                Total: ₹
                {(
                  selectedBike?.pricePerHour * bookingDetails.duration +
                  20
                ).toFixed(0)}
              </div>
            </div>

            <button
              onClick={() => {
                setShowBookingModal(false);
                setShowPaymentModal(true);
              }}
              style={{
                width: "100%",
                padding: "15px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.98)",
              borderRadius: "20px",
              padding: "40px",
              maxWidth: "500px",
              width: "90%",
              border: "1px solid rgba(102, 126, 234, 0.3)",
            }}
          >
            <h2 style={{ color: "white", marginBottom: "20px" }}>💳 Payment</h2>

            <div
              style={{
                background: "rgba(102, 126, 234, 0.2)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  color: "#10b981",
                  fontSize: "32px",
                  fontWeight: "bold",
                }}
              >
                ₹
                {(
                  selectedBike?.pricePerHour * bookingDetails.duration +
                  20
                ).toFixed(0)}
              </div>
            </div>

            <button
              onClick={processPayment}
              disabled={paymentProcessing}
              style={{
                width: "100%",
                padding: "15px",
                background: paymentProcessing
                  ? "#64748b"
                  : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: "bold",
                cursor: paymentProcessing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              {paymentProcessing ? (
                <>
                  <Loader
                    size={20}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Processing...
                </>
              ) : (
                "Pay Now"
              )}
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1002,
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.98)",
              borderRadius: "20px",
              padding: "50px",
              textAlign: "center",
              border: "2px solid #10b981",
            }}
          >
            <CheckCircle
              size={60}
              color="#10b981"
              style={{ marginBottom: "20px" }}
            />
            <h2 style={{ color: "white", marginBottom: "15px" }}>
              Booking Confirmed!
            </h2>
            <p style={{ color: "#94a3b8" }}>Check your profile for details</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PredictionPage({ user }) {
  const [predictionType, setPredictionType] = useState("day");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    hour: 12,
    season: "summer",
    weather: "clear",
    temperature: 20,
    humidity: 50,
    windSpeed: 10,
    isHoliday: false,
  });
  // Load PDF data from sessionStorage if available
  React.useEffect(() => {
    const pdfData = sessionStorage.getItem("pdfPredictionData");
    if (pdfData) {
      try {
        const parsedData = JSON.parse(pdfData);
        setFormData((prev) => ({
          ...prev,
          ...parsedData,
        }));
        setPdfUploaded(true);
        sessionStorage.removeItem("pdfPredictionData"); // Clear after loading
        console.log("✅ Loaded PDF data into form");
      } catch (error) {
        console.error("Error loading PDF data:", error);
      }
    }
  }, []);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [pdfUploaded, setPdfUploaded] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const endpoint =
        predictionType === "day"
          ? `${API_BASE_URL}/api/predict/day`
          : `${API_BASE_URL}/api/predict/hour`;

      const requestData = {
        user_email: user?.email || "anonymous", // ADD THIS LINE
        date: formData.date,
        hour: predictionType === "hour" ? formData.hour : undefined,
        season: formData.season,
        weather: formData.weather,
        temperature: formData.temperature,
        humidity: formData.humidity,
        windSpeed: formData.windSpeed,
        isHoliday: formData.isHoliday,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        setPrediction(data.prediction);
      } else {
        throw new Error(data.error || "Failed");
      }
    } catch (err) {
      setError("Using demo prediction");
      const result =
        predictionType === "day"
          ? Math.floor(Math.random() * 3000 + 2000)
          : Math.floor(Math.random() * 400 + 100);
      setPrediction(result);
    } finally {
      setLoading(false);
    }
  };
  const handlePDFUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf")) {
      alert("❌ Please upload a PDF file");
      return;
    }

    setUploadingPDF(true);
    setPdfUploaded(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_email", user?.email || "anonymous"); // ✅ ADD THIS LINE
      console.log(`📤 Uploading PDF: ${file.name}`);

      const response = await fetch(`${API_BASE_URL}/api/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("📦 PDF Response:", data);

      if (data.success) {
        // Update form with extracted data
        setFormData((prev) => ({
          ...prev,
          ...data.extracted_data,
        }));

        setPdfUploaded(true);

        // Show detailed success message
        const fieldsFound = data.metadata.extracted_fields.join(", ");
        const confidence = data.metadata.confidence;

        alert(
          `✅ PDF Processed Successfully!\n\n` +
            `📊 Confidence: ${confidence.toUpperCase()}\n` +
            `🎯 Found: ${fieldsFound || "default values"}\n` +
            `📄 Pages: ${data.metadata.page_count}\n\n` +
            `Extracted Data:\n` +
            `🌡️ Temperature: ${data.extracted_data.temperature}°C\n` +
            `💧 Humidity: ${data.extracted_data.humidity}%\n` +
            `💨 Wind: ${data.extracted_data.windSpeed} km/h\n` +
            `📅 Date: ${data.extracted_data.date}\n` +
            `🌤️ Weather: ${data.extracted_data.weather}\n` +
            `🌿 Season: ${data.extracted_data.season}`,
        );
      } else {
        throw new Error(data.error || "Failed to process PDF");
      }
    } catch (err) {
      console.error("PDF upload error:", err);
      alert(
        `❌ Error processing PDF:\n${err.message}\n\nPlease try again or enter data manually.`,
      );
    } finally {
      setUploadingPDF(false);
      event.target.value = ""; // Reset file input
    }
  };
  return (
    <div>
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          padding: "30px",
          marginBottom: "20px",
          border: "1px solid rgba(102, 126, 234, 0.2)",
        }}
      >
        <h2 style={{ color: "white", marginBottom: "20px" }}>
          🔮 ML-Powered Predictions
        </h2>
        {/* PDF Upload Section */}
        <div
          style={{
            background: "rgba(102, 126, 234, 0.1)",
            borderRadius: "15px",
            padding: "20px",
            marginBottom: "25px",
            border: "1px solid rgba(102, 126, 234, 0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              📄
            </div>
            <div>
              <h3 style={{ color: "white", margin: 0, fontSize: "18px" }}>
                Upload Weather Report PDF
              </h3>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "13px" }}>
                Auto-fill prediction data from PDF document
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <label
              style={{
                padding: "12px 24px",
                background: uploadingPDF
                  ? "#64748b"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: "10px",
                cursor: uploadingPDF ? "not-allowed" : "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                border: "none",
              }}
            >
              {uploadingPDF ? (
                <>
                  <Loader
                    size={18}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Processing...
                </>
              ) : (
                <>📤 Choose PDF</>
              )}
              <input
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                disabled={uploadingPDF}
                style={{ display: "none" }}
              />
            </label>

            {pdfUploaded && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  background: "rgba(16, 185, 129, 0.2)",
                  borderRadius: "8px",
                  color: "#10b981",
                }}
              >
                <CheckCircle size={18} />
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                  Data Loaded
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: "15px",
              padding: "12px",
              background: "rgba(59, 130, 246, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <p
              style={{
                color: "#60a5fa",
                fontSize: "12px",
                margin: 0,
                lineHeight: "1.6",
              }}
            >
              💡 <strong>Tip:</strong> Your PDF should contain weather data like
              temperature, humidity, wind speed, date, season, and weather
              conditions.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
          {["day", "hour"].map((type) => (
            <button
              key={type}
              onClick={() => setPredictionType(type)}
              style={{
                padding: "12px 30px",
                background:
                  predictionType === type
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "rgba(255, 255, 255, 0.05)",
                color: "white",
                border: "1px solid rgba(102, 126, 234, 0.2)",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {type === "day" ? "📅 Daily" : "⏰ Hourly"}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#cbd5e1",
                fontWeight: "bold",
              }}
            >
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(30, 41, 59, 0.5)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                borderRadius: "8px",
                color: "white",
              }}
            />
          </div>

          {predictionType === "hour" && (
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#cbd5e1",
                  fontWeight: "bold",
                }}
              >
                Hour
              </label>
              <select
                value={formData.hour}
                onChange={(e) =>
                  setFormData({ ...formData, hour: parseInt(e.target.value) })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "rgba(30, 41, 59, 0.5)",
                  border: "1px solid rgba(102, 126, 234, 0.3)",
                  borderRadius: "8px",
                  color: "white",
                }}
              >
                {[...Array(24)].map((_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#cbd5e1",
                fontWeight: "bold",
              }}
            >
              Season
            </label>
            <select
              value={formData.season}
              onChange={(e) =>
                setFormData({ ...formData, season: e.target.value })
              }
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(30, 41, 59, 0.5)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                borderRadius: "8px",
                color: "white",
              }}
            >
              <option value="spring">Spring</option>
              <option value="summer">Summer</option>
              <option value="fall">Fall</option>
              <option value="winter">Winter</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#cbd5e1",
                fontWeight: "bold",
              }}
            >
              Weather
            </label>
            <select
              value={formData.weather}
              onChange={(e) =>
                setFormData({ ...formData, weather: e.target.value })
              }
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(30, 41, 59, 0.5)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                borderRadius: "8px",
                color: "white",
              }}
            >
              <option value="clear">Clear</option>
              <option value="cloudy">Cloudy</option>
              <option value="rainy">Rainy</option>
              <option value="heavy_rain">Heavy Rain</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#cbd5e1",
                fontWeight: "bold",
              }}
            >
              Temperature (°C)
            </label>
            <input
              type="number"
              value={formData.temperature}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  temperature: parseInt(e.target.value),
                })
              }
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(30, 41, 59, 0.5)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                borderRadius: "8px",
                color: "white",
              }}
              min="-10"
              max="40"
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#cbd5e1",
                fontWeight: "bold",
              }}
            >
              Humidity (%)
            </label>
            <input
              type="number"
              value={formData.humidity}
              onChange={(e) =>
                setFormData({ ...formData, humidity: parseInt(e.target.value) })
              }
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(30, 41, 59, 0.5)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                borderRadius: "8px",
                color: "white",
              }}
              min="0"
              max="100"
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#cbd5e1",
                fontWeight: "bold",
              }}
            >
              Wind Speed (km/h)
            </label>
            <input
              type="number"
              value={formData.windSpeed}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  windSpeed: parseInt(e.target.value),
                })
              }
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(30, 41, 59, 0.5)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                borderRadius: "8px",
                color: "white",
              }}
              min="0"
              max="67"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={formData.isHoliday}
                onChange={(e) =>
                  setFormData({ ...formData, isHoliday: e.target.checked })
                }
                style={{ width: "20px", height: "20px" }}
              />
              <span style={{ color: "#cbd5e1", fontWeight: "bold" }}>
                Holiday
              </span>
            </label>
          </div>
        </div>

        {error && !prediction && (
          <div
            style={{
              padding: "15px",
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              marginBottom: "15px",
              color: "#ef4444",
            }}
          >
            ❌ {error}
          </div>
        )}

        <button
          onClick={handlePredict}
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            background: loading
              ? "#64748b"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          {loading ? (
            <>
              <Loader
                size={20}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Analyzing...
            </>
          ) : (
            "🎯 Get Prediction"
          )}
        </button>
      </div>

      {prediction && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.15)",
            borderRadius: "20px",
            padding: "40px",
            textAlign: "center",
            border: "1px solid rgba(16, 185, 129, 0.3)",
          }}
        >
          <h3
            style={{ fontSize: "24px", color: "#cbd5e1", marginBottom: "20px" }}
          >
            🎯 Prediction Result
          </h3>
          <div
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "#10b981",
              marginBottom: "10px",
            }}
          >
            {prediction.toLocaleString()}
          </div>
          <p style={{ fontSize: "18px", color: "#94a3b8" }}>
            Expected {predictionType === "day" ? "daily" : "hourly"} bike
            rentals
          </p>
        </div>
      )}
    </div>
  );
}
function ReviewsPage({ user }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reviewCategory, setReviewCategory] = useState("bike"); // bike, prediction, general
  const [activeFilter, setActiveFilter] = useState("all"); // all, bike, prediction, general

  // Load all reviews from localStorage
  useEffect(() => {
    const savedReviews = JSON.parse(localStorage.getItem("allReviews") || "[]");
    setReviews(savedReviews);
  }, []);

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    if (!review.trim()) {
      alert("Please write a review");
      return;
    }

    const newReview = {
      id: Date.now(),
      name: user?.name || "Anonymous",
      userEmail: user?.email,
      rating: rating,
      text: review,
      date: new Date().toISOString().split("T")[0],
      category: reviewCategory, // bike, prediction, or general
      timestamp: Date.now(),
    };

    // Add to all reviews
    const allReviews = JSON.parse(localStorage.getItem("allReviews") || "[]");
    const updatedAllReviews = [newReview, ...allReviews];
    localStorage.setItem("allReviews", JSON.stringify(updatedAllReviews));

    // Also add to user's personal reviews
    const userReviews = JSON.parse(localStorage.getItem("userReviews") || "[]");
    const updatedUserReviews = [newReview, ...userReviews];
    localStorage.setItem("userReviews", JSON.stringify(updatedUserReviews));

    setReviews(updatedAllReviews);
    setRating(0);
    setReview("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Filter reviews by category
  const filteredReviews =
    activeFilter === "all"
      ? reviews
      : reviews.filter((r) => r.category === activeFilter);

  // Calculate stats
  const bikeReviews = reviews.filter((r) => r.category === "bike");
  const predictionReviews = reviews.filter((r) => r.category === "prediction");
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "4.8";

  // Calculate satisfaction by category
  const bikeSatisfaction =
    bikeReviews.length > 0
      ? Math.round(
          (bikeReviews.filter((r) => r.rating >= 4).length /
            bikeReviews.length) *
            100,
        )
      : 98;

  const predictionSatisfaction =
    predictionReviews.length > 0
      ? Math.round(
          (predictionReviews.filter((r) => r.rating >= 4).length /
            predictionReviews.length) *
            100,
        )
      : 95;

  return (
    <div>
      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "15px",
            padding: "25px",
            textAlign: "center",
            border: "1px solid rgba(102, 126, 234, 0.2)",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>⭐</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "white" }}>
            {avgRating}
          </div>
          <div style={{ fontSize: "14px", color: "#94a3b8" }}>
            Average Rating
          </div>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "15px",
            padding: "25px",
            textAlign: "center",
            border: "1px solid rgba(102, 126, 234, 0.2)",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>🚴</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "white" }}>
            {bikeReviews.length}
          </div>
          <div style={{ fontSize: "14px", color: "#94a3b8" }}>Bike Reviews</div>
          <div style={{ fontSize: "12px", color: "#667eea", marginTop: "5px" }}>
            {bikeSatisfaction}% satisfaction
          </div>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "15px",
            padding: "25px",
            textAlign: "center",
            border: "1px solid rgba(102, 126, 234, 0.2)",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>📈</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "white" }}>
            {predictionReviews.length}
          </div>
          <div style={{ fontSize: "14px", color: "#94a3b8" }}>
            Prediction Reviews
          </div>
          <div style={{ fontSize: "12px", color: "#10b981", marginTop: "5px" }}>
            {predictionSatisfaction}% satisfaction
          </div>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "15px",
            padding: "25px",
            textAlign: "center",
            border: "1px solid rgba(102, 126, 234, 0.2)",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>💬</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "white" }}>
            {reviews.length}
          </div>
          <div style={{ fontSize: "14px", color: "#94a3b8" }}>
            Total Reviews
          </div>
        </div>
      </div>

      {showSuccess && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.2)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            borderRadius: "15px",
            padding: "15px",
            marginBottom: "20px",
            color: "#10b981",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "slideUp 0.3s ease",
          }}
        >
          ✓ Review submitted successfully! Visible to all users.
        </div>
      )}

      {/* Write Review Section */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: "20px",
          padding: "30px",
          border: "1px solid rgba(102, 126, 234, 0.2)",
          marginBottom: "30px",
        }}
      >
        <h3 style={{ color: "white", marginBottom: "20px" }}>
          ✏️ Share Your Experience
        </h3>

        {/* Category Selection */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              color: "#cbd5e1",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            Review Category
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            {[
              { value: "bike", label: "🚴 Bike Rental", color: "#667eea" },
              { value: "prediction", label: "📈 Prediction", color: "#10b981" },
              { value: "general", label: "💬 General", color: "#764ba2" },
            ].map((cat) => (
              <button
                key={cat.value}
                onClick={() => setReviewCategory(cat.value)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background:
                    reviewCategory === cat.value
                      ? `${cat.color}40`
                      : "rgba(30, 41, 59, 0.5)",
                  border: `2px solid ${reviewCategory === cat.value ? cat.color : "transparent"}`,
                  borderRadius: "10px",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px",
                  transition: "all 0.2s",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              color: "#cbd5e1",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            Your Rating
          </label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <span
                  style={{
                    fontSize: "32px",
                    color: star <= rating ? "#f59e0b" : "#64748b",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  ★
                </span>
              </button>
            ))}
            {rating > 0 && (
              <span
                style={{
                  color: "#f59e0b",
                  marginLeft: "10px",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                {rating}/5
              </span>
            )}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              color: "#cbd5e1",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            Your Review
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder={`Share your experience with our ${reviewCategory === "bike" ? "bike rental service" : reviewCategory === "prediction" ? "AI predictions" : "platform"}...`}
            style={{
              width: "100%",
              minHeight: "120px",
              padding: "15px",
              background: "rgba(30, 41, 59, 0.5)",
              border: "1px solid rgba(102, 126, 234, 0.3)",
              borderRadius: "10px",
              color: "white",
              resize: "vertical",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          style={{
            padding: "14px 35px",
            background:
              rating > 0 && review.trim()
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "rgba(100, 116, 139, 0.5)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: rating > 0 && review.trim() ? "pointer" : "not-allowed",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "16px",
          }}
        >
          📤 Submit Review
        </button>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {[
          { value: "all", label: "All Reviews", icon: "💬" },
          { value: "bike", label: "Bike Reviews", icon: "🚴" },
          { value: "prediction", label: "Prediction Reviews", icon: "📈" },
          { value: "general", label: "General", icon: "⭐" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            style={{
              padding: "10px 20px",
              background:
                activeFilter === filter.value
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "rgba(255, 255, 255, 0.05)",
              color: "white",
              border: "1px solid rgba(102, 126, 234, 0.2)",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div>
        <h3 style={{ color: "white", marginBottom: "20px", fontSize: "24px" }}>
          💭{" "}
          {activeFilter === "all"
            ? "All"
            : activeFilter === "bike"
              ? "Bike"
              : activeFilter === "prediction"
                ? "Prediction"
                : "General"}{" "}
          Reviews ({filteredReviews.length})
        </h3>

        {filteredReviews.length === 0 ? (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "15px",
              padding: "60px",
              textAlign: "center",
              border: "1px solid rgba(102, 126, 234, 0.2)",
            }}
          >
            <p style={{ color: "#94a3b8", fontSize: "18px" }}>
              No {activeFilter !== "all" && activeFilter} reviews yet. Be the
              first to share!
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: "15px",
                  padding: "25px",
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                  animation: "fadeIn 0.5s ease",
                  position: "relative",
                }}
              >
                {/* Category Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    padding: "4px 12px",
                    background:
                      rev.category === "bike"
                        ? "rgba(102, 126, 234, 0.3)"
                        : rev.category === "prediction"
                          ? "rgba(16, 185, 129, 0.3)"
                          : "rgba(118, 75, 162, 0.3)",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  {rev.category === "bike"
                    ? "🚴 BIKE"
                    : rev.category === "prediction"
                      ? "📈 PREDICTION"
                      : "💬 GENERAL"}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "45px",
                        height: "45px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <div
                        style={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "16px",
                        }}
                      >
                        {rev.name}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "12px" }}>
                        {rev.date}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "3px" }}>
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "18px",
                          color: i < rev.rating ? "#f59e0b" : "#64748b",
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p
                  style={{
                    color: "#cbd5e1",
                    fontSize: "14px",
                    lineHeight: "1.7",
                    margin: 0,
                  }}
                >
                  {rev.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function ProfilePage({
  user,
  bookings,
  onDeleteBooking,
  isLoadingBookings,
  showToast,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [myReviews, setMyReviews] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  useEffect(() => {
    const fetchPredictions = async () => {
      if (!user?.email) return;

      setIsLoadingPredictions(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/predictions?user_email=${encodeURIComponent(user.email)}`,
        );
        const data = await response.json();

        if (data.success) {
          setPredictions(data.predictions);
          console.log(`📊 Loaded ${data.predictions.length} predictions`);
        }
      } catch (error) {
        console.error("Error fetching predictions:", error);
      } finally {
        setIsLoadingPredictions(false);
      }
    };

    if (user?.email) {
      fetchPredictions();
    }
  }, [user]);
  // Load user's reviews from localStorage
  useEffect(() => {
    const userReviews = JSON.parse(localStorage.getItem("userReviews") || "[]");
    const myReviews = userReviews.filter((r) => r.userEmail === user?.email);
    setMyReviews(myReviews);
  }, [user]);

  return (
    <div>
      {/* Main Tabs */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          background: "rgba(255, 255, 255, 0.03)",
          padding: "10px",
          borderRadius: "15px",
          border: "1px solid rgba(102, 126, 234, 0.2)",
        }}
      >
        {["overview", "bookings", "predictions", "settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "12px",
              background:
                activeTab === tab
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "transparent",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              textTransform: "capitalize",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          {/* User Info Card */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "20px",
              padding: "30px",
              marginBottom: "20px",
              border: "1px solid rgba(102, 126, 234, 0.2)",
            }}
          >
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "36px",
                  fontWeight: "bold",
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h2 style={{ color: "white", margin: "0 0 5px 0" }}>
                  {user?.name}
                </h2>
                <p style={{ color: "#94a3b8", margin: 0 }}>{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginBottom: "30px",
            }}
          >
            {[
              {
                label: "Total Rides",
                value: bookings.length.toString(),
                color: "#667eea",
              },
              {
                label: "Total Predictions",
                value: predictions.length.toString(),
                color: "#10b981",
              },
              {
                label: "This Month",
                value: bookings
                  .filter(
                    (b) =>
                      new Date(b.date).getMonth() === new Date().getMonth(),
                  )
                  .length.toString(),
                color: "#764ba2",
              },
              { label: "CO₂ Saved", value: "18.7 kg", color: "#10b981" },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: "15px",
                  padding: "25px",
                  textAlign: "center",
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Access Sections */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
            }}
          >
            {/* My Bookings Card */}
            <div
              onClick={() => setActiveTab("bookings")}
              style={{
                background: "rgba(102, 126, 234, 0.15)",
                borderRadius: "15px",
                padding: "25px",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 30px rgba(102, 126, 234, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>📅</div>
              <h3
                style={{
                  color: "white",
                  fontSize: "18px",
                  marginBottom: "8px",
                }}
              >
                My Bookings
              </h3>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "14px",
                  marginBottom: "15px",
                }}
              >
                View all your rides
              </p>
              <div
                style={{
                  color: "#667eea",
                  fontWeight: "bold",
                  fontSize: "24px",
                }}
              >
                {bookings.length}
              </div>
            </div>
            <div
              onClick={() => setActiveTab("predictions")}
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                borderRadius: "15px",
                padding: "25px",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 30px rgba(16, 185, 129, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>📊</div>
              <h3
                style={{
                  color: "white",
                  fontSize: "18px",
                  marginBottom: "8px",
                }}
              >
                My Predictions
              </h3>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "14px",
                  marginBottom: "15px",
                }}
              >
                View prediction history
              </p>
              <div
                style={{
                  color: "#10b981",
                  fontWeight: "bold",
                  fontSize: "24px",
                }}
              >
                {predictions.length}
              </div>
            </div>
            {/* Settings Card */}
            <div
              onClick={() => setActiveTab("settings")}
              style={{
                background: "rgba(118, 75, 162, 0.15)",
                borderRadius: "15px",
                padding: "25px",
                border: "1px solid rgba(118, 75, 162, 0.3)",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 30px rgba(118, 75, 162, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>⚙️</div>
              <h3
                style={{
                  color: "white",
                  fontSize: "18px",
                  marginBottom: "8px",
                }}
              >
                Settings
              </h3>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "14px",
                  marginBottom: "15px",
                }}
              >
                Customize your experience
              </p>
              <div
                style={{
                  color: "#764ba2",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Appearance, Privacy & More
              </div>
            </div>

            {/* My Reviews Card */}
            <div
              style={{
                background: "rgba(245, 158, 11, 0.15)",
                borderRadius: "15px",
                padding: "25px",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 30px rgba(245, 158, 11, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>⭐</div>
              <h3
                style={{
                  color: "white",
                  fontSize: "18px",
                  marginBottom: "8px",
                }}
              >
                My Reviews
              </h3>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "14px",
                  marginBottom: "15px",
                }}
              >
                Your feedback history
              </p>
              <div
                style={{
                  color: "#f59e0b",
                  fontWeight: "bold",
                  fontSize: "24px",
                }}
              >
                {myReviews.length}
              </div>
            </div>
          </div>

          {/* Recent Reviews Section */}
          {myReviews.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3
                style={{
                  color: "white",
                  marginBottom: "15px",
                  fontSize: "20px",
                }}
              >
                📝 Your Recent Reviews
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {myReviews.slice(0, 3).map((review, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      borderRadius: "12px",
                      padding: "18px",
                      border: "1px solid rgba(102, 126, 234, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "5px" }}>
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            style={{
                              color: i < review.rating ? "#f59e0b" : "#64748b",
                              fontSize: "18px",
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                        {review.date}
                      </span>
                    </div>
                    <p
                      style={{
                        color: "#cbd5e1",
                        fontSize: "14px",
                        margin: 0,
                        lineHeight: "1.6",
                      }}
                    >
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h3 style={{ color: "white", margin: 0 }}>
              📅 My Bookings ({bookings.length})
            </h3>
            <ExportButton
              data={bookings}
              filename="my-bookings.csv"
              label="Export Bookings"
              onExport={() => showToast("Bookings exported!", "success")}
            />
          </div>

          {isLoadingBookings ? (
            <LoadingSkeleton type="booking" count={3} />
          ) : bookings.length === 0 ? (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: "20px",
                padding: "60px",
                textAlign: "center",
                border: "1px solid rgba(102, 126, 234, 0.2)",
              }}
            >
              <p style={{ color: "#94a3b8", fontSize: "18px" }}>
                No bookings yet
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "12px",
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      marginBottom: "5px",
                    }}
                  >
                    {booking.bike}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "13px" }}>
                    📍 {booking.station}, {booking.city} • {booking.date} @{" "}
                    {booking.startTime}
                  </div>
                  <div
                    style={{
                      color: "#10b981",
                      marginTop: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    ₹{booking.totalPrice + 20}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to cancel this booking?",
                      )
                    ) {
                      onDeleteBooking(booking.id);
                    }
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "rgba(239, 68, 68, 0.2)",
                    color: "#ef4444",
                    border: "2px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  🗑️ Cancel
                </button>
              </div>
            ))
          )}
        </div>
      )}
      {/* NEW: Predictions Tab */}
      {activeTab === "predictions" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h3 style={{ color: "white", margin: 0 }}>
              📊 My Predictions ({predictions.length})
            </h3>
            <ExportButton
              data={predictions}
              filename="my-predictions.csv"
              label="Export Predictions"
              onExport={() => showToast("Predictions exported!", "success")}
            />
          </div>

          {isLoadingPredictions ? (
            <LoadingSkeleton type="prediction" count={3} />
          ) : predictions.length === 0 ? (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: "20px",
                padding: "60px",
                textAlign: "center",
                border: "1px solid rgba(102, 126, 234, 0.2)",
              }}
            >
              <p style={{ color: "#94a3b8", fontSize: "18px" }}>
                No predictions yet. Try the Predict page!
              </p>
            </div>
          ) : (
            predictions.map((pred) => (
              <div
                key={pred.id}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "12px",
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "35px",
                        height: "35px",
                        borderRadius: "10px",
                        background:
                          pred.type === "day"
                            ? "rgba(102, 126, 234, 0.2)"
                            : "rgba(16, 185, 129, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                      }}
                    >
                      {pred.type === "day" ? "📅" : "⏰"}
                    </div>
                    <div>
                      <div
                        style={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "15px",
                        }}
                      >
                        {pred.type === "day" ? "Daily" : "Hourly"} Prediction
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "12px" }}>
                        {new Date(pred.date).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(30, 41, 59, 0.5)",
                      borderRadius: "8px",
                      padding: "12px",
                      marginTop: "10px",
                    }}
                  >
                    <div
                      style={{
                        color: "#10b981",
                        fontSize: "24px",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      {pred.value} rentals
                    </div>
                    {pred.input && typeof pred.input === "object" && (
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: "11px",
                          marginTop: "8px",
                        }}
                      >
                        🌡️ {pred.input.temperature}°C • 💧 {pred.input.humidity}
                        % • 💨 {pred.input.windSpeed} km/h • 🌤️{" "}
                        {pred.input.weather}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {/* Settings Tab */}
      {activeTab === "settings" && (
        <SettingsPage bookings={bookings} user={user} />
      )}
    </div>
  );
}
function SmartChatBot({ onClose, setActiveTab, onBookingComplete, user }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: '👋 Hi! I\'m your AI bike assistant. Try saying:\n\n💬 "Book a scooter in Mumbai for 2 hours"\n🎤 Or use voice input for hands-free booking!',
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);

  const recognitionRef = React.useRef(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  React.useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-IN";
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      if (event.error === "aborted") return;
      console.error("Speech error:", event.error);
      setIsListening(false);
    };

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const startVoice = () => {
    if (!recognitionRef.current) {
      alert("Voice not supported in this browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Voice start failed:", e);
    }
  };
  const speakMessage = (text) => {
    if (!voiceEnabled) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text for speech - remove ALL emojis and special characters
    const cleanText = text
      // Remove markdown formatting
      .replace(/[*#_`]/g, "")
      // Remove bullet points
      .replace(/[•·]/g, "")
      // Convert line breaks to natural pauses
      .replace(/\n\n/g, ". ")
      .replace(/\n/g, " ")
      // Remove emojis using regex (covers all emoji ranges)
      .replace(/[\u{1F600}-\u{1F64F}]/gu, "") // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, "") // Misc Symbols and Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, "") // Transport and Map
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "") // Flags
      .replace(/[\u{2600}-\u{26FF}]/gu, "") // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, "") // Dingbats
      .replace(/[\u{FE00}-\u{FE0F}]/gu, "") // Variation Selectors
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, "") // Supplemental Symbols and Pictographs
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, "") // Chess Symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, "") // Symbols and Pictographs Extended-A
      // Remove currency symbols
      .replace(/₹/g, "rupees")
      .replace(/\$/g, "dollars")
      // Remove special characters
      .replace(/[★☆]/g, "star")
      // Remove extra spaces
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-IN";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };
  const handlePDFUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf")) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "❌ Please upload a PDF file only.",
        },
      ]);
      return;
    }

    setUploadingPDF(true);
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: `📄 Uploaded: ${file.name}`,
      },
    ]);

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: "🔄 Processing your PDF... Please wait.",
      },
    ]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_email", user?.email || "anonymous");
      const response = await fetch(`${API_BASE_URL}/api/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `✅ PDF processed successfully!\n\nExtracted data:\n🌡️ Temperature: ${data.extracted_data.temperature}°C\n💧 Humidity: ${data.extracted_data.humidity}%\n💨 Wind: ${data.extracted_data.windSpeed} km/h\n📅 Date: ${data.extracted_data.date}\n🌤️ Weather: ${data.extracted_data.weather}\n\nRedirecting to prediction page...`,
          },
        ]);

        sessionStorage.setItem(
          "pdfPredictionData",
          JSON.stringify(data.extracted_data),
        );

        setTimeout(() => {
          onClose();
          setActiveTab("prediction");
        }, 3000);
      } else {
        throw new Error(data.error || "Failed to process PDF");
      }
    } catch (err) {
      console.error("PDF upload error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `❌ Error processing PDF: ${err.message}\n\nPlease try again or enter data manually.`,
        },
      ]);
    } finally {
      setUploadingPDF(false);
      event.target.value = "";
    }
  };

  const sendMessage = async (messageText = null) => {
    const userText = messageText || input.trim();
    if (!userText || isLoading) return;

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          user_email: user?.email || "anonymous",
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 Backend response:", data);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply,
        },
      ]);

      // Speak the bot's response
      if (voiceEnabled) {
        setTimeout(() => speakMessage(data.reply), 300);
      }

      if (data.action === "BOOK" && data.booking) {
        console.log("✅ Booking confirmed:", data.booking);

        if (onBookingComplete) {
          onBookingComplete({
            id: data.booking.id,
            bike: data.booking.bikeType,
            station: `${data.booking.city} Station`,
            city: data.booking.city,
            date: data.booking.date,
            startTime: data.booking.startTime,
            duration: data.booking.duration,
            totalPrice: data.booking.totalPrice,
            status: "confirmed",
          });
        }

        setTimeout(() => {
          onClose();
          setActiveTab("profile");
        }, 2000);
      }

      if (data.action === "REDIRECT_PREDICTION") {
        setTimeout(() => {
          onClose();
          setActiveTab("prediction");
        }, 1500);
      }
    } catch (error) {
      console.error("❌ Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Connection error. Please check if backend is running (python app.py)",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      emoji: "🏖️",
      text: "Book in Mumbai",
      action: "book a scooter in mumbai for 2 hours",
    },
    {
      emoji: "🚴",
      text: "Book in Delhi",
      action: "book a sports bike in delhi for 3 hours",
    },
    {
      emoji: "💰",
      text: "Check prices",
      action: "what are the bike rental prices",
    },
  ];

  const handleQuickAction = (action) => {
    setInput(action);
    sendMessage(action);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "480px",
        height: "700px",
        background:
          "linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))",
        borderRadius: "20px",
        boxShadow:
          "0 25px 70px rgba(0,0,0,0.7), 0 0 0 1px rgba(102, 126, 234, 0.3)",
        display: "flex",
        flexDirection: "column",
        zIndex: 2000,
        animation: "slideUp 0.4s ease",
        border: "1px solid rgba(102, 126, 234, 0.3)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background:
            "linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            }}
          >
            🤖
          </div>
          <div>
            <div
              style={{ color: "white", fontWeight: "bold", fontSize: "17px" }}
            >
              AI Assistant
            </div>
            <div
              style={{
                color: "#10b981",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  animation: "pulse 2s infinite",
                }}
              />
              Online • Ready to help
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setVoiceEnabled(!voiceEnabled);
            if (isSpeaking) stopSpeaking();
          }}
          style={{
            padding: "8px 12px",
            background: voiceEnabled
              ? "rgba(16, 185, 129, 0.2)"
              : "rgba(239, 68, 68, 0.2)",
            border: `2px solid ${voiceEnabled ? "#10b981" : "#ef4444"}`,
            borderRadius: "10px",
            color: voiceEnabled ? "#10b981" : "#ef4444",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            transition: "all 0.2s",
          }}
          title={voiceEnabled ? "Voice enabled" : "Voice disabled"}
        >
          {isSpeaking ? "🔊" : voiceEnabled ? "🔉" : "🔇"}
          {voiceEnabled ? "ON" : "OFF"}
        </button>
        <X
          onClick={onClose}
          style={{
            cursor: "pointer",
            color: "white",
            transition: "transform 0.2s",
          }}
          size={24}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "rotate(90deg)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "rotate(0deg)")
          }
        />
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          scrollBehavior: "smooth",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent:
                m.sender === "bot" || m.sender === "system"
                  ? "flex-start"
                  : "flex-end",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "14px 18px",
                borderRadius:
                  m.sender === "bot" || m.sender === "system"
                    ? "6px 18px 18px 18px"
                    : "18px 6px 18px 18px",
                background:
                  m.sender === "bot" || m.sender === "system"
                    ? "rgba(255,255,255,0.1)"
                    : "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white",
                fontSize: "14px",
                lineHeight: "1.6",
                wordWrap: "break-word",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                whiteSpace: "pre-line",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "6px 18px 18px 18px",
                background: "rgba(255,255,255,0.1)",
                color: "#94a3b8",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Loader
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>
      {isSpeaking && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <button
            onClick={stopSpeaking}
            style={{
              padding: "10px 20px",
              background: "rgba(239, 68, 68, 0.2)",
              border: "2px solid #ef4444",
              borderRadius: "10px",
              color: "#ef4444",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🔇 Stop Speaking
          </button>
        </div>
      )}
      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div
          style={{
            padding: "0 20px 15px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              marginBottom: "5px",
              fontWeight: "600",
            }}
          >
            Quick Actions:
          </div>
          {quickActions.map((qa, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAction(qa.action)}
              style={{
                padding: "12px 16px",
                background: "rgba(102, 126, 234, 0.15)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                borderRadius: "12px",
                color: "#cbd5e1",
                cursor: "pointer",
                fontSize: "14px",
                textAlign: "left",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(102, 126, 234, 0.25)";
                e.currentTarget.style.transform = "translateX(5px)";
                e.currentTarget.style.borderColor = "rgba(102, 126, 234, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(102, 126, 234, 0.15)";
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.borderColor = "rgba(102, 126, 234, 0.3)";
              }}
            >
              <span style={{ fontSize: "20px" }}>{qa.emoji}</span>
              {qa.text}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div
        style={{
          padding: "15px 20px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(15, 23, 42, 0.8)",
        }}
      >
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button
            onClick={startVoice}
            disabled={isLoading || uploadingPDF}
            style={{
              padding: "12px",
              background: isListening
                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                : "rgba(102, 126, 234, 0.2)",
              border: "1px solid rgba(102, 126, 234, 0.3)",
              borderRadius: "12px",
              color: "white",
              cursor: isLoading || uploadingPDF ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              transition: "all 0.3s",
              boxShadow: isListening
                ? "0 0 20px rgba(239, 68, 68, 0.5)"
                : "none",
            }}
            title={isListening ? "Stop recording" : "Voice input"}
          >
            {isListening ? "🔴" : "🎤"}
          </button>

          <label
            style={{
              padding: "12px",
              background: uploadingPDF ? "#64748b" : "rgba(102, 126, 234, 0.2)",
              border: "1px solid rgba(102, 126, 234, 0.3)",
              borderRadius: "12px",
              color: "white",
              cursor: uploadingPDF ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              transition: "all 0.3s",
            }}
            title="Upload PDF for prediction"
          >
            {uploadingPDF ? (
              <Loader
                size={20}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              "📄"
            )}
            <input
              type="file"
              accept=".pdf"
              onChange={handlePDFUpload}
              disabled={uploadingPDF || isLoading}
              style={{ display: "none" }}
            />
          </label>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !isLoading && !uploadingPDF && sendMessage()
            }
            placeholder={
              isLoading
                ? "Processing..."
                : uploadingPDF
                  ? "Uploading PDF..."
                  : isListening
                    ? "Listening..."
                    : "Type your message..."
            }
            disabled={isLoading || isListening || uploadingPDF}
            style={{
              flex: 1,
              padding: "12px 18px",
              borderRadius: "12px",
              border: "1px solid rgba(102, 126, 234, 0.3)",
              outline: "none",
              background: "rgba(30, 41, 59, 0.8)",
              color: "white",
              fontSize: "14px",
              transition: "all 0.2s",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "rgba(102, 126, 234, 0.6)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "rgba(102, 126, 234, 0.3)")
            }
          />

          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim() || isListening || uploadingPDF}
            style={{
              padding: "12px 18px",
              background:
                isLoading || !input.trim() || isListening || uploadingPDF
                  ? "rgba(100, 116, 139, 0.5)"
                  : "linear-gradient(135deg, #667eea, #764ba2)",
              border: "none",
              borderRadius: "12px",
              color: "white",
              cursor:
                isLoading || !input.trim() || isListening || uploadingPDF
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                isLoading || !input.trim() || isListening || uploadingPDF
                  ? "none"
                  : "0 4px 15px rgba(102, 126, 234, 0.4)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isLoading && input.trim() && !isListening && !uploadingPDF) {
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <Send size={18} />
          </button>
        </div>

        <div
          style={{
            fontSize: "11px",
            color: "#64748b",
            textAlign: "center",
          }}
        >
          🎤 Voice | 📄 PDF Upload | 💬 Text
        </div>
      </div>
    </div>
  );
}

/* Helper */
function calculateChatPrice(bike, hours) {
  const rates = { scooter: 200, sports: 500, cruiser: 700 };
  return (rates[bike?.toLowerCase()] || 300) * Number(hours || 1);
}
