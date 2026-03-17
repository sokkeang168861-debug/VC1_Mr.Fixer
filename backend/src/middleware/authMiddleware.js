const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/constants");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

<<<<<<< HEAD
  const [scheme, value] = authHeader.trim().split(/\s+/);
  const token = value || scheme; // supports both "Bearer <token>" and raw "<token>"
  if (!token) return res.status(401).json({ message: "Invalid authorization header" });
=======
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const [scheme, value] = authHeader.trim().split(/\s+/);
  const token = value || scheme; // supports "Bearer <token>" or raw "<token>"

  if (!token) {
    return res.status(401).json({ message: "Invalid authorization header" });
  }
>>>>>>> 22c83295919d87676d80270642609641e2cb27f1

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // now you can access req.user in controllers
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = protect;
