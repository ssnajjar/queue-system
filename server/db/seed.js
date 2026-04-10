// seed script - adds test users, services, and some history to play with
// safe to run more than once, it checks first

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const bcrypt = require("bcrypt");
const pool   = require("./index");

const SALT_ROUNDS = 10;

const USERS = [
  { email: "admin@queuesmart.com", password: "admin123",   role: "admin", name: "Admin User"    },
  { email: "alice@example.com",    password: "password123", role: "user",  name: "Alice Johnson" },
  { email: "bob@example.com",      password: "pass456",    role: "user",  name: "Bob Martinez"  },
];

const SERVICES = [
  { name: "Academic Advising",   description: "Course planning and degree requirements",                    duration: 30, priority: "high"   },
  { name: "Financial Aid",       description: "Financial assistance, scholarships, and FAFSA help",         duration: 20, priority: "high"   },
  { name: "IT Help Desk",        description: "Technical support and troubleshooting",                      duration: 15, priority: "low"    },
  { name: "Registrar Office",    description: "Registration, transcripts, and enrollment verification",     duration: 25, priority: "medium" },
  { name: "Career Services",     description: "Career counseling, resume review, and job search assistance", duration: 45, priority: "medium" },
  { name: "Student Health Center", description: "General health consultations and wellness advising",       duration: 20, priority: "high"   },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // don't re-seed if there's already data in there
    const check = await client.query("SELECT COUNT(*) FROM service");
    if (parseInt(check.rows[0].count) > 0) {
      console.log("Database already seeded — skipping.");
      await client.query("ROLLBACK");
      return;
    }

    // Insert users
    const userIds = {};
    for (const u of USERS) {
      const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
      const { rows } = await client.query(
        "INSERT INTO user_credentials (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id",
        [u.email, hash, u.role]
      );
      const uid = rows[0].id;
      userIds[u.email] = uid;
      await client.query(
        "INSERT INTO user_profile (user_id, full_name, email) VALUES ($1, $2, $3)",
        [uid, u.name, u.email]
      );
    }

    const aliceId = userIds["alice@example.com"];
    const bobId   = userIds["bob@example.com"];

    // services + a queue for each one
    const serviceQueueMap = {}; // serviceName -> { queueId, duration }
    for (const s of SERVICES) {
      const { rows: sRows } = await client.query(
        `INSERT INTO service (name, description, expected_duration, priority_level)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [s.name, s.description, s.duration, s.priority]
      );
      const sid = sRows[0].id;

      const { rows: qRows } = await client.query(
        "INSERT INTO queue (service_id, status) VALUES ($1, 'open') RETURNING id",
        [sid]
      );
      serviceQueueMap[s.name] = { queueId: qRows[0].id, duration: s.duration };
    }

    // some past activity so the history screen isn't empty on first load
    const historyEntries = [
      { service: "Academic Advising", userId: aliceId, name: "Alice Johnson", pos: 1, wait: 30,  status: "served",   ago: "3 days" },
      { service: "Financial Aid",     userId: bobId,   name: "Bob Martinez",  pos: 2, wait: 40,  status: "served",   ago: "2 days" },
      { service: "IT Help Desk",      userId: aliceId, name: "Alice Johnson", pos: 1, wait: 15,  status: "canceled", ago: "1 day"  },
      { service: "Career Services",   userId: bobId,   name: "Bob Martinez",  pos: 1, wait: 45,  status: "served",   ago: "5 days" },
      { service: "Registrar Office",  userId: aliceId, name: "Alice Johnson", pos: 1, wait: 25,  status: "served",   ago: "4 days" },
      { service: "Student Health Center", userId: bobId, name: "Bob Martinez", pos: 1, wait: 20, status: "served",  ago: "6 days" },
      { service: "Financial Aid",     userId: aliceId, name: "Alice Johnson", pos: 1, wait: 20,  status: "served",   ago: "7 days" },
    ];

    for (const e of historyEntries) {
      const { queueId } = serviceQueueMap[e.service];
      await client.query(
        `INSERT INTO queue_entry (queue_id, user_id, user_name, position, wait_time_minutes, status, join_time)
         VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '${e.ago}')`,
        [queueId, e.userId, e.name, e.pos, e.wait, e.status]
      );
    }

    // notifications to match the history above
    const notifData = [
      { userId: aliceId, msg: "Welcome to QueueSmart! You can now join queues for available services.",            type: "info",    status: "viewed" },
      { userId: aliceId, msg: "You joined the Academic Advising queue. Position: 1, estimated wait: 30 min.",      type: "info",    status: "viewed" },
      { userId: aliceId, msg: "It's your turn at Academic Advising! Please proceed.",                              type: "success", status: "viewed" },
      { userId: aliceId, msg: "You joined the Registrar Office queue. Position: 1, estimated wait: 25 min.",       type: "info",    status: "viewed" },
      { userId: aliceId, msg: "It's your turn at Registrar Office! Please proceed.",                               type: "success", status: "viewed" },
      { userId: bobId,   msg: "Welcome to QueueSmart! You can now join queues for available services.",            type: "info",    status: "viewed" },
      { userId: bobId,   msg: "You joined the Financial Aid queue. Position: 1, estimated wait: 20 min.",          type: "info",    status: "sent"   },
      { userId: bobId,   msg: "It's your turn at Financial Aid! Please proceed.",                                  type: "success", status: "sent"   },
    ];

    for (const n of notifData) {
      await client.query(
        "INSERT INTO notification (user_id, message, type, status) VALUES ($1, $2, $3, $4)",
        [n.userId, n.msg, n.type, n.status]
      );
    }

    await client.query("COMMIT");

    console.log("✓ Database seeded successfully");
    console.log("");
    console.log("  Demo credentials:");
    console.log("    admin@queuesmart.com  /  admin123    (admin)");
    console.log("    alice@example.com     /  password123 (user)");
    console.log("    bob@example.com       /  pass456     (user)");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// can also run this file on its own: node db/seed.js
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed failed:", err.message);
      process.exit(1);
    });
}

module.exports = { seed };
