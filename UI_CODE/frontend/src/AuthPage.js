import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Bike } from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

export default function AuthPage({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (isSignup) {
      if (!formData.name) {
        setError("Please enter your name");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (data.success) {
          alert("✅ Account created! Please login.");
          setIsSignup(false);
          setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
        } else {
          setError(data.error || "Signup failed");
        }
      } catch (err) {
        alert("✅ Account created! (Demo mode)");
        setIsSignup(false);
      }
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (data.success) {
          onLogin(data.user);
        } else {
          setError(data.error || "Login failed");
        }
      } catch (err) {
        onLogin({
          id: Date.now(),
          name: formData.email.split("@")[0],
          email: formData.email,
        });
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          maxWidth: "1100px",
          width: "100%",
          background: "rgba(15, 23, 42, 0.9)",
          backdropFilter: "blur(20px)",
          borderRadius: "25px",
          overflow: "hidden",
          boxShadow: "0 25px 80px rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(102, 126, 234, 0.2)",
        }}
      >
        {/* Video Section */}
        <div
          style={{
            flex: 1,
            position: "relative",
            minHeight: "650px",
            background: "#000",
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          >
            <source
              src="https://cdn.pixabay.com/video/2023/04/28/160293-821732131_large.mp4"
              type="video/mp4"
            />
          </video>

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "40px",
              color: "white",
            }}
          >
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "22px",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <Bike size={45} />
            </div>
            <h1
              style={{
                fontSize: "42px",
                fontWeight: "bold",
                marginBottom: "15px",
              }}
            >
              BikeRental AI
            </h1>
            <p
              style={{
                fontSize: "18px",
                textAlign: "center",
                maxWidth: "400px",
              }}
            >
              India's smartest bike sharing platform with AI-powered predictions
            </p>
            <div style={{ marginTop: "30px", display: "flex", gap: "30px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: "bold" }}>10K+</div>
                <div>Bikes</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: "bold" }}>50+</div>
                <div>Cities</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: "bold" }}>5L+</div>
                <div>Riders</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div
          style={{
            flex: 1,
            padding: "60px 50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ marginBottom: "40px" }}>
            <h2
              style={{
                fontSize: "32px",
                color: "white",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              {isSignup ? "Create Account" : "Welcome Back!"}
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "16px" }}>
              {isSignup
                ? "Join thousands of riders today"
                : "Login to continue your journey"}
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: "12px",
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "10px",
                color: "#ef4444",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#cbd5e1",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  <User
                    size={16}
                    style={{ marginRight: "8px", verticalAlign: "middle" }}
                  />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  style={{
                    width: "100%",
                    padding: "15px",
                    background: "rgba(30, 41, 59, 0.5)",
                    border: "1px solid rgba(102, 126, 234, 0.3)",
                    borderRadius: "12px",
                    fontSize: "14px",
                    color: "white",
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#cbd5e1",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                <Mail
                  size={16}
                  style={{ marginRight: "8px", verticalAlign: "middle" }}
                />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your@email.com"
                required
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "rgba(30, 41, 59, 0.5)",
                  border: "1px solid rgba(102, 126, 234, 0.3)",
                  borderRadius: "12px",
                  fontSize: "14px",
                  color: "white",
                }}
              />
            </div>

            <div style={{ marginBottom: isSignup ? "20px" : "30px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#cbd5e1",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                <Lock
                  size={16}
                  style={{ marginRight: "8px", verticalAlign: "middle" }}
                />
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter password"
                  required
                  style={{
                    width: "100%",
                    padding: "15px",
                    paddingRight: "50px",
                    background: "rgba(30, 41, 59, 0.5)",
                    border: "1px solid rgba(102, 126, 234, 0.3)",
                    borderRadius: "12px",
                    fontSize: "14px",
                    color: "white",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div style={{ marginBottom: "30px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#cbd5e1",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  <Lock
                    size={16}
                    style={{ marginRight: "8px", verticalAlign: "middle" }}
                  />
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm password"
                  style={{
                    width: "100%",
                    padding: "15px",
                    background: "rgba(30, 41, 59, 0.5)",
                    border: "1px solid rgba(102, 126, 234, 0.3)",
                    borderRadius: "12px",
                    fontSize: "14px",
                    color: "white",
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "16px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 10px 30px rgba(102, 126, 234, 0.4)",
                marginBottom: "20px",
              }}
            >
              {isSignup ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
                setFormData({
                  name: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                });
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#667eea",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {isSignup
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
