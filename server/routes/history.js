// routes/history.js
const express = require("express");
const router  = express.Router();
const db      = require("../db");

const HISTORY_SELECT = `
  SELECT
    qe.id,
    qe.user_id                                             AS "userId",
    s.name                                                 AS service,
    TO_CHAR(qe.join_time AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
    CASE qe.status
      WHEN 'served'   THEN 'Served'
      WHEN 'canceled' THEN 'Left Queue'
    END                                                    AS outcome,
    qe.wait_time_minutes                                   AS "waitTime"
  FROM queue_entry qe
  JOIN queue   q ON qe.queue_id  = q.id
  JOIN service s ON q.service_id = s.id
  WHERE qe.status IN ('served', 'canceled')
`;

router.get("/", async (req, res) => {
  try {
    const result = await db.query(HISTORY_SELECT + " ORDER BY qe.join_time DESC");
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const result = await db.query(
      HISTORY_SELECT + " AND qe.user_id = $1 ORDER BY qe.join_time DESC",
      [userId]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
