import { useEffect, useRef, useState } from "react";
import { FiMic, FiSend } from "react-icons/fi";
import RideWiseBackground from "../background/NewBackground";
import Navbar from "../components/Navbar";
import SideNavbar from "../components/Sidebar";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi 👋 I’m RideWise AI. You can type or speak to me about bikes, stations, or reservations."
    }
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);

  const chatEndRef = useRef(null);

  /* ---------- AUTO SCROLL ---------- */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------- VOICE INPUT (FIXED) ---------- */
  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      // 🔥 THIS IS THE IMPORTANT FIX
      setInput(transcript);
    };

    recognition.onend = () => setListening(false);

    recognition.start();
  };

  /* ---------- SEND MESSAGE ---------- */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;

    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setInput("");

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { from: "bot", text: data.reply }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ AI service unavailable" }
      ]);
    }
  };

  return (
    <RideWiseBackground>
      <Navbar />
      <SideNavbar />

      <main className="ml-[260px] pt-24 px-10 min-h-screen text-white flex justify-center">
        <div
            className="
            w-full max-w-4xl
            h-[85vh]
            rounded-3xl
            bg-white/5 backdrop-blur-xl
            border border-white/10
            shadow-2xl
            flex flex-col
            "
        >
            {/* ================= CHAT HEADER ================= */}
            <div className="
            flex items-center gap-3
            px-6 py-4
            border-b border-white/10
            ">
            <div className="
                w-10 h-10 rounded-full
                bg-gradient-to-r from-cyan-400 to-purple-500
                flex items-center justify-center
                text-black font-bold
            ">
                AI
            </div>

            <div>
                <p className="font-semibold">RideWise AI</p>
                <p className="text-xs text-green-400">● Online</p>
            </div>
            </div>

            {/* ================= CHAT BODY ================= */}
            <div className="
            flex-1 overflow-y-auto
            px-6 py-5 space-y-4
            ">
            {messages.map((msg, index) => (
                <div
                key={index}
                className={`flex ${
                    msg.from === "user" ? "justify-end" : "justify-start"
                }`}
                >
                <div
                    className={`
                    max-w-[70%]
                    px-4 py-3
                    rounded-2xl text-sm leading-relaxed
                    shadow-md
                    ${
                        msg.from === "user"
                        ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-black rounded-br-md"
                        : "bg-white/10 text-white rounded-bl-md"
                    }
                    `}
                >
                    {msg.text}
                </div>
                </div>
            ))}
            <div ref={chatEndRef} />
            </div>

            {/* ================= INPUT BAR ================= */}
            <div className="
            px-4 py-4
            border-t border-white/10
            flex items-center gap-3
            bg-black/20
            ">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or speak to RideWise AI..."
                className="
                flex-1 px-4 py-3 rounded-xl
                bg-white/5 outline-none
                text-white placeholder-white/40
                border border-white/10
                focus:border-cyan-400
                "
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            {/* MIC */}
            <button
                onClick={startVoiceInput}
                className={`
                w-11 h-11 rounded-full
                flex items-center justify-center
                transition
                ${
                    listening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-white/5 text-white hover:bg-white/10"
                }
                `}
            >
                🎤
            </button>

            {/* SEND */}
            <button
                onClick={sendMessage}
                className="
                w-11 h-11 rounded-full
                bg-gradient-to-r from-cyan-400 to-purple-500
                text-black
                hover:opacity-90
                "
            >
                ➤
            </button>
            </div>
        </div>
        </main>

    </RideWiseBackground>
  );
}
