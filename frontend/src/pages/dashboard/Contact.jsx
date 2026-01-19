import { useState } from "react";
import "../../styles/dashboard.css";

export default function Contact() {
  const [showPopup, setShowPopup] = useState(false);

  // ✅ FORM STATE
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!name || !email || !message) {
      alert("Please fill required fields");
      return;
    }

    // show popup
    setShowPopup(true);

    // ✅ CLEAR INPUTS
    setName("");
    setEmail("");
    setCompany("");
    setMessage("");

    // auto hide popup
    setTimeout(() => {
      setShowPopup(false);
    }, 2500);
  };

  return (
    <div className="page contact-page">
      <h1 className="contact-title">Get In Touch</h1>
      <p className="contact-subtitle">
        Have questions about RideWise? We'd love to hear from you.
        Send us a message and we’ll respond within 24 hours.
      </p>

      <div className="contact-layout">
        {/* LEFT */}
        <div className="contact-card">
          <h3>Send Us a Message</h3>

          <input
            type="text"
            placeholder="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />

          <textarea
            rows="4"
            placeholder="Tell us about your needs..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button className="btn-primary" onClick={handleSend}>
            Send Message
          </button>
        </div>

        {/* RIGHT */}
        <div className="contact-info-card">
          <h3>Contact Information</h3>

          <div className="info-row">
            <span>📧</span>
            <div>
              <strong>Email</strong>
              <p>ridewise@gmail.com</p>
            </div>
          </div>

          <div className="info-row">
            <span>📞</span>
            <div>
              <strong>Phone</strong>
              <p>+91 9876543210</p>
            </div>
          </div>

          <div className="info-row">
            <span>📍</span>
            <div>
              <strong>Office</strong>
              <p>India</p>
            </div>
          </div>

          <div className="contact-owner">
            <strong>Managed By</strong>
            <p>Vikram Saketh Garre</p>
          </div>
        </div>
      </div>

      {/* ✅ POPUP */}
      {showPopup && (
        <div className="popup-toast">
          ✅ Message sent successfully!
        </div>
      )}
    </div>
  );
}
