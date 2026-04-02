import express from "express";
import { createContact } from "../controllers/contact.controller.js";

const router = express.Router();

// POST: Save contact message
router.post("/", createContact);

export default router;
