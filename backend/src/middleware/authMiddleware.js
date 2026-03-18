const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/constants");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ 
      message: "No authorization token provided",
      code: "NO_TOKEN"
    });
  }

  const [scheme, value] = authHeader.trim().split(/\s+/);
  const token = value || scheme; // supports "Bearer <token>" or raw "<token>"

  if (!token) {
    return res.status(401).json({ 
      message: "Invalid authorization header format",
      code: "INVALID_HEADER"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // now you can access req.user in controllers
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    
    // Distinguish between expired and invalid tokens
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Session expired. Please log in again.",
        code: "TOKEN_EXPIRED",
        expiredAt: err.expiredAt
      });
    }
    
    return res.status(401).json({ 
      message: "Invalid or malformed token",
      code: "INVALID_TOKEN"
    });
  }
};

module.exports = protect;
