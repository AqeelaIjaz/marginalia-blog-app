const express = require("express");
const router = express.Router();
const {
  createBlog,
  getBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,
} = require("../controllers/blogController");
const protect = require("../middleware/authMiddleware");

// GET /api/blogs -> anyone can view blogs (supports ?search= and ?category=)
router.get("/", getBlogs);

// GET /api/blogs/mine -> only the logged-in user's own posts
// IMPORTANT: this must be defined BEFORE /:id, otherwise Express would treat "mine" as an :id value
router.get("/mine", protect, getMyBlogs);

// GET /api/blogs/:id -> anyone can view a single blog's full details
router.get("/:id", getSingleBlog);

// POST /api/blogs -> only logged-in users can create a blog
router.post("/", protect, createBlog);

// PUT /api/blogs/:id -> only the author can update their own blog
router.put("/:id", protect, updateBlog);

// DELETE /api/blogs/:id -> only the author can delete their own blog
router.delete("/:id", protect, deleteBlog);

module.exports = router;
