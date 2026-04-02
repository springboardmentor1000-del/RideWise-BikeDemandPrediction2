import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import stationRoutes from "./routes/station.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import chatRoutes from "./routes/chatRoutes.js";
import contactRoutes from "./routes/contact.routes.js";
import userRoutes from "./routes/auth.routes.js";
import predictionRoutes from "./routes/prediction.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";
import locationRoutes from "./routes/location.routes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors({
    origin: "http://localhost:5173", // Vite frontend
    credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("RideWise Backend Running");
});
app.use("/api/stations", stationRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/predict", predictionRoutes);
app.use("/api/user", userRoutes)
app.use("/api/contact", contactRoutes);
app.use("/api", chatRoutes);
app.use("/api", pdfRoutes);
app.use("/api", locationRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
