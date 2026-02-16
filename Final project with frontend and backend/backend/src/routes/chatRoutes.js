import express from "express";
import { chatWithGemini } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/chat", chatWithGemini);

export default router;
