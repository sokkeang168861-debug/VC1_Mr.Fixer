const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../controllers/authController");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1]; // Bearer <token>
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // now controller can use req.user
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = protect;