import express from "express";
import { getUserLocation } from "../controllers/location.controller.js";

const router = express.Router();
router.get("/location", getUserLocation);

export default router;
