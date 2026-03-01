const express = require("express");
const mysql = require('mysql2');
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: ['http://localhost:5173'],
}

app.use(cors(corsOptions));

// Create connection
const db = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '',
  database: 'mr_fixer_db'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL!');
});

app.get("/api", (req, res)=> {
    res.json({ fruits: ['apple', 'orange']});
});

app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

app.listen(5000, () => {
    console.log("Server start on port 5000");
});