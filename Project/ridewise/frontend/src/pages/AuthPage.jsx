import { useState } from "react";
import RideWiseBackground from "../background/NewBackground";
import Logo from "../logo/Logo";
import { useNavigate } from "react-router-dom";

export const AuthPage = () => {
  const [mode, setMode] = useState("login"); // login | signup
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    const resetForm = () => {
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    };
    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async () => {
      try
      {
            setLoading(true);
            if (mode === "signup") 
            {
              // later: validate credentials via API
              if (form.password !== form.confirmPassword) {
                setLoading(false);
                return alert("Passwords do not match");
              }
              const res = await fetch("http://localhost:5000/api/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: form.name,
                  email: form.email,
                  password: form.password,
                }),
              });
              const data = await res.json();

              if (!res.ok)
              {
                setLoading(false)
                return alert(data.message);
              } 
              alert("Signup successful! Please login.");
              resetForm();
              setMode("login");
              // navigate("/home"); // ✅ redirect to Home
            } 
        if(mode === "login") {
            const res = await fetch("http://localhost:5000/api/user/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: form.email,
                password: form.password,
              }),
            });
            console.log("LOGIN DATA:", {
              email: form.email,
              password: form.password,
            });

            const data = await res.json();
            if (!res.ok){
              setLoading(false);
              return alert(data.message || "invalid email or password")
            }
                // save user session
            localStorage.setItem("user", JSON.stringify(data));
            navigate("/home");
        }
    }
    catch(err){
        alert("Server error. Try again")
    }
    finally{
      setLoading(false);
    }
    };
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <RideWiseBackground>
        <div className="relative z-10 flex items-center justify-center min-h-screen px-6">

          {/* Glass Card */}
          <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
                <Logo />
                <p className="text-white/60 text-center text-sm mt-2">
                    Smart predictions for smarter rides – Join the future of bike sharing
                </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-white/10 rounded-xl p-1 mb-6">
              <button
                onClick={ () => { setMode("login"); resetForm(); }}
                className={`w-1/2 py-2 rounded-lg text-sm font-medium transition
                  ${mode === "login"
                    ? "bg-black/40 text-white" 
                    : "text-white/60 hover:text-white"
                  }`}
              >
                Log In
              </button>

              <button
                onClick={() => { setMode("signup"); resetForm(); }}
                className={`w-1/2 py-2 rounded-lg text-sm font-medium transition
                  ${mode === "signup"
                    ? "bg-black/40 text-white"
                    : "text-white/60 hover:text-white"
                  }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4">
              {mode === "signup" && (
                <Input label="Username" name="name" placeholder="Your name" onChange={handleChange}/>
              )}

              <Input label="Email" name="email" placeholder="you@example.com" onChange={handleChange} />
              <Input label="Password" name="password" placeholder="••••••••" type="password" onChange={handleChange} />

              {mode === "signup" && (
                <Input label="Confirm Password" name="confirmPassword" placeholder="••••••••" type="password" onChange={handleChange}/>
              )}

              <button disabled={loading} className="hover:cursor-pointer
                mt-4 py-3 rounded-xl text-white font-semibold
                bg-gradient-to-r from-cyan-400 to-purple-500
                hover:opacity-90 transition"
                onClick={handleSubmit}>
                { loading ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
              </button>
            </div>

          </div>
        </div>
      </RideWiseBackground>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-white text-sm">{label}</label>
    <input
      {...props}
      className="
        bg-black/30
        border border-white/20
        rounded-lg px-4 py-2
        text-white
        placeholder-white/40
        focus:outline-none focus:border-cyan-400
      "
    />
  </div>
);
