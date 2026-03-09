const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../controllers/authController");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const [scheme, value] = authHeader.trim().split(/\s+/);
  const token = value || scheme; // supports both "Bearer <token>" and raw "<token>"
  if (!token) return res.status(401).json({ message: "Invalid authorization header" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // now controller can use req.user
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = protect;
