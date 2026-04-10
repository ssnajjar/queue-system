require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const authRoutes         = require("./routes/auth");
const serviceRoutes      = require("./routes/services");
const queueRoutes        = require("./routes/queue");
const notificationRoutes = require("./routes/notifications");
const historyRoutes      = require("./routes/history");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth",          authRoutes);
app.use("/api/services",      serviceRoutes);
app.use("/api/queue",         queueRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/history",       historyRoutes);

app.get("/", (req, res) => {
  res.json({ message: "QueueSmart API is running", version: "1.0.0" });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Only start listening when run directly (not imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`QueueSmart API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
