// routes/auth.js
const express  = require("express");
const router   = express.Router();
const bcrypt   = require("bcrypt");
const db       = require("../db");
const { validateRegister, validateLogin } = require("../middleware/validate");

const SALT_ROUNDS = 10;

router.post("/register", validateRegister, async (req, res) => {
  const { name, email, password, role } = req.body;
  const assignedRole = role === "admin" ? "admin" : "user";

  try {
    const existing = await db.query(
      "SELECT id FROM user_credentials WHERE email = $1",
      [email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const credResult = await db.query(
      "INSERT INTO user_credentials (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email.toLowerCase(), passwordHash, assignedRole]
    );
    const creds = credResult.rows[0];

    await db.query(
      "INSERT INTO user_profile (user_id, full_name, email) VALUES ($1, $2, $3)",
      [creds.id, name.trim(), email.toLowerCase()]
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: creds.id, name: name.trim(), email: creds.email, role: creds.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", validateLogin, async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      `SELECT uc.id, uc.email, uc.password_hash, uc.role, up.full_name AS name
       FROM user_credentials uc
       JOIN user_profile up ON up.user_id = uc.id
       WHERE uc.email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user  = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT uc.id, up.full_name AS name, uc.email, uc.role
       FROM user_credentials uc
       JOIN user_profile up ON up.user_id = uc.id
       ORDER BY uc.id`
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
