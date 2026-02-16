import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const router = express.Router();
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const { userId } = req.query; // temporary (JWT later)

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});
router.put("/update", async (req, res) => {
  try {
    const { userId, name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Profile update failed" });
  }
});
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("REQ HEADERS:", req.headers["content-type"]);
  console.log("REQ BODY:", req.body);
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
  });
});

export default router;
