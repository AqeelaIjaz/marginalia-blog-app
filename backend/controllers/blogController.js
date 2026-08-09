const Blog = require("../models/Blog");

// @route   POST /api/blogs
// @desc    Create a new blog post (must be logged in)
const createBlog = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const blog = await Blog.create({
      title,
      content,
      category: category || "General",
      author: req.userId, // comes from the authMiddleware after verifying the token
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   GET /api/blogs
// @desc    Get all blog posts, with optional ?search= and ?category= filters
const getBlogs = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    // Search by title or content (case-insensitive)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category, unless "All" was selected
    if (category && category !== "All") {
      filter.category = category;
    }

    const blogs = await Blog.find(filter)
      .populate("author", "name email") // replaces author id with actual name/email
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   GET /api/blogs/:id
// @desc    Get a single blog post by its ID (for the blog detail page)
const getSingleBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "name email");

    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    // Invalid ID format (not a valid MongoDB ObjectId) also lands here
    res.status(404).json({ message: "Blog post not found" });
  }
};

// @route   PUT /api/blogs/:id
// @desc    Update a blog post (only the original author can do this)
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    // Ownership check — compare the logged-in user's id to the post's author
    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    const { title, content, category } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    blog.title = title;
    blog.content = content;
    blog.category = category || blog.category;
    await blog.save();

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog post (only the original author can do this)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await blog.deleteOne();
    res.status(200).json({ message: "Blog post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createBlog, getBlogs, getSingleBlog, updateBlog, deleteBlog };
