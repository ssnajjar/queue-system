// routes/notifications.js
const express = require("express");
const router  = express.Router();
const db      = require("../db");

// queue routes call this whenever something happens that the user should know about
async function logNotification(userId, message, type = "info") {
  await db.query(
    "INSERT INTO notification (user_id, message, type, status) VALUES ($1, $2, $3, 'sent')",
    [userId, message, type]
  );
}

router.get("/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const result = await db.query(
      `SELECT id, user_id AS "userId", message, type,
              timestamp AS time,
              (status = 'viewed') AS read
       FROM notification
       WHERE user_id = $1
       ORDER BY timestamp DESC`,
      [userId]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE notification SET status = 'viewed' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Notification not found" });
    const n = result.rows[0];
    return res.status(200).json({
      message: "Notification marked as read",
      notification: { ...n, read: true },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    await db.query("DELETE FROM notification WHERE user_id = $1", [userId]);
    return res.status(200).json({ message: "Notifications cleared" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
module.exports.logNotification = logNotification;
