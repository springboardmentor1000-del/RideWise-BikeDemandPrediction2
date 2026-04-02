import Reservation from "../models/Reservation.js";
import mongoose from "mongoose";

/* ================= CREATE RESERVATION ================= */
export const createReservation = async (req, res) => {
  try {
    console.log("CREATE payload:", req.body);
    const reservation = await Reservation.create(req.body);
    res.status(201).json(reservation);
  } catch (error) {
    console.error("CREATE error:", error);
    res.status(500).json({ message: "Reservation failed" });
  }
};

/* ================= GET USER RESERVATIONS ================= */

export const getMyReservations = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("Fetching reservations for userId:", userId);

    // 🛑 Validate ObjectId FIRST
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format",
      });
    }

    // ✅ Correct MongoDB query
    const reservations = await Reservation.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });

    return res.status(200).json(reservations);
  } catch (error) {
    console.error("Failed to fetch reservations:", error);
    return res.status(500).json({
      message: "Failed to fetch reservations",
    });
  }
};

/* ================= CANCEL RESERVATION ================= */
export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    reservation.status = "Cancelled";
    await reservation.save();

    res.json({ message: "Reservation cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Cancellation failed" });
  }
};
