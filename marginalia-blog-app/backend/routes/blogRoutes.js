const express = require("express");
const router = express.Router();
const { createBlog, getBlogs } = require("../controllers/blogController");
const protect = require("../middleware/authMiddleware");

// GET /api/blogs -> anyone can view blogs
router.get("/", getBlogs);

// POST /api/blogs -> only logged-in users can create a blog (protect middleware runs first)
router.post("/", protect, createBlog);

module.exports = router;
