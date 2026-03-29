// Centralized constants to avoid circular dependencies
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

module.exports = {
  JWT_SECRET,
};
