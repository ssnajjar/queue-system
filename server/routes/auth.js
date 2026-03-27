// routes/auth.js
const express = require("express");
const router  = express.Router();
const store   = require("../data/store");
const { validateRegister, validateLogin } = require("../middleware/validate");

router.post("/register", validateRegister, (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = store.users.find((u) => u.email === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const newUser = {
    id:       store.nextUserId(),
    name:     name.trim(),
    email:    email.toLowerCase(),
    password, 
    role:     role === "admin" ? "admin" : "user",
  };

  store.users.push(newUser);
  const { password: _omit, ...safeUser } = newUser;
  return res.status(201).json({ message: "User registered successfully", user: safeUser });
});

router.post("/login", validateLogin, (req, res) => {
  const { email, password } = req.body;

  const user = store.users.find(
    (u) => u.email === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const { password: _omit, ...safeUser } = user;
  return res.status(200).json({ message: "Login successful", user: safeUser });
});

router.get("/users", (req, res) => {
  const safeUsers = store.users.map(({ password: _omit, ...u }) => u);
  return res.status(200).json(safeUsers);
});

module.exports = router;