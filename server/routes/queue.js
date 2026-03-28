// routes/queue.js
const express = require("express");
const router  = express.Router();
const store   = require("../data/store");
const { validateJoinQueue } = require("../middleware/validate");
const { logNotification }   = require("./notifications");

function estimateWaitTime(position, serviceDuration) {
  return position * serviceDuration;
}

function deriveStatus(position) {
  return position <= 2 ? "almost-ready" : "waiting";
}

function rebuildQueue(serviceId) {
  const service = store.services.find((s) => s.id === serviceId);
  const queue   = store.queues[serviceId] || [];

  queue.forEach((entry, idx) => {
    entry.position = idx + 1;
    entry.waitTime = estimateWaitTime(idx + 1, service ? service.duration : 15);
    entry.status   = deriveStatus(idx + 1);
  });
}

router.get("/:serviceId", (req, res) => {
  const serviceId = parseInt(req.params.serviceId);
  const service   = store.services.find((s) => s.id === serviceId);
  if (!service) return res.status(404).json({ error: "Service not found" });

  const queue = store.queues[serviceId] || [];
  return res.status(200).json({ service, queue });
});

router.post("/:serviceId/join", validateJoinQueue, (req, res) => {
  const serviceId = parseInt(req.params.serviceId);
  const service   = store.services.find((s) => s.id === serviceId);
  if (!service) return res.status(404).json({ error: "Service not found" });

  const { userId, name } = req.body;

  const queue = store.queues[serviceId] || [];
  const alreadyIn = queue.find((e) => e.userId === userId);
  if (alreadyIn) {
    return res.status(409).json({ error: "User is already in this queue", entry: alreadyIn });
  }

  const position = queue.length + 1;
  const entry = {
    id:       store.nextQueueEntryId(),
    userId,
    name,
    position,
    waitTime: estimateWaitTime(position, service.duration),
    status:   deriveStatus(position),
    joinedAt: new Date().toISOString(),
  };

  queue.push(entry);
  store.queues[serviceId] = queue;

  logNotification(userId, `You joined the ${service.name} queue. Position: ${position}, estimated wait: ${entry.waitTime} min.`, "info");

  if (entry.status === "almost-ready") {
    logNotification(userId, `You're #${position} in line at ${service.name} — almost your turn!`, "alert");
  }

  return res.status(201).json({ message: "Joined queue successfully", entry });
});

router.delete("/:serviceId/leave", (req, res) => {
  const serviceId = parseInt(req.params.serviceId);
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: "userId is required" });

  const queue = store.queues[serviceId];
  if (!queue) return res.status(404).json({ error: "Service not found" });

  const index = queue.findIndex((e) => e.userId === userId);
  if (index === -1) return res.status(404).json({ error: "User not in this queue" });

  const [removed] = queue.splice(index, 1);
  rebuildQueue(serviceId);

  const service = store.services.find((s) => s.id === serviceId);
  store.history.push({
    id:       store.nextHistoryId(),
    userId,
    service:  service ? service.name : "Unknown",
    date:     new Date().toISOString().split("T")[0],
    outcome:  "Left Queue",
    waitTime: removed.waitTime,
  });

  logNotification(userId, `You have left the ${service ? service.name : "queue"}.`, "info");

  return res.status(200).json({ message: "Left queue successfully" });
});

router.post("/:serviceId/serve", (req, res) => {
  const serviceId = parseInt(req.params.serviceId);
  const queue     = store.queues[serviceId];
  const service   = store.services.find((s) => s.id === serviceId);

  if (!queue || !service) return res.status(404).json({ error: "Service not found" });
  if (queue.length === 0)  return res.status(400).json({ error: "Queue is empty" });

  const [served] = queue.splice(0, 1);
  rebuildQueue(serviceId);

  store.history.push({
    id:       store.nextHistoryId(),
    userId:   served.userId,
    service:  service.name,
    date:     new Date().toISOString().split("T")[0],
    outcome:  "Served",
    waitTime: served.waitTime,
  });

  // notify served user
  logNotification(served.userId, `It's your turn at ${service.name}! Please proceed.`, "success");

  // notify new first-in-line if exists
  if (queue.length > 0 && queue[0].status === "almost-ready") {
    logNotification(queue[0].userId, `You're now #1 in line at ${service.name} — get ready!`, "alert");
  }

  return res.status(200).json({ message: "User served", served, remainingQueue: queue });
});

module.exports = router;