// db/seed-demo.js
// Adds realistic history entries to an already-seeded database so the
// Reports screen has meaningful data for the demo and submission CSV.
// Safe to run against the live Neon DB — it never deletes anything.
//
// Usage:  node db/seed-demo.js

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const pool = require("./index");

async function seedDemo() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Resolve user IDs by email
    const userRows = await client.query(
      "SELECT id, email FROM user_credentials WHERE email = ANY($1)",
      [["alice@example.com", "bob@example.com", "admin@queuesmart.com"]]
    );
    const users = {};
    for (const r of userRows.rows) users[r.email] = r.id;

    const aliceId = users["alice@example.com"];
    const bobId   = users["bob@example.com"];

    if (!aliceId || !bobId) {
      throw new Error("Base users not found — run npm run db:seed first.");
    }

    // Resolve queue IDs by service name
    const queueRows = await client.query(`
      SELECT q.id AS queue_id, s.name AS service_name
      FROM queue q
      JOIN service s ON s.id = q.service_id
    `);
    const queues = {};
    for (const r of queueRows.rows) queues[r.service_name] = r.queue_id;

    // Each entry: service, userId, userName, position, waitTime, status, daysAgo
    const entries = [
      // Academic Advising
      { svc: "Academic Advising",      uid: aliceId, name: "Alice Johnson", pos: 2, wait: 35,  status: "served",   ago: 8  },
      { svc: "Academic Advising",      uid: bobId,   name: "Bob Martinez",  pos: 3, wait: 28,  status: "served",   ago: 10 },
      { svc: "Academic Advising",      uid: aliceId, name: "Alice Johnson", pos: 1, wait: 42,  status: "served",   ago: 14 },
      { svc: "Academic Advising",      uid: bobId,   name: "Bob Martinez",  pos: 2, wait: null, status: "canceled", ago: 12 },

      // Financial Aid
      { svc: "Financial Aid",          uid: bobId,   name: "Bob Martinez",  pos: 1, wait: 18,  status: "served",   ago: 9  },
      { svc: "Financial Aid",          uid: aliceId, name: "Alice Johnson", pos: 2, wait: 22,  status: "served",   ago: 11 },
      { svc: "Financial Aid",          uid: aliceId, name: "Alice Johnson", pos: 1, wait: null, status: "canceled", ago: 15 },

      // IT Help Desk
      { svc: "IT Help Desk",           uid: bobId,   name: "Bob Martinez",  pos: 1, wait: 12,  status: "served",   ago: 8  },
      { svc: "IT Help Desk",           uid: aliceId, name: "Alice Johnson", pos: 2, wait: 10,  status: "served",   ago: 13 },
      { svc: "IT Help Desk",           uid: bobId,   name: "Bob Martinez",  pos: 1, wait: 14,  status: "served",   ago: 18 },
      { svc: "IT Help Desk",           uid: aliceId, name: "Alice Johnson", pos: 3, wait: null, status: "canceled", ago: 20 },

      // Registrar Office
      { svc: "Registrar Office",       uid: bobId,   name: "Bob Martinez",  pos: 2, wait: 30,  status: "served",   ago: 9  },
      { svc: "Registrar Office",       uid: aliceId, name: "Alice Johnson", pos: 1, wait: 22,  status: "served",   ago: 16 },
      { svc: "Registrar Office",       uid: bobId,   name: "Bob Martinez",  pos: 3, wait: null, status: "canceled", ago: 19 },

      // Career Services
      { svc: "Career Services",        uid: aliceId, name: "Alice Johnson", pos: 1, wait: 50,  status: "served",   ago: 8  },
      { svc: "Career Services",        uid: bobId,   name: "Bob Martinez",  pos: 2, wait: 38,  status: "served",   ago: 11 },
      { svc: "Career Services",        uid: aliceId, name: "Alice Johnson", pos: 1, wait: 44,  status: "served",   ago: 17 },

      // Student Health Center
      { svc: "Student Health Center",  uid: bobId,   name: "Bob Martinez",  pos: 2, wait: 25,  status: "served",   ago: 9  },
      { svc: "Student Health Center",  uid: aliceId, name: "Alice Johnson", pos: 1, wait: 18,  status: "served",   ago: 13 },
      { svc: "Student Health Center",  uid: bobId,   name: "Bob Martinez",  pos: 1, wait: null, status: "canceled", ago: 21 },
    ];

    let inserted = 0;
    for (const e of entries) {
      const qid = queues[e.svc];
      if (!qid) { console.warn(`  ! Queue not found for "${e.svc}" — skipping`); continue; }

      await client.query(
        `INSERT INTO queue_entry
           (queue_id, user_id, user_name, position, wait_time_minutes, status, join_time)
         VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '${e.ago} days')`,
        [qid, e.uid, e.name, e.pos, e.wait, e.status]
      );
      inserted++;
    }

    await client.query("COMMIT");
    console.log(`\n  Demo data seeded — ${inserted} history entries added.\n`);
    console.log("  Open the app, log in as admin, go to Reports, and click Export CSV.\n");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err.message);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

seedDemo().catch(() => process.exit(1));
