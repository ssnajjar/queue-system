// routes/history.js
const express = require("express");
const router  = express.Router();
const store   = require("../data/store");

router.get("/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const userHistory = store.history
    .filter((h) => h.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // most recent first

  return res.status(200).json(userHistory);
});

router.get("/", (req, res) => {
  const sorted = [...store.history].sort((a, b) => new Date(b.date) - new Date(a.date));
  return res.status(200).json(sorted);
});

module.exports = router;