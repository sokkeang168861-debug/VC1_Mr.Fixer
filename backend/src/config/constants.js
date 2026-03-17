// Centralized constants to avoid circular dependencies
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_not_safe";

module.exports = {
  JWT_SECRET,
};
