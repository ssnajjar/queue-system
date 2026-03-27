// middleware/validate.js

const MAX_NAME_LENGTH  = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_DESC_LENGTH  = 500;
const VALID_PRIORITIES = ["low", "medium", "high"];

function missingFields(body, fields) {
  return fields.filter((f) => !body[f] && body[f] !== 0);
}


function validateRegister(req, res, next) {
  const { name, email, password } = req.body;

  const missing = missingFields(req.body, ["name", "email", "password"]);
  if (missing.length) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  }

  if (typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "name must be a non-empty string" });
  }
  if (name.trim().length > MAX_NAME_LENGTH) {
    return res.status(400).json({ error: `name must be at most ${MAX_NAME_LENGTH} characters` });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "email must be a valid email address" });
  }
  if (email.length > MAX_EMAIL_LENGTH) {
    return res.status(400).json({ error: `email must be at most ${MAX_EMAIL_LENGTH} characters` });
  }

  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "password must be at least 6 characters" });
  }

  next();
}

function validateLogin(req, res, next) {
  const missing = missingFields(req.body, ["email", "password"]);
  if (missing.length) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
    return res.status(400).json({ error: "email must be a valid email address" });
  }

  next();
}

function validateService(req, res, next) {
  const { name, description, duration, priority } = req.body;

  const missing = missingFields(req.body, ["name", "description", "duration", "priority"]);
  if (missing.length) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  }

  if (typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "name must be a non-empty string" });
  }
  if (name.trim().length > MAX_NAME_LENGTH) {
    return res.status(400).json({ error: `name must be at most ${MAX_NAME_LENGTH} characters` });
  }

  if (typeof description !== "string" || description.trim().length === 0) {
    return res.status(400).json({ error: "description must be a non-empty string" });
  }
  if (description.trim().length > MAX_DESC_LENGTH) {
    return res.status(400).json({ error: `description must be at most ${MAX_DESC_LENGTH} characters` });
  }

  if (typeof duration !== "number" || duration <= 0) {
    return res.status(400).json({ error: "duration must be a positive number (minutes)" });
  }

  if (!VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `priority must be one of: ${VALID_PRIORITIES.join(", ")}` });
  }

  next();
}

function validateJoinQueue(req, res, next) {
  const missing = missingFields(req.body, ["userId", "name"]);
  if (missing.length) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  }

  if (typeof req.body.userId !== "number") {
    return res.status(400).json({ error: "userId must be a number" });
  }
  if (typeof req.body.name !== "string" || req.body.name.trim().length === 0) {
    return res.status(400).json({ error: "name must be a non-empty string" });
  }

  next();
}

module.exports = { validateRegister, validateLogin, validateService, validateJoinQueue };