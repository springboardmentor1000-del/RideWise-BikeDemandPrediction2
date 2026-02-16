import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stationName: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    bikeId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);
