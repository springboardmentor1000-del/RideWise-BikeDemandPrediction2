import { useState } from "react";
import "../../styles/dashboard.css";

/* ------------------ CITY DATA ------------------ */

const cities = {
  Mumbai: ["Andheri", "Malabar Hills", "Bandra", "Dadar", "Borivali"],
  Bengaluru: ["Indiranagar", "Whitefield", "Yelahanka", "BTM", "MG Road"],
  Hyderabad: ["Hitech City", "Gachibowli", "Kukatpally", "Secunderabad"],
  Delhi: ["Connaught Place", "Dwarka", "Saket", "Rohini"]
};

/* ------------------ DEMAND BY TIME ------------------ */

const demandSlots = [
  { label: "12 AM – 6 AM", level: "Low", value: 25, range: [0, 6] },
  { label: "7 AM – 11 AM", level: "High", value: 90, range: [7, 11] },
  { label: "12 PM – 5 PM", level: "Medium", value: 60, range: [12, 17] },
  { label: "6 PM – 10 PM", level: "High", value: 85, range: [18, 22] },
  { label: "10 PM – 12 AM", level: "Low", value: 30, range: [22, 24] }
];

/* ------------------ WEEKLY EDA ------------------ */

const weeklyDemand = [
  { day: "Mon", value: 65 },
  { day: "Tue", value: 70 },
  { day: "Wed", value: 75 },
  { day: "Thu", value: 80 },
  { day: "Fri", value: 90 },
  { day: "Sat", value: 95 },
  { day: "Sun", value: 85 }
];

export default function Reservations() {
  /* ------------------ FORM STATE ------------------ */
  const [city, setCity] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [hour, setHour] = useState("07");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  const [durHrs, setDurHrs] = useState("1");
  const [durMins, setDurMins] = useState("0");

  const [bookings, setBookings] = useState([]);

  /* ------------------ TIME HELPERS ------------------ */

  const get24Hour = () => {
    let h = parseInt(hour);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h;
  };

  const activeSlot = demandSlots.find(
    slot => get24Hour() >= slot.range[0] && get24Hour() < slot.range[1]
  );

  /* ------------------ COST LOGIC (FIXED) ------------------ */

  const totalHours =
    parseInt(durHrs || 0) + parseInt(durMins || 0) / 60;

  let ratePerHour = 75;

  if (totalHours >= 12) {
    ratePerHour = 50;
  } else if (totalHours > 6) {
    ratePerHour = 60;
  } else {
    ratePerHour = 75;
  }

  const totalCost = Math.round(totalHours * ratePerHour);

  /* ------------------ RESERVE ------------------ */

  const handleReserve = () => {
    if (!city || !from || !to) {
      alert("Please fill all booking details");
      return;
    }

    if (from === to) {
      alert("From and To stations cannot be the same");
      return;
    }

    const bookingTime = `${hour}:${minute} ${period}`;
    const duration = `${durHrs}h ${durMins}m`;

    const newBooking = {
      id: Date.now(),
      city,
      from,
      to,
      time: bookingTime,
      duration,
      cost: totalCost
    };

    setBookings(prev => [...prev, newBooking]);
    setFrom("");
    setTo("");
  };

  const cancelBooking = (id) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="reserve-page">
      <h2 className="page-title">Reserve a Bike</h2>

      <div className="reserve-layout">
        {/* LEFT */}
        <div className="reserve-card">
          <h3>Booking Details</h3>

          <select value={city} onChange={e => {
            setCity(e.target.value);
            setFrom("");
            setTo("");
          }}>
            <option value="">Select City</option>
            {Object.keys(cities).map(c => <option key={c}>{c}</option>)}
          </select>

          <select value={from} onChange={e => setFrom(e.target.value)} disabled={!city}>
            <option value="">From Station</option>
            {city && cities[city].map(s => <option key={s}>{s}</option>)}
          </select>

          <select value={to} onChange={e => setTo(e.target.value)} disabled={!city}>
            <option value="">To Station</option>
            {city && cities[city].map(s => <option key={s}>{s}</option>)}
          </select>

          {/* TIME */}
          <div className="time-row">
            <select value={hour} onChange={e => setHour(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => {
                const v = String(i + 1).padStart(2, "0");
                return <option key={v}>{v}</option>;
              })}
            </select>

            <span>:</span>

            <select value={minute} onChange={e => setMinute(e.target.value)}>
              {["00", "15", "30", "45"].map(m => <option key={m}>{m}</option>)}
            </select>

            <select value={period} onChange={e => setPeriod(e.target.value)}>
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>

          {/* DURATION */}
          <div className="time-row">
            <input type="number" min="1" value={durHrs}
              onChange={e => setDurHrs(e.target.value)} />
            <span>hrs</span>

            <input type="number" min="0" max="59" value={durMins}
              onChange={e => setDurMins(e.target.value)} />
            <span>mins</span>
          </div>

          {/* COST */}
          <div className="cost-box">
            <p>Rate: ₹{ratePerHour}/hour</p>
            <h4>Total Cost: ₹{totalCost}</h4>
          </div>

          <button className="btn-primary" onClick={handleReserve}>
            Confirm Reservation
          </button>
        </div>

        {/* RIGHT */}
        <div className="demand-card">
          <h3>Demand by Time</h3>

          {demandSlots.map(slot => (
            <div
              key={slot.label}
              className={`demand-row ${activeSlot?.label === slot.label ? "active" : ""}`}
            >
              <span>{slot.label}</span>
              <div className="demand-bar">
                <div
                  className={`demand-fill ${slot.level.toLowerCase()}`}
                  style={{ width: `${slot.value}%` }}
                />
              </div>
              <span className={`demand-badge ${slot.level.toLowerCase()}`}>
                {slot.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* BOOKINGS */}
      {bookings.length > 0 && (
        <div className="booking-list">
          <h3>Your Reservations</h3>
          {bookings.map(b => (
            <div className="booking-card" key={b.id}>
              <p><b>City:</b> {b.city}</p>
              <p><b>Route:</b> {b.from} → {b.to}</p>
              <p><b>Start:</b> {b.time}</p>
              <p><b>Duration:</b> {b.duration}</p>
              <p><b>Cost:</b> ₹{b.cost}</p>

              <button className="btn-danger" onClick={() => cancelBooking(b.id)}>
                Cancel Booking
              </button>
            </div>
          ))}
        </div>
      )}

      {/* EDA */}
      <div className="eda-section">
        <h3>Reservation Demand by Week</h3>
        {weeklyDemand.map(d => (
          <div key={d.day} className="week-bar">
            <span>{d.day}</span>
            <div className="bar-bg">
              <div className="bar-fill" style={{ width: `${d.value}%` }} />
            </div>
            <span>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}