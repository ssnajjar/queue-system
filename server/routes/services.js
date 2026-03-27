// routes/services.js
const express = require("express");
const router  = express.Router();
const store   = require("../data/store");
const { validateService } = require("../middleware/validate");

router.get("/", (req, res) => {
  const servicesWithQueue = store.services.map((s) => ({
    ...s,
    queueLength: (store.queues[s.id] || []).length,
  }));
  return res.status(200).json(servicesWithQueue);
});

router.get("/:id", (req, res) => {
  const service = store.services.find((s) => s.id === parseInt(req.params.id));
  if (!service) return res.status(404).json({ error: "Service not found" });

  return res.status(200).json({
    ...service,
    queueLength: (store.queues[service.id] || []).length,
  });
});

router.post("/", validateService, (req, res) => {
  const { name, description, duration, priority } = req.body;

  const duplicate = store.services.find(
    (s) => s.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (duplicate) {
    return res.status(409).json({ error: "A service with this name already exists" });
  }

  const newService = {
    id:          store.services.length + 1,
    name:        name.trim(),
    description: description.trim(),
    duration:    Number(duration),
    priority,
  };

  store.services.push(newService);
  store.queues[newService.id] = [];

  return res.status(201).json({ message: "Service created", service: newService });
});

router.put("/:id", validateService, (req, res) => {
  const index = store.services.findIndex((s) => s.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Service not found" });

  const { name, description, duration, priority } = req.body;

  store.services[index] = {
    ...store.services[index],
    name:        name.trim(),
    description: description.trim(),
    duration:    Number(duration),
    priority,
  };

  return res.status(200).json({ message: "Service updated", service: store.services[index] });
});

router.delete("/:id", (req, res) => {
  const index = store.services.findIndex((s) => s.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Service not found" });

  store.services.splice(index, 1);
  delete store.queues[req.params.id];

  return res.status(200).json({ message: "Service deleted" });
});

module.exports = router;