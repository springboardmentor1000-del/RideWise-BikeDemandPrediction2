import express from "express";
import {
  createReservation,
  getMyReservations,
  cancelReservation,
} from "../controllers/reservation.controller.js";
import Reservation from "../models/Reservation.js";

const router = express.Router();

router.post("/create", createReservation);
// router.get("/my", getMyReservations);
router.delete("/:id", cancelReservation);
router.get("/my/:userId",  getMyReservations);
export default router;
