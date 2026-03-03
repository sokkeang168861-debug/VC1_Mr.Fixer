const app = require("./app");
const db = require("./config/db");

const PORT = process.env.PORT || 5000;

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }

  console.log("Connected to MySQL!");
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});

