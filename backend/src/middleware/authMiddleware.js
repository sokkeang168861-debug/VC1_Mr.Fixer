const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/constants");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const [scheme, value] = authHeader.trim().split(/\s+/);
  const token = value || scheme; // supports "Bearer <token>" or raw "<token>"

  if (!token) {
    return res.status(401).json({ message: "Invalid authorization header" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // now you can access req.user in controllers
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = protect;
