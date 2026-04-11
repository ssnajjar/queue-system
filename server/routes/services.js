// routes/services.js
const express = require("express");
const router  = express.Router();
const db      = require("../db");
const { validateService } = require("../middleware/validate");

const SERVICE_SELECT = `
  SELECT s.id, s.name, s.description,
         s.expected_duration AS duration,
         s.priority_level    AS priority,
         COALESCE(
           (SELECT status FROM queue WHERE service_id = s.id ORDER BY created_date DESC LIMIT 1),
           'open'
         ) AS "queueStatus",
         (
           SELECT COUNT(*) FROM queue_entry qe
           JOIN queue q ON qe.queue_id = q.id
           WHERE q.service_id = s.id AND qe.status = 'waiting'
         ) AS "queueLength"
  FROM service s
`;

router.get("/", async (req, res) => {
  try {
    const result = await db.query(SERVICE_SELECT + " ORDER BY s.id");
    const services = result.rows.map((s) => ({ ...s, queueLength: parseInt(s.queueLength) || 0 }));
    return res.status(200).json(services);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await db.query(
      SERVICE_SELECT + " WHERE s.id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Service not found" });
    const s = result.rows[0];
    return res.status(200).json({ ...s, queueLength: parseInt(s.queueLength) || 0 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", validateService, async (req, res) => {
  const { name, description, duration, priority } = req.body;

  try {
    const dup = await db.query(
      "SELECT id FROM service WHERE LOWER(name) = LOWER($1)",
      [name.trim()]
    );
    if (dup.rows.length > 0) {
      return res.status(409).json({ error: "A service with this name already exists" });
    }

    const result = await db.query(
      `INSERT INTO service (name, description, expected_duration, priority_level)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, expected_duration AS duration, priority_level AS priority`,
      [name.trim(), description.trim(), Number(duration), priority]
    );
    const service = result.rows[0];

    // Create an open queue for the new service
    await db.query(
      "INSERT INTO queue (service_id, status) VALUES ($1, 'open')",
      [service.id]
    );

    return res.status(201).json({ message: "Service created", service });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", validateService, async (req, res) => {
  const { name, description, duration, priority } = req.body;

  try {
    const result = await db.query(
      `UPDATE service
       SET name = $1, description = $2, expected_duration = $3, priority_level = $4
       WHERE id = $5
       RETURNING id, name, description, expected_duration AS duration, priority_level AS priority`,
      [name.trim(), description.trim(), Number(duration), priority, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Service not found" });
    return res.status(200).json({ message: "Service updated", service: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM service WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Service not found" });
    return res.status(200).json({ message: "Service deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
