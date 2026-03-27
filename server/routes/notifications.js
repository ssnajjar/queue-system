// routes/notifications.js
const express = require("express");
const router  = express.Router();
const store   = require("../data/store");

function logNotification(userId, message, type = "info") {
  const notification = {
    id:      store.nextNotificationId(),
    userId,
    message,
    type,    
    time:    new Date().toISOString(),
    read:    false,
  };
  store.notifications.push(notification);
  return notification;
}


router.get("/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const userNotifications = store.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.time) - new Date(a.time)); 

  return res.status(200).json(userNotifications);
});

router.patch("/:id/read", (req, res) => {
  const notification = store.notifications.find((n) => n.id === parseInt(req.params.id));
  if (!notification) return res.status(404).json({ error: "Notification not found" });

  notification.read = true;
  return res.status(200).json({ message: "Notification marked as read", notification });
});

router.delete("/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  store.notifications = store.notifications.filter((n) => n.userId !== userId);
  return res.status(200).json({ message: "Notifications cleared" });
});

module.exports = router;
module.exports.logNotification = logNotification;