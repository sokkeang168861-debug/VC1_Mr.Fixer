const app = require("./app");
const db = require("./config/db");

const PORT = process.env.PORT || 5000;

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }

  console.log("Connected to MySQL!");
  connection.release();

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});
