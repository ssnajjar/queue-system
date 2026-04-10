// run this once to set up the db from scratch (npm run db:init)

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const fs   = require("fs");
const path = require("path");
const pool = require("./index");
const { seed } = require("./seed");

async function init() {
  console.log("Connecting to database...");

  // make sure we can actually connect before doing anything
  await pool.query("SELECT 1");
  console.log("✓ Connected");

  console.log("Applying schema...");
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);
  console.log("✓ Tables created");

  console.log("Seeding data...");
  await seed();

  await pool.end();
}

init().catch((err) => {
  console.error("\nDatabase setup failed:", err.message);
  console.error("\nMake sure your DATABASE_URL in server/.env is correct.");
  process.exit(1);
});
