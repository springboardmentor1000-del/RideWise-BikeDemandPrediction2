import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/dashboard.css";

export default function Review() {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [reviews, setReviews] = useState([]);

  const submitReview = () => {
    if (!rating || !message.trim()) {
      alert("Please give rating and write a review");
      return;
    }

    const newReview = {
      id: Date.now(),
      email: user.email,
      rating,
      message,
      date: new Date().toLocaleString(),
    };

    setReviews([newReview, ...reviews]);
    setRating(0);
    setMessage("");
  };

  return (
    <div className="page">
      <h2 className="page-title">User Reviews</h2>

      {/* ================= ADD REVIEW ================= */}
      <div className="review-card">
        <h3>Write a Review</h3>

        <div className="stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={n <= rating ? "star active" : "star"}
              onClick={() => setRating(n)}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          placeholder="Share your experience with RideWise..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button className="btn-primary" onClick={submitReview}>
          Submit Review
        </button>
      </div>

      {/* ================= REVIEW LIST ================= */}
      {reviews.length > 0 && (
        <div className="review-list">
          <h3>All Reviews</h3>

          {reviews.map((r) => (
            <div className="review-item" key={r.id}>
              <div className="review-header">
                <span className="review-email">{r.email}</span>
                <span className="review-stars">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>
              </div>

              <p className="review-text">{r.message}</p>
              <span className="review-date">{r.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
