import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../../services/chatService";
import "../../styles/dashboard.css";

/* ================= SPEECH API ================= */
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export default function RideWiseAI() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi, I’m RideWise AI. You can type or speak to me about bike demand, predictions, or insights.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SPEECH RECOGNITION ================= */
  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  /* ================= TEXT TO SPEECH ================= */
  const speak = (text) => {
    if (!window.speechSynthesis) return;

    // 🔴 STOP any previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  /* ================= STOP SPEAKING ================= */
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendChatMessage(userMsg.text);

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: reply },
      ]);

      speak(reply);
    } catch {
      const errorMsg = "Sorry, something went wrong.";
      setMessages((prev) => [...prev, { role: "bot", text: errorMsg }]);
      speak(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ================= VOICE INPUT ================= */
  const startListening = () => {
    if (!recognitionRef.current || listening) return;
    recognitionRef.current.start();
  };

  return (
    <div className="page ai-page">
      <h2 className="page-title">RideWise AI Assistant</h2>

      {/* ================= CHAT ================= */}
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === "user" ? "chat-user" : "chat-bot"}
          >
            {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ================= INPUT BAR ================= */}
      <div className="chat-input-bar">
        <input
          type="text"
          placeholder="Type or speak your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />

        {/* 🎤 MIC */}
        <button
          className={`mic-btn ${listening ? "listening" : ""}`}
          onClick={startListening}
          title="Speak"
        >
          🎤
        </button>

        {/* 🛑 STOP SPEAKING */}
        {speaking && (
          <button className="stop-btn" onClick={stopSpeaking}>
            ⛔ Stop
          </button>
        )}

        <button onClick={sendMessage} disabled={loading}>
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
}
