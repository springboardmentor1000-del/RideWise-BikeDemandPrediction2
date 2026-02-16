import mongoose from "mongoose";

const stationSchema = new mongoose.Schema({
  name: String,
  city: String,
  latitude: Number,
  longitude: Number,
  totalBikes: Number,
  availableBikes: Number,
  demandLevel: String
});

export default mongoose.model("Station", stationSchema);
