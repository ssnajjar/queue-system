// routes/smart.js
// Smart wait-time estimator + alternative service recommender
const express = require("express");
const router  = express.Router();
const db      = require("../db");

// Minimum number of historical samples required before we trust the average.
// Below this threshold the system falls back to the static estimate.
const MIN_SAMPLES = 3;

// If smart estimated wait (in minutes) exceeds this, suggest an alternative.
const SUGGEST_ALT_THRESHOLD = 20;

// Weight given to historical data vs. static (configured) duration estimate.
const HISTORY_WEIGHT = 0.7;
const STATIC_WEIGHT  = 1 - HISTORY_WEIGHT;

// GET /api/smart/estimate/:serviceId
// Returns a smart wait-time estimate and an optional alternative service
// recommendation. Called by the frontend when a user selects a service to join.
router.get("/estimate/:serviceId", async (req, res) => {
  const serviceId = parseInt(req.params.serviceId);
  if (isNaN(serviceId)) {
    return res.status(400).json({ error: "Invalid service ID" });
  }

  try {
    // 1. Fetch service config (expected duration)
    const svcResult = await db.query(
      `SELECT id, name, expected_duration AS duration
       FROM service
       WHERE id = $1`,
      [serviceId]
    );
    if (svcResult.rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }
    const service = svcResult.rows[0];

    // 2. Count how many people are currently waiting
    const waitingResult = await db.query(
      `SELECT COUNT(*) AS queue_length
       FROM queue_entry qe
       JOIN queue q ON qe.queue_id = q.id
       WHERE q.service_id = $1
         AND qe.status = 'waiting'`,
      [serviceId]
    );
    const queueLength = parseInt(waitingResult.rows[0].queue_length) || 0;

    // 3. Pull historical average actual wait time per person (served only)
    const histResult = await db.query(
      `SELECT ROUND(AVG(qe.wait_time_minutes), 1) AS hist_avg,
              COUNT(*) AS sample_count
       FROM queue_entry qe
       JOIN queue q ON qe.queue_id = q.id
       WHERE q.service_id = $1
         AND qe.status = 'served'
         AND qe.wait_time_minutes IS NOT NULL`,
      [serviceId]
    );
    const histAvg     = parseFloat(histResult.rows[0].hist_avg)  || null;
    const sampleCount = parseInt(histResult.rows[0].sample_count) || 0;
    const hasHistory  = sampleCount >= MIN_SAMPLES && histAvg !== null;

    // 4. Compute estimates
    const staticEstimate = queueLength * service.duration;

    let smartEstimate;
    if (hasHistory) {
      // Blend: historical avg per person × queue length, weighted with static
      const histBased   = queueLength * histAvg;
      smartEstimate = Math.round(HISTORY_WEIGHT * histBased + STATIC_WEIGHT * staticEstimate);
    } else {
      // Not enough history — fall back to static
      smartEstimate = staticEstimate;
    }

    // 5. Find an alternative if the wait is long
    let alternative = null;
    if (smartEstimate >= SUGGEST_ALT_THRESHOLD) {
      const altResult = await db.query(
        `SELECT
           s.id,
           s.name,
           s.description,
           s.priority_level AS priority,
           s.expected_duration AS duration,
           COALESCE(COUNT(qe.id), 0)::int AS queue_length,
           q.status AS queue_status
         FROM service s
         JOIN queue q ON q.service_id = s.id
         LEFT JOIN queue_entry qe
           ON qe.queue_id = q.id AND qe.status = 'waiting'
         WHERE s.id != $1
           AND q.status = 'open'
         GROUP BY s.id, s.name, s.description, s.priority_level,
                  s.expected_duration, q.status
         ORDER BY COUNT(qe.id) ASC
         LIMIT 1`,
        [serviceId]
      );

      if (altResult.rows.length > 0) {
        const alt = altResult.rows[0];

        // Compute a quick smart estimate for the alternative too
        const altHistResult = await db.query(
          `SELECT ROUND(AVG(qe.wait_time_minutes), 1) AS hist_avg,
                  COUNT(*) AS sample_count
           FROM queue_entry qe
           JOIN queue q ON qe.queue_id = q.id
           WHERE q.service_id = $1
             AND qe.status = 'served'
             AND qe.wait_time_minutes IS NOT NULL`,
          [alt.id]
        );
        const altHistAvg     = parseFloat(altHistResult.rows[0].hist_avg)  || null;
        const altSampleCount = parseInt(altHistResult.rows[0].sample_count) || 0;
        const altHasHistory  = altSampleCount >= MIN_SAMPLES && altHistAvg !== null;

        const altStatic = alt.queue_length * alt.duration;
        let altSmartEstimate;
        if (altHasHistory) {
          altSmartEstimate = Math.round(HISTORY_WEIGHT * (alt.queue_length * altHistAvg) + STATIC_WEIGHT * altStatic);
        } else {
          altSmartEstimate = altStatic;
        }

        // Only suggest the alternative if it's meaningfully shorter
        if (altSmartEstimate < smartEstimate) {
          alternative = {
            id:            alt.id,
            name:          alt.name,
            description:   alt.description,
            priority:      alt.priority,
            queueLength:   alt.queue_length,
            smartEstimate: altSmartEstimate,
          };
        }
      }
    }

    return res.status(200).json({
      serviceId,
      queueLength,
      staticEstimate,
      smartEstimate,
      hasHistory,
      sampleCount,
      histAvgPerPerson: hasHistory ? histAvg : null,
      alternative,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
