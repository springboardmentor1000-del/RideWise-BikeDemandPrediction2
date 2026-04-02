import express from "express";
import multer from "multer";
import { analyzePDF } from "../controllers/pdf.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/analyze-pdf", upload.single("pdf"), analyzePDF);

export default router;
