const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  deleteAccount,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// POST /api/auth/reset-password/:token
router.post("/reset-password/:token", resetPassword);

// DELETE /api/auth/delete -> only the logged-in user can delete their own account
router.delete("/delete", protect, deleteAccount);

module.exports = router;
