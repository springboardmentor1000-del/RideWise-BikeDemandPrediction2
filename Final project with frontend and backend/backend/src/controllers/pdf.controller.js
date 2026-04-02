import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ FIX FONT WARNING
pdfjsLib.GlobalWorkerOptions.standardFontDataUrl =
  path.join(
    __dirname,
    "../../node_modules/pdfjs-dist/legacy/build/standard_fonts/"
  );

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzePDF = async (req, res) => {
  try {
    const data = new Uint8Array(fs.readFileSync(req.file.path));

    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(" ");
      fullText += pageText + "\n";
    }

    const pdfText = fullText.slice(0, 8000);

    const prompt = `
    You are an AI system analyzing a bike rental related document.

    Extract or infer:
    1. Rental demand (low / medium / high)
    2. Weather condition
    3. Temperature
    4. Bike availability trend

    If information is missing, say "Not available in document".

    Return ONLY valid JSON.The valid json Follows below syntax
    {
      "rentals": "here rental value",
      "weather":"weather info",
      "temperature":"temperature info",
      "availability":"info"
    }
    the key of json contain as it is.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt + "\nDocument:\n" + pdfText);
    const rawText = result.response.text();

    // ✅ CLEAN GEMINI OUTPUT
    const cleanJSON = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const insights = JSON.parse(cleanJSON);

    fs.unlinkSync(req.file.path); // cleanup
    console.log(insights)
    res.json(insights);
    
  } catch (error) {
    console.error("PDF analysis error:", error);
    res.status(500).json({ error: "PDF analysis failed" });
  }
};
