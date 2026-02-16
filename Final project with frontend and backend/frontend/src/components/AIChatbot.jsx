import { useState } from "react";
import { MessageCircle } from "lucide-react";

export default function GlobalAIChatbot({ context }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input,
        context,
      }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: data.reply },
    ]);
  };

  return (
    <>
      {/* 💬 ICON */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed left-4 bottom-6 z-50 p-4 rounded-full bg-cyan-500 shadow-xl hover:scale-105 transition"
      >
        <MessageCircle className="text-black" />
      </button>

      {/* 🤖 CHAT PANEL */}
      {open && (
        <div className="fixed left-4 bottom-24 z-50 w-96 h-[480px] bg-black/70 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col">
          <div className="p-4 border-b border-white/10 font-semibold text-white bg-gradient-to-r from-purple-600/40 to-indigo-600/40">
            🤖 RideWise AI
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl max-w-[80%] ${
                  m.role === "user"
                    ? "ml-auto p-3 rounded-2xl max-w-[80%] bg-gradient-to-br from-cyan-400/30 to-blue-500/30 text-white border border-cyan-300/20 shadow-md"
                    : "p-3 rounded-2xl max-w-[80%] bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 text-white border border-purple-300/20 shadow-md"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

            <div className="p-4 border-t border-white/10 flex gap-3 bg-black/30">
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask RideWise AI..."
                className="
                flex-1
                h-12
                px-4
                rounded-xl
                bg-gradient-to-r from-[#0f172a] to-[#1e293b]
                text-white
                placeholder:text-gray-400
                outline-none
                border border-white/10
                focus:border-cyan-400
                "
            />

            <button
                onClick={sendMessage}
                className="
                h-12
                px-6
                rounded-xl
                bg-gradient-to-br from-cyan-400 to-purple-500
                text-black
                font-semibold
                shadow-lg
                hover:scale-105
                transition
                "
            >
                Send
            </button>
            </div>
        </div>
      )}
    </>
  );
}
