import Navbar from "../components/Navbar";
import RideWiseBackground from "../background/NewBackground";
import SideNavbar from "../components/Sidebar";

const reviews = [
  {
    name: "Aarav Patil",
    time: "2 days ago",
    rating: 5,
    text:
      "RideWise made bike booking super easy. The AI prediction helped me choose the best time to ride without any waiting!"
  },
  {
    name: "Sneha Kulkarni",
    time: "5 days ago",
    rating: 4,
    text:
      "Loved the station map feature. It clearly shows bike availability and nearby stations. Very helpful for daily commute."
  },
  {
    name: "Rohan Deshmukh",
    time: "1 week ago",
    rating: 5,
    text:
      "The reservation system is smooth and fast. Booking a bike now takes less than a minute. Great UI!"
  },
  {
    name: "Pooja Sharma",
    time: "1 week ago",
    rating: 4,
    text:
      "AI insights are impressive. Day and hour prediction actually works well during peak hours."
  },
  {
    name: "Aditya Joshi",
    time: "2 weeks ago",
    rating: 5,
    text:
      "RideWise feels like a professional app. The chatbot answered my queries instantly."
  },
  {
    name: "Neha Verma",
    time: "2 weeks ago",
    rating: 5,
    text:
      "Clean design, smooth performance, and smart features. Highly recommended for smart city bike rentals."
  }
];

export default function Review() {
  return (
    <RideWiseBackground>
      <Navbar />
      <SideNavbar />

      <main className="ml-[260px] pt-28 px-10 min-h-screen text-white">
        {/* PAGE TITLE */}
        <h1 className="text-3xl font-bold mb-2">User Reviews</h1>
        <p className="text-white/60 mb-10">
          What users say about RideWise 🚲
        </p>

        {/* REVIEW GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <ReviewCard key={index} review={review} />
          ))}
        </div>
      </main>
    </RideWiseBackground>
  );
}

/* ================= Review Card ================= */

function ReviewCard({ review }) {
  return (
    <div className="
      rounded-2xl p-6
      bg-white/5 backdrop-blur-xl
      border border-white/10
      shadow-lg
      hover:shadow-purple-500/20
      transition
    ">
      {/* STARS */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: review.rating }).map((_, i) => (
          <span key={i} className="text-yellow-400 text-lg">★</span>
        ))}
        {Array.from({ length: 5 - review.rating }).map((_, i) => (
          <span key={i} className="text-white/20 text-lg">★</span>
        ))}
      </div>

      {/* REVIEW TEXT */}
      <p className="text-white/80 mb-6 leading-relaxed">
        “{review.text}”
      </p>

      {/* USER INFO */}
      <div className="flex items-center gap-3">
        <div className="
          w-10 h-10 rounded-full
          bg-gradient-to-r from-cyan-400 to-purple-500
          flex items-center justify-center
          font-bold text-black
        ">
          {review.name.charAt(0)}
        </div>

        <div>
          <p className="font-medium">{review.name}</p>
          <p className="text-xs text-white/50">{review.time}</p>
        </div>
      </div>
    </div>
  );
}
