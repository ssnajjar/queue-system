// routes/queue.js
const express  = require("express");
const router   = express.Router();
const db       = require("../db");
const { validateJoinQueue }  = require("../middleware/validate");
const { logNotification }    = require("./notifications");

function deriveStatus(position) {
  return position <= 2 ? "almost-ready" : "waiting";
}

function formatEntry(row) {
  return {
    id:       row.id,
    userId:   row.user_id,
    name:     row.user_name,
    position: row.position,
    waitTime: row.wait_time_minutes,
    status:   deriveStatus(row.position),
    joinedAt: row.join_time,
  };
}

// null if the queue is closed or doesn't exist yet
async function getOpenQueue(serviceId) {
  const result = await db.query(
    "SELECT id, status FROM queue WHERE service_id = $1 ORDER BY created_date DESC LIMIT 1",
    [serviceId]
  );
  if (result.rows.length === 0 || result.rows[0].status === "closed") return null;
  return result.rows[0].id;
}

// after someone leaves or gets served, shift everyone up
async function rebuildQueuePositions(queueId, serviceDuration) {
  await db.query(
    `UPDATE queue_entry qe
     SET position          = subq.new_pos,
         wait_time_minutes = subq.new_pos * $2
     FROM (
       SELECT id, ROW_NUMBER() OVER (ORDER BY join_time) AS new_pos
       FROM queue_entry
       WHERE queue_id = $1 AND status = 'waiting'
     ) subq
     WHERE qe.id = subq.id`,
    [queueId, serviceDuration]
  );
}

