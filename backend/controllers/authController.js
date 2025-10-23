const User = require("../models/User");
const db = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Function to generate next user ID in format u001, u002, etc.
const generateNextUserId = async () => {
  try {
    const pool = require("../models/db");
    const [results] = await pool.query(
      "SELECT user_id FROM users WHERE user_id LIKE 'u%' ORDER BY CAST(SUBSTRING(user_id, 2) AS UNSIGNED) DESC LIMIT 1"
    );

    let nextNumber = 1;
    if (results && results.length > 0) {
      const lastUserId = results[0].user_id;
      const lastNumber = parseInt(lastUserId.substring(1));
      nextNumber = lastNumber + 1;
    }

    // Format as u001, u002, etc.
    const newUserId = `u${nextNumber.toString().padStart(3, "0")}`;
    return newUserId;
  } catch (err) {
    throw new Error(`Failed to generate user ID: ${err.message}`);
  }
};

const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validate that either email or username is provided
    if (!email && !username) {
      return res.status(400).json({ error: "Email or username is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Use promise-based pool
    const pool = require("../models/db");

    // Query by email or user_id (username)
    let results;
    if (email && username) {
      // If both provided, search for either
      [results] = await pool.query(
        "SELECT * FROM users WHERE email = ? OR user_id = ?",
        [email, username]
      );
    } else if (email) {
      // Search by email
      [results] = await pool.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
    } else {
      // Search by username (user_id)
      [results] = await pool.query("SELECT * FROM users WHERE user_id = ?", [
        username,
      ]);
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    // Only allow participant and coordinator roles - NEVER allow admin registration
    const validRoles = ["participant", "coordinator"];
    const userRole = role && validRoles.includes(role) ? role : "participant";

    // Use promise-based pool
    const pool = require("../models/db");

    // Check if user already exists
    const [existingUsers] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await generateNextUserId();

    await User.createUser({
      user_id: userId,
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    res
      .status(201)
      .json({ message: "User created successfully", user_id: userId });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  login,
  signup,
};
