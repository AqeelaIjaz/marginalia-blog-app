const Blog = require("../models/Blog");

// @route   POST /api/blogs
// @desc    Create a new blog post (must be logged in)
const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const blog = await Blog.create({
      title,
      content,
      author: req.userId, // comes from the authMiddleware after verifying the token
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   GET /api/blogs
// @desc    Get all blog posts (for the Home / Dashboard page)
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name email") // replaces author id with actual name/email
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createBlog, getBlogs };