router.put("/:serviceId/status", async (req, res) => {
  const serviceId = parseInt(req.params.serviceId);
  const { status } = req.body;

  if (!["open", "closed"].includes(status)) {
    return res.status(400).json({ error: "status must be 'open' or 'closed'" });
  }

  try {
    const serviceCheck = await db.query(
      "SELECT id FROM service WHERE id = $1",
      [serviceId]
    );
    if (serviceCheck.rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    // make sure a queue row exists before flipping the status
    await db.query(
      `INSERT INTO queue (service_id, status) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [serviceId, status]
    );
    await db.query(
      "UPDATE queue SET status = $1 WHERE service_id = $2",
      [status, serviceId]
    );

    return res.status(200).json({ message: `Queue ${status}`, serviceId, status });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// used on login to restore queue state if the user was already waiting somewhere
router.get("/active/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const result = await db.query(
      `SELECT qe.id, qe.position, qe.wait_time_minutes,
              s.id AS service_id, s.name AS service_name
       FROM queue_entry qe
       JOIN queue   q ON qe.queue_id  = q.id
       JOIN service s ON q.service_id = s.id
       WHERE qe.user_id = $1 AND qe.status = 'waiting' AND q.status = 'open'
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) return res.status(200).json(null);

    const row = result.rows[0];
    return res.status(200).json({
      entry: {
        id:          row.id,
        position:    row.position,
        waitTime:    row.wait_time_minutes,
        serviceId:   row.service_id,
        serviceName: row.service_name,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:serviceId", async (req, res) => {
  const serviceId = parseInt(req.params.serviceId);
  try {
    const serviceResult = await db.query(
      `SELECT id, name, description,
              expected_duration AS duration,
              priority_level    AS priority
       FROM service WHERE id = $1`,
      [serviceId]
    );
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }
    const service = serviceResult.rows[0];

    const entriesResult = await db.query(
      `SELECT qe.id, qe.user_id, qe.user_name, qe.position,
              qe.wait_time_minutes, qe.join_time
       FROM queue_entry qe
       JOIN queue q ON qe.queue_id = q.id
       WHERE q.service_id = $1 AND q.status = 'open' AND qe.status = 'waiting'
       ORDER BY qe.position`,
      [serviceId]
    );

    return res.status(200).json({ service, queue: entriesResult.rows.map(formatEntry) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:serviceId/join", validateJoinQueue, async (req, res) => {
  const serviceId = parseInt(req.params.serviceId);
  const { userId, name } = req.body;

  try {
    const serviceResult = await db.query(
      "SELECT id, name, expected_duration AS duration FROM service WHERE id = $1",
      [serviceId]
    );
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }
    const service = serviceResult.rows[0];

    const queueId = await getOpenQueue(serviceId);
    if (queueId === null) {
      return res.status(403).json({ error: "This queue is currently closed" });
    }

    // Prevent duplicate entries
    const dupCheck = await db.query(
      "SELECT id FROM queue_entry WHERE queue_id = $1 AND user_id = $2 AND status = 'waiting'",
      [queueId, userId]
    );
    if (dupCheck.rows.length > 0) {
      return res.status(409).json({ error: "User is already in this queue", entry: dupCheck.rows[0] });
    }

    // Calculate position
    const posResult = await db.query(
      "SELECT COUNT(*) AS count FROM queue_entry WHERE queue_id = $1 AND status = 'waiting'",
      [queueId]
    );
    const position = parseInt(posResult.rows[0].count) + 1;
    const waitTime = position * service.duration;

    const entryResult = await db.query(
      `INSERT INTO queue_entry (queue_id, user_id, user_name, position, wait_time_minutes, status)
       VALUES ($1, $2, $3, $4, $5, 'waiting')
       RETURNING id, user_id, user_name, position, wait_time_minutes, join_time`,
      [queueId, userId, name.trim(), position, waitTime]
    );
    const entry = formatEntry(entryResult.rows[0]);

    await logNotification(
      userId,
      `You joined the ${service.name} queue. Position: ${position}, estimated wait: ${waitTime} min.`,
      "info"
    );
    if (entry.status === "almost-ready") {
      await logNotification(
        userId,
        `You're #${position} in line at ${service.name} — almost your turn!`,
        "alert"
      );
    }

    return res.status(201).json({ message: "Joined queue successfully", entry });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:serviceId/leave", async (req, res) => {
  const serviceId = parseInt(req.params.serviceId);
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    const serviceResult = await db.query(
      "SELECT id, name, expected_duration AS duration FROM service WHERE id = $1",
      [serviceId]
    );
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }
    const service = serviceResult.rows[0];

    const queueResult = await db.query(
      "SELECT id FROM queue WHERE service_id = $1 AND status = 'open' LIMIT 1",
      [serviceId]
    );
    if (queueResult.rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }
    const queueId = queueResult.rows[0].id;

    const entryResult = await db.query(
      "SELECT id FROM queue_entry WHERE queue_id = $1 AND user_id = $2 AND status = 'waiting'",
      [queueId, userId]
    );
    if (entryResult.rows.length === 0) {
      return res.status(404).json({ error: "User not in this queue" });
    }

    await db.query("UPDATE queue_entry SET status = 'canceled' WHERE id = $1", [entryResult.rows[0].id]);
    await rebuildQueuePositions(queueId, service.duration);
    await logNotification(userId, `You have left the ${service.name} queue.`, "info");

    return res.status(200).json({ message: "Left queue successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:serviceId/serve", async (req, res) => {
  const serviceId = parseInt(req.params.serviceId);

  try {
    const serviceResult = await db.query(
      "SELECT id, name, expected_duration AS duration FROM service WHERE id = $1",
      [serviceId]
    );
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }
    const service = serviceResult.rows[0];

    const queueResult = await db.query(
      "SELECT id FROM queue WHERE service_id = $1 AND status = 'open' LIMIT 1",
      [serviceId]
    );
    if (queueResult.rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }
    const queueId = queueResult.rows[0].id;

    // grab whoever is first in line
    const firstResult = await db.query(
      `SELECT id, user_id, user_name, position, wait_time_minutes, join_time
       FROM queue_entry
       WHERE queue_id = $1 AND status = 'waiting'
       ORDER BY position LIMIT 1`,
      [queueId]
    );
    if (firstResult.rows.length === 0) {
      return res.status(400).json({ error: "Queue is empty" });
    }
    const served = firstResult.rows[0];

    await db.query("UPDATE queue_entry SET status = 'served' WHERE id = $1", [served.id]);
    await rebuildQueuePositions(queueId, service.duration);

    await logNotification(served.user_id, `It's your turn at ${service.name}! Please proceed.`, "success");

    // let the next person know they're almost up
    const newFirstResult = await db.query(
      "SELECT user_id, position FROM queue_entry WHERE queue_id = $1 AND status = 'waiting' ORDER BY position LIMIT 1",
      [queueId]
    );
    if (newFirstResult.rows.length > 0 && newFirstResult.rows[0].position <= 2) {
      await logNotification(
        newFirstResult.rows[0].user_id,
        `You're now #1 in line at ${service.name} — get ready!`,
        "alert"
      );
    }

    // fetch the updated queue to send back
    const remainingResult = await db.query(
      `SELECT id, user_id, user_name, position, wait_time_minutes, join_time
       FROM queue_entry
       WHERE queue_id = $1 AND status = 'waiting'
       ORDER BY position`,
      [queueId]
    );

    return res.status(200).json({
      message:        "User served",
      served:         formatEntry(served),
      remainingQueue: remainingResult.rows.map(formatEntry),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
