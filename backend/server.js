// This is the main file. Run this with: node server.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();

// 1. Connect to MongoDB
connectDB();

// 2. Middleware
app.use(cors()); // allows your frontend (different port) to talk to this backend
app.use(express.json()); // allows the server to read JSON sent from the frontend

// 3. Routes
app.use("/api/auth", authRoutes);   // -> /api/auth/register, /api/auth/login
app.use("/api/blogs", blogRoutes);  // -> /api/blogs (GET & POST)

// 4. Simple test route
app.get("/", (req, res) => {
  res.send("Blog App backend is running ✅");
});

// 5. Start the server (only when run directly, e.g. locally with "npm run dev")
// Vercel imports this file as a serverless function instead of running it directly,
// so app.listen() is skipped in that environment.
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
