import express from "express";
import Station from "../models/Station.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const stations = await Station.find();
  res.json(stations);
});

export default router;
