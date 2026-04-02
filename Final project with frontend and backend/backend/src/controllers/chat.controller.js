import { GoogleGenerativeAI } from "@google/generative-ai";
import { configDotenv } from "dotenv";
configDotenv();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// console.log(genAI)
export const chatWithGemini = async (req, res) => {
  try {
    const { message, context } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    const prompt = `
        You are RideWise AI, a bike rental demand assistant.
        Explain insights in simple language.
        Avoid ML jargon.

        Prediction Context:
        ${JSON.stringify(context, null, 2)}

        User Question:
        ${message}
        `;
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    console.log(response)
    res.json({ reply: response });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Gemini chat failed" });
  }
};
