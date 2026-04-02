import Contact from "../models/Contact.js";

export const createContact = async (req, res) => {
  try {
    const { name, email, company, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const contact = await Contact.create({
      name,
      email,
      company,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message saved successfully",
      contact,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
