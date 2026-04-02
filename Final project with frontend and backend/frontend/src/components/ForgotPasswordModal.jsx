import { useState } from "react";

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanRePassword = rePassword.trim();

    if (!cleanEmail || !cleanPassword || !cleanRePassword) {
      return alert("All fields are required");
    }

    if (cleanPassword !== cleanRePassword) {
      return alert("Passwords do not match");
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email:cleanEmail,password: cleanPassword }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      alert("Password updated successfully");
      onClose();
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[400px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-whit shadow-2xl">
        <h2 className="text-3xl text-white text-shadow-2xs font-bold mb-4 text-center">
          Reset Password
        </h2>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Registered Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
             className="
              w-full px-4 py-3 rounded-xl
              bg-black/30 backdrop-blur-md
              border border-white/20
              text-white placeholder-white/50
              focus:outline-none focus:ring-2 focus:ring-cyan-400/60
              focus:border-cyan-400
              transition
            "
          />

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
             className="
              w-full px-4 py-3 rounded-xl
              bg-black/30 backdrop-blur-md
              border border-white/20
              text-white placeholder-white/50
              focus:outline-none focus:ring-2 focus:ring-cyan-400/60
              focus:border-cyan-400
              transition
            "
          />

          <input
            type="password"
            placeholder="Re-enter Password"
            value={rePassword}
            onChange={(e) => setRePassword(e.target.value)}
             className="
              w-full px-4 py-3 rounded-xl
              bg-black/30 backdrop-blur-md
              border border-white/20
              text-white placeholder-white/50
              focus:outline-none focus:ring-2 focus:ring-cyan-400/60
              focus:border-cyan-400
              transition
            "
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 py-3 rounded-xl font-semibold
              bg-gradient-to-r from-cyan-400 to-purple-500
              text-black
              hover:opacity-90
              transition
              disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          <button
            onClick={onClose}
            className="text-sm text-white/60 hover:text-white transition text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
