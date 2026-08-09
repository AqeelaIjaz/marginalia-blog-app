// This middleware checks: "Does this request have a valid login token?"
// We use it to protect routes like "Create Blog" so only logged-in users can post

const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  // Token is expected in the header like: Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify the token is valid and not expired
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user id to the request so controllers can use it
      req.userId = decoded.id;

      next(); // token is valid, continue to the actual route
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

module.exports = protect;
