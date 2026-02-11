import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  Palette,
  Bell,
  Shield,
  User,
  Settings,
  Lock,
  Mail,
  Globe,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Smartphone,
  Download,
  Trash2,
  HelpCircle,
  Info,
} from "lucide-react";
import { useToast } from "./components/Toast";
import LoadingSkeleton from "./components/LoadingSkeleton";
import { ExportButton } from "./utils/exportCSV";
export default function SettingsPage({ bookings = [], user }) {
  const [activeSection, setActiveSection] = useState("activity");
  const [predictions, setPredictions] = useState([]);
  const { showToast, ToastComponent } = useToast();
  // Fetch predictions when component mounts
  React.useEffect(() => {
    const fetchPredictions = async () => {
      if (!user?.email) return;

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
      }
    };

    fetchPredictions();
  }, [user]);
  const [settings, setSettings] = useState({
    theme: localStorage.getItem("theme-mode") || "dark",
    notifications: {
      bookings: true,
      promotions: false,
      updates: true,
    },
    privacy: {
      showEmail: false,
      showBookings: true,
    },
    sounds: true,
    language: "en",
  });

  // Theme colors
  const themes = [
    { name: "Dark Blue", bg: "#0a0e1a", accent: "#667eea", icon: "🌙" },
    {
      name: "Light Mode",
      bg: "#f8fafc",
      accent: "#667eea",
      icon: "☀️",
      isLight: true,
    },
    { name: "Purple Night", bg: "#1a0a1e", accent: "#764ba2", icon: "💜" },
    { name: "Green Dark", bg: "#0a1a0e", accent: "#10b981", icon: "🌿" },
    { name: "Orange Dusk", bg: "#1a0f0a", accent: "#f59e0b", icon: "🌅" },
    { name: "Red Wine", bg: "#1a0a0a", accent: "#ef4444", icon: "🍷" },
    { name: "Cyan Dark", bg: "#0a1a1a", accent: "#06b6d4", icon: "💎" },
  ];

  const [currentTheme, setCurrentTheme] = useState(
    JSON.parse(localStorage.getItem("app-theme") || JSON.stringify(themes[0])),
  );

  // Prepare booking data
  const bookingsByCity = {};
  const bookingsByDate = {};

  bookings.forEach((booking) => {
    bookingsByCity[booking.city] = (bookingsByCity[booking.city] || 0) + 1;
    const date = booking.date;
    bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
  });

  const cityData = Object.entries(bookingsByCity).map(([city, count]) => ({
    city,
    bookings: count,
  }));

  const dateData = Object.entries(bookingsByDate)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      bookings: count,
    }));

  const applyTheme = (theme) => {
    setCurrentTheme(theme);
    document.body.style.background = theme.bg;
    localStorage.setItem("app-theme", JSON.stringify(theme));

    // Notify App.js about theme change
    window.dispatchEvent(new CustomEvent("themeChanged"));
  };

  const sections = [
    { id: "activity", label: "Activity", icon: Activity },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "account", label: "Account", icon: User },
    { id: "about", label: "About & Help", icon: HelpCircle },
  ];

  return (
    <div style={{ display: "flex", gap: "20px", minHeight: "600px" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "280px",
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: "20px",
          padding: "20px",
          border: "1px solid rgba(102, 126, 234, 0.2)",
        }}
      >
        <h3 style={{ color: "white", marginBottom: "20px", fontSize: "20px" }}>
          ⚙️ Settings
        </h3>

        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                width: "100%",
                padding: "15px",
                background:
                  activeSection === section.id
                    ? "rgba(102, 126, 234, 0.2)"
                    : "transparent",
                border:
                  activeSection === section.id
                    ? "1px solid rgba(102, 126, 234, 0.4)"
                    : "1px solid transparent",
                borderRadius: "12px",
                color: "white",
                cursor: "pointer",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <Icon size={20} />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {/* Activity */}
        {activeSection === "activity" && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "20px",
              padding: "30px",
              border: "1px solid rgba(102, 126, 234, 0.2)",
            }}
          >
            <h2
              style={{ color: "white", marginBottom: "25px", fontSize: "24px" }}
            >
              📊 Your Activity
            </h2>

            {bookings.length === 0 && predictions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px",
                  color: "#94a3b8",
                }}
              >
                <Activity
                  size={60}
                  style={{ opacity: 0.3, marginBottom: "20px" }}
                />
                <p style={{ fontSize: "18px" }}>
                  No activity yet. Book your first ride or make a prediction!
                </p>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "15px",
                    marginBottom: "30px",
                  }}
                >
                  {[
                    {
                      label: "Total Bookings",
                      value: bookings.length,
                      color: "#667eea",
                    },
                    {
                      label: "Total Predictions",
                      value: predictions.length,
                      color: "#10b981",
                    },
                    {
                      label: "This Month",
                      value: bookings.filter(
                        (b) =>
                          new Date(b.date).getMonth() === new Date().getMonth(),
                      ).length,
                      color: "#764ba2",
                    },
                    {
                      label: "Total Spent",
                      value: `₹${bookings.reduce((s, b) => s + (b.totalPrice || 0), 0)}`,
                      color: "#f59e0b",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(30, 41, 59, 0.5)",
                        borderRadius: "12px",
                        padding: "20px",
                        textAlign: "center",
                        border: "1px solid rgba(102, 126, 234, 0.2)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: stat.color,
                          marginBottom: "5px",
                        }}
                      >
                        {stat.value}
                      </div>
                      <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      bookings.length > 0 ? "1fr 1fr" : "1fr",
                    gap: "20px",
                    marginBottom: "30px",
                  }}
                >
                  {/* Bookings by City Chart */}
                  {bookings.length > 0 &&
                    (() => {
                      const bookingsByCity = {};
                      bookings.forEach((booking) => {
                        bookingsByCity[booking.city] =
                          (bookingsByCity[booking.city] || 0) + 1;
                      });
                      const cityData = Object.entries(bookingsByCity).map(
                        ([city, count]) => ({
                          city,
                          bookings: count,
                        }),
                      );

                      return (
                        <div
                          style={{
                            background: "rgba(30, 41, 59, 0.5)",
                            borderRadius: "15px",
                            padding: "20px",
                            border: "1px solid rgba(102, 126, 234, 0.2)",
                          }}
                        >
                          <h3
                            style={{
                              color: "white",
                              marginBottom: "20px",
                              fontSize: "16px",
                            }}
                          >
                            🚴 Bookings by City
                          </h3>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={cityData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.1)"
                              />
                              <XAxis
                                dataKey="city"
                                stroke="#94a3b8"
                                style={{ fontSize: "11px" }}
                              />
                              <YAxis
                                stroke="#94a3b8"
                                style={{ fontSize: "11px" }}
                              />
                              <Tooltip
                                contentStyle={{
                                  background: "rgba(15, 23, 42, 0.95)",
                                  border: "1px solid rgba(102, 126, 234, 0.3)",
                                  borderRadius: "8px",
                                  color: "white",
                                }}
                              />
                              <Bar
                                dataKey="bookings"
                                fill={currentTheme.accent}
                                radius={[8, 8, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      );
                    })()}

                  {/* Predictions Trend Chart */}
                  {predictions.length > 0 &&
                    (() => {
                      // Group predictions by date
                      const predictionsByDate = {};
                      predictions.forEach((pred) => {
                        const date = pred.date.split(" ")[0]; // Get date part
                        if (!predictionsByDate[date]) {
                          predictionsByDate[date] = {
                            day: 0,
                            hour: 0,
                            total: 0,
                          };
                        }
                        if (pred.type === "day") {
                          predictionsByDate[date].day++;
                        } else {
                          predictionsByDate[date].hour++;
                        }
                        predictionsByDate[date].total++;
                      });

                      const predData = Object.entries(predictionsByDate)
                        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                        .slice(-10) // Last 10 dates
                        .map(([date, counts]) => ({
                          date: new Date(date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          }),
                          predictions: counts.total,
                          day: counts.day,
                          hour: counts.hour,
                        }));

                      return (
                        <div
                          style={{
                            background: "rgba(30, 41, 59, 0.5)",
                            borderRadius: "15px",
                            padding: "20px",
                            border: "1px solid rgba(102, 126, 234, 0.2)",
                          }}
                        >
                          <h3
                            style={{
                              color: "white",
                              marginBottom: "20px",
                              fontSize: "16px",
                            }}
                          >
                            📈 Predictions Over Time
                          </h3>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={predData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.1)"
                              />
                              <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                style={{ fontSize: "11px" }}
                              />
                              <YAxis
                                stroke="#94a3b8"
                                style={{ fontSize: "11px" }}
                              />
                              <Tooltip
                                contentStyle={{
                                  background: "rgba(15, 23, 42, 0.95)",
                                  border: "1px solid rgba(102, 126, 234, 0.3)",
                                  borderRadius: "8px",
                                  color: "white",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="predictions"
                                stroke="#10b981"
                                strokeWidth={3}
                                name="Total"
                              />
                              <Line
                                type="monotone"
                                dataKey="day"
                                stroke="#667eea"
                                strokeWidth={2}
                                name="Day"
                              />
                              <Line
                                type="monotone"
                                dataKey="hour"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                name="Hour"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      );
                    })()}
                </div>

                {/* Recent Activity */}
                {(bookings.length > 0 || predictions.length > 0) && (
                  <div>
                    <h3
                      style={{
                        color: "white",
                        marginBottom: "15px",
                        fontSize: "18px",
                      }}
                    >
                      📋 Recent Activity
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {/* Combine bookings and predictions, sort by date */}
                      {[
                        ...bookings.map((b) => ({
                          type: "booking",
                          date: b.createdAt || b.date,
                          data: b,
                        })),
                        ...predictions.map((p) => ({
                          type: "prediction",
                          date: p.date,
                          data: p,
                        })),
                      ]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 10)
                        .map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: "rgba(30, 41, 59, 0.5)",
                              borderRadius: "12px",
                              padding: "15px 20px",
                              border: "1px solid rgba(102, 126, 234, 0.2)",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            {item.type === "booking" ? (
                              <>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "10px",
                                      background: "rgba(102, 126, 234, 0.2)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "20px",
                                    }}
                                  >
                                    🚴
                                  </div>
                                  <div>
                                    <div
                                      style={{
                                        color: "white",
                                        fontWeight: "600",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {item.data.bike} in {item.data.city}
                                    </div>
                                    <div
                                      style={{
                                        color: "#94a3b8",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {item.data.duration}h • ₹
                                      {item.data.totalPrice}
                                    </div>
                                  </div>
                                </div>
                                <div
                                  style={{ color: "#667eea", fontSize: "12px" }}
                                >
                                  {new Date(item.date).toLocaleDateString()}
                                </div>
                              </>
                            ) : (
                              <>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "10px",
                                      background: "rgba(16, 185, 129, 0.2)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "20px",
                                    }}
                                  >
                                    📊
                                  </div>
                                  <div>
                                    <div
                                      style={{
                                        color: "white",
                                        fontWeight: "600",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {item.data.type === "day"
                                        ? "Daily"
                                        : "Hourly"}{" "}
                                      Prediction
                                    </div>
                                    <div
                                      style={{
                                        color: "#94a3b8",
                                        fontSize: "12px",
                                      }}
                                    >
                                      Predicted: {item.data.value} rentals
                                    </div>
                                  </div>
                                </div>
                                <div
                                  style={{ color: "#10b981", fontSize: "12px" }}
                                >
                                  {new Date(item.date).toLocaleDateString()}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Appearance */}
        {activeSection === "appearance" && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "20px",
              padding: "30px",
              border: "1px solid rgba(102, 126, 234, 0.2)",
            }}
          >
            <h2
              style={{ color: "white", marginBottom: "25px", fontSize: "24px" }}
            >
              🎨 Appearance
            </h2>

            <div style={{ marginBottom: "30px" }}>
              <h3
                style={{
                  color: "white",
                  marginBottom: "15px",
                  fontSize: "18px",
                }}
              >
                Theme
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "15px",
                }}
              >
                {themes.map((theme, i) => (
                  <button
                    key={i}
                    onClick={() => applyTheme(theme)}
                    style={{
                      background: theme.bg,
                      border: `3px solid ${currentTheme.bg === theme.bg ? theme.accent : "rgba(255,255,255,0.1)"}`,
                      borderRadius: "15px",
                      padding: "25px",
                      cursor: "pointer",
                      position: "relative",
                      transition: "all 0.3s",
                    }}
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}aa)`,
                        margin: "0 auto 15px",
                        fontSize: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {theme.icon}
                    </div>
                    <div
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      {theme.name}
                    </div>
                    {currentTheme.bg === theme.bg && (
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: theme.accent,
                          borderRadius: "50%",
                          width: "25px",
                          height: "25px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "14px",
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeSection === "notifications" && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "20px",
              padding: "30px",
              border: "1px solid rgba(102, 126, 234, 0.2)",
            }}
          >
            <h2
              style={{ color: "white", marginBottom: "25px", fontSize: "24px" }}
            >
              🔔 Notifications
            </h2>

            {[
              {
                key: "bookings",
                label: "Booking Updates",
                desc: "Get notified about your bookings",
              },
              {
                key: "promotions",
                label: "Promotions & Offers",
                desc: "Receive special deals and discounts",
              },
              {
                key: "updates",
                label: "App Updates",
                desc: "New features and improvements",
              },
            ].map((item) => (
              <div
                key={item.key}
                style={{
                  background: "rgba(30, 41, 59, 0.5)",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "15px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "white",
                      fontWeight: "600",
                      marginBottom: "5px",
                    }}
                  >
                    {item.label}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "13px" }}>
                    {item.desc}
                  </div>
                </div>
                <label
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: "50px",
                    height: "26px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.notifications[item.key]}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          [item.key]: e.target.checked,
                        },
                      })
                    }
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      cursor: "pointer",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: settings.notifications[item.key]
                        ? currentTheme.accent
                        : "#64748b",
                      borderRadius: "26px",
                      transition: "0.4s",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        content: "",
                        height: "18px",
                        width: "18px",
                        left: settings.notifications[item.key] ? "28px" : "4px",
                        bottom: "4px",
                        background: "white",
                        borderRadius: "50%",
                        transition: "0.4s",
                      }}
                    />
                  </span>
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Privacy */}
        {activeSection === "privacy" && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "20px",
              padding: "30px",
              border: "1px solid rgba(102, 126, 234, 0.2)",
            }}
          >
            <h2
              style={{ color: "white", marginBottom: "25px", fontSize: "24px" }}
            >
              🔒 Privacy & Security
            </h2>

            {[
              {
                key: "showEmail",
                label: "Show Email",
                desc: "Display your email in profile",
                icon: Mail,
              },
              {
                key: "showBookings",
                label: "Public Bookings",
                desc: "Show booking history publicly",
                icon: Activity,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  style={{
                    background: "rgba(30, 41, 59, 0.5)",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "15px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid rgba(102, 126, 234, 0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      alignItems: "center",
                    }}
                  >
                    <Icon size={24} color={currentTheme.accent} />
                    <div>
                      <div
                        style={{
                          color: "white",
                          fontWeight: "600",
                          marginBottom: "5px",
                        }}
                      >
                        {item.label}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "13px" }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <label
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "50px",
                      height: "26px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={settings.privacy[item.key]}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          privacy: {
                            ...settings.privacy,
                            [item.key]: e.target.checked,
                          },
                        })
                      }
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: settings.privacy[item.key]
                          ? currentTheme.accent
                          : "#64748b",
                        borderRadius: "26px",
                        transition: "0.4s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          height: "18px",
                          width: "18px",
                          left: settings.privacy[item.key] ? "28px" : "4px",
                          bottom: "4px",
                          background: "white",
                          borderRadius: "50%",
                          transition: "0.4s",
                        }}
                      />
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        )}

        {/* Account */}
        {activeSection === "account" && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "20px",
              padding: "30px",
              border: "1px solid rgba(102, 126, 234, 0.2)",
            }}
          >
            <h2
              style={{ color: "white", marginBottom: "25px", fontSize: "24px" }}
            >
              👤 Account
            </h2>

            <div
              style={{
                background: "rgba(30, 41, 59, 0.5)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px",
                border: "1px solid rgba(102, 126, 234, 0.2)",
              }}
            >
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "12px",
                  marginBottom: "5px",
                }}
              >
                Name
              </div>
              <div
                style={{ color: "white", fontSize: "16px", fontWeight: "600" }}
              >
                {user?.name}
              </div>
            </div>

            <div
              style={{
                background: "rgba(30, 41, 59, 0.5)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px",
                border: "1px solid rgba(102, 126, 234, 0.2)",
              }}
            >
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "12px",
                  marginBottom: "5px",
                }}
              >
                Email
              </div>
              <div
                style={{ color: "white", fontSize: "16px", fontWeight: "600" }}
              >
                {user?.email}
              </div>
            </div>

            <button
              style={{
                width: "100%",
                padding: "15px",
                background: "rgba(239, 68, 68, 0.2)",
                border: "2px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "12px",
                color: "#ef4444",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <Trash2 size={18} />
              Delete Account
            </button>
          </div>
        )}

        {/* About */}
        {activeSection === "about" && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "20px",
              padding: "30px",
              border: "1px solid rgba(102, 126, 234, 0.2)",
            }}
          >
            <h2
              style={{ color: "white", marginBottom: "25px", fontSize: "24px" }}
            >
              ℹ️ About & Help
            </h2>

            <div
              style={{
                background: "rgba(30, 41, 59, 0.5)",
                borderRadius: "12px",
                padding: "25px",
                marginBottom: "20px",
                textAlign: "center",
                border: "1px solid rgba(102, 126, 234, 0.2)",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>🚴</div>
              <h3 style={{ color: "white", marginBottom: "10px" }}>
                BikeRental AI
              </h3>
              <p style={{ color: "#94a3b8", marginBottom: "15px" }}>
                Version 3.0
              </p>
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                India's smartest bike sharing platform with AI-powered
                predictions
              </p>
            </div>

            {[
              {
                label: "Help Center",
                icon: HelpCircle,
                action: () =>
                  window.open(
                    "mailto:support@bikerental.ai?subject=Help%20Request",
                    "_blank",
                  ),
              },
              {
                label: "Terms of Service",
                icon: Info,
                action: () =>
                  alert(
                    "Terms of Service: By using BikeRental AI, you agree to our terms and conditions.",
                  ),
              },
              {
                label: "Privacy Policy",
                icon: Shield,
                action: () =>
                  alert(
                    "Privacy Policy: We protect your data and never share it with third parties.",
                  ),
              },
              {
                label: "Contact Support",
                icon: Mail,
                action: () =>
                  window.open("mailto:support@bikerental.ai", "_blank"),
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    width: "100%",
                    padding: "18px",
                    background: "rgba(30, 41, 59, 0.5)",
                    border: "1px solid rgba(102, 126, 234, 0.2)",
                    borderRadius: "12px",
                    color: "white",
                    cursor: "pointer",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(102, 126, 234, 0.2)";
                    e.currentTarget.style.borderColor =
                      "rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(30, 41, 59, 0.5)";
                    e.currentTarget.style.borderColor =
                      "rgba(102, 126, 234, 0.2)";
                  }}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {ToastComponent}
    </div>
  );
}
