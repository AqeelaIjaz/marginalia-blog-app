const express = require("express");
const router = express.Router();
const { createBlog, getBlogs, getSingleBlog } = require("../controllers/blogController");
const protect = require("../middleware/authMiddleware");

// GET /api/blogs -> anyone can view blogs
router.get("/", getBlogs);

// GET /api/blogs/:id -> anyone can view a single blog's full details
router.get("/:id", getSingleBlog);

// POST /api/blogs -> only logged-in users can create a blog (protect middleware runs first)
router.post("/", protect, createBlog);

module.exports = router;
