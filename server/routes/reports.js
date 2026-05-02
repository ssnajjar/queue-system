// routes/reports.js
const express = require("express");
const router  = express.Router();
const db      = require("../db");
const { requireAdmin } = require("../middleware/validate");

router.use(requireAdmin);

// Build WHERE clause from optional query filters
function buildFilters(query) {
  const { startDate, endDate, serviceId } = query;
  const conditions = ["qe.status IN ('served', 'canceled')"];
  const params = [];

  if (startDate) {
    params.push(startDate);
    conditions.push(`qe.join_time >= $${params.length}::date`);
  }
  if (endDate) {
    params.push(endDate);
    conditions.push(`qe.join_time < ($${params.length}::date + INTERVAL '1 day')`);
  }
  if (serviceId) {
    params.push(parseInt(serviceId));
    conditions.push(`q.service_id = $${params.length}`);
  }

  return { where: "WHERE " + conditions.join(" AND "), params };
}

// GET /api/reports/summary
// Overall stats + per-service breakdown (used by the admin reports UI)
router.get("/summary", async (req, res) => {
  const { where, params } = buildFilters(req.query);

  try {
    const overallResult = await db.query(
      `SELECT
         COUNT(*)                                            AS "totalEntries",
         COUNT(*) FILTER (WHERE qe.status = 'served')      AS "totalServed",
         COUNT(*) FILTER (WHERE qe.status = 'canceled')    AS "totalCanceled",
         ROUND(AVG(qe.wait_time_minutes)
               FILTER (WHERE qe.status = 'served'), 1)     AS "avgWaitTime"
       FROM queue_entry qe
       JOIN queue   q ON qe.queue_id  = q.id
       ${where}`,
      params
    );

    const serviceResult = await db.query(
      `SELECT
         s.name                                                        AS service,
         COUNT(*) FILTER (WHERE qe.status = 'served')                 AS served,
         COUNT(*) FILTER (WHERE qe.status = 'canceled')               AS canceled,
         ROUND(AVG(qe.wait_time_minutes)
               FILTER (WHERE qe.status = 'served'), 1)                AS "avgWaitTime"
       FROM queue_entry qe
       JOIN queue   q ON qe.queue_id  = q.id
       JOIN service s ON q.service_id = s.id
       ${where}
       GROUP BY s.id, s.name
       ORDER BY s.name`,
      params
    );

    return res.status(200).json({
      overall:   overallResult.rows[0],
      byService: serviceResult.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/reports/history
// Full history records with optional filters (used to populate the report table)
router.get("/history", async (req, res) => {
  const { where, params } = buildFilters(req.query);

  try {
    const result = await db.query(
      `SELECT
         qe.id,
         qe.user_id                                              AS "userId",
         qe.user_name                                            AS "userName",
         s.name                                                  AS service,
         TO_CHAR(qe.join_time AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
         qe.status                                               AS outcome,
         qe.wait_time_minutes                                    AS "waitTime"
       FROM queue_entry qe
       JOIN queue   q ON qe.queue_id  = q.id
       JOIN service s ON q.service_id = s.id
       ${where}
       ORDER BY qe.join_time DESC`,
      params
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/reports/export/csv
// Streams a CSV file download with optional date/service filters
router.get("/export/csv", async (req, res) => {
  const { where, params } = buildFilters(req.query);

  try {
    const result = await db.query(
      `SELECT
         qe.id,
         qe.user_id                                              AS "userId",
         qe.user_name                                            AS "userName",
         s.name                                                  AS service,
         TO_CHAR(qe.join_time AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
         qe.status                                               AS outcome,
         qe.wait_time_minutes                                    AS "waitTime"
       FROM queue_entry qe
       JOIN queue   q ON qe.queue_id  = q.id
       JOIN service s ON q.service_id = s.id
       ${where}
       ORDER BY qe.join_time DESC`,
      params
    );

    // Safely escape a CSV cell value
    const escape = (val) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const headers = [
      "Entry ID", "User ID", "User Name",
      "Service", "Date", "Outcome", "Wait Time (min)",
    ];

    const lines = [
      headers.map(escape).join(","),
      ...result.rows.map((r) =>
        [r.id, r.userId, r.userName, r.service, r.date, r.outcome, r.waitTime ?? ""]
          .map(escape)
          .join(",")
      ),
    ];

    const csv      = lines.join("\n");
    const filename = `queuesmart-report-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
