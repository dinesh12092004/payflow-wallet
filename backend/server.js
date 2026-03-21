const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "yourpassword",
  database: "payflow"
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed");
  } else {
    console.log("MySQL Connected...");
  }
});


// 🧾 Register API
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, password], (err, result) => {
    if (err) return res.send(err);
    res.send("User Registered Successfully");
  });
});


// 🔐 Login API
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email=? AND password=?";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.send(err);

    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.send("Invalid Credentials");
    }
  });
});


// 💸 Transfer Money API
app.post("/transfer", (req, res) => {
  const { sender_id, receiver_email, amount } = req.body;

  // Step 1: Check receiver
  db.query("SELECT * FROM users WHERE email=?", [receiver_email], (err, receiver) => {
    if (receiver.length === 0) {
      return res.send("Receiver not found");
    }

    const receiver_id = receiver[0].id;

    // Step 2: Check sender balance
    db.query("SELECT balance FROM users WHERE id=?", [sender_id], (err, sender) => {
      if (sender[0].balance < amount) {
        return res.send("Insufficient balance");
      }

      // Step 3: Update balances
      db.query("UPDATE users SET balance = balance - ? WHERE id=?", [amount, sender_id]);
      db.query("UPDATE users SET balance = balance + ? WHERE id=?", [amount, receiver_id]);

      // Step 4: Insert transaction
      db.query(
        "INSERT INTO transactions (sender_id, receiver_id, amount) VALUES (?, ?, ?)",
        [sender_id, receiver_id, amount]
      );

      res.send("Transaction Successful");
    });
  });
});


// 📜 Transaction History API
app.get("/transactions/:id", (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT * FROM transactions 
    WHERE sender_id=? OR receiver_id=? 
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId, userId], (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});


// 🚀 Server start
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
