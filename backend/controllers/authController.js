const User = require("../models/User");
const db = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Function to generate next user ID in format u001, u002, etc.
const generateNextUserId = async () => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT user_id FROM users WHERE user_id LIKE 'u%' ORDER BY CAST(SUBSTRING(user_id, 2) AS UNSIGNED) DESC LIMIT 1",
      [],
      (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        let nextNumber = 1;
        if (results.length > 0) {
          const lastUserId = results[0].user_id;
          const lastNumber = parseInt(lastUserId.substring(1));
          nextNumber = lastNumber + 1;
        }

        // Format as u001, u002, etc.
        const newUserId = `u${nextNumber.toString().padStart(3, "0")}`;
        resolve(newUserId);
      }
    );
  });
};

const login = (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({ error: "Email is required" });
  }
  if (!req.body.password) {
    return res.status(400).json({ error: "Password is required" });
  }
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res.status(401).json({ error: "Invalid email" });

      const user = results[0]; // Get the first user from results array
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: "Invalid password" });

      // Create JWT token
      const token = jwt.sign(
        { user_id: user.user_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ token });
    }
  );
};

const signup = (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Check if user already exists
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0) {
        return res.status(409).json({ error: "User already exists" });
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = await generateNextUserId(); // Generate user ID in u001 format

      try {
        await User.createUser({
          user_id: userId,
          name,
          email,
          password: hashedPassword,
          role,
        });
        res.status(201).json({ message: "User created successfully" });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }
  );
};

module.exports = {
  login,
  signup,
};
