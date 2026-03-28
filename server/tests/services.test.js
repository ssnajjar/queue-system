// tests/services.test.js
const request = require("supertest");
const app     = require("../server");
const store   = require("../data/store");

beforeEach(() => {
  store.services = [
    { id: 1, name: "Academic Advising", description: "Course planning", duration: 30, priority: "high"   },
    { id: 2, name: "IT Help Desk",       description: "Tech support",    duration: 15, priority: "low"    },
  ];
  store.queues = { 1: [], 2: [] };
});

describe("GET /api/services", () => {
  test("returns all services", async () => {
    const res = await request(app).get("/api/services");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test("includes queueLength on each service", async () => {
    const res = await request(app).get("/api/services");
    res.body.forEach((s) => expect(s).toHaveProperty("queueLength"));
  });
});

describe("GET /api/services/:id", () => {
  test("returns a specific service", async () => {
    const res = await request(app).get("/api/services/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Academic Advising");
  });

  test("returns 404 for unknown service", async () => {
    const res = await request(app).get("/api/services/999");
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /api/services", () => {
  test("creates a new service successfully", async () => {
    const res = await request(app).post("/api/services").send({
      name: "Career Centre", description: "Resume and job search help", duration: 20, priority: "medium",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.service.name).toBe("Career Centre");
  });

  test("rejects creation with missing fields", async () => {
    const res = await request(app).post("/api/services").send({ name: "No Duration" });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/missing/i);
  });

  test("rejects invalid priority", async () => {
    const res = await request(app).post("/api/services").send({
      name: "Bad Priority", description: "Test", duration: 10, priority: "urgent",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/priority/i);
  });

  test("rejects negative duration", async () => {
    const res = await request(app).post("/api/services").send({
      name: "Bad Duration", description: "Test", duration: -5, priority: "low",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/duration/i);
  });

  test("rejects duplicate service name", async () => {
    const res = await request(app).post("/api/services").send({
      name: "IT Help Desk", description: "Duplicate", duration: 10, priority: "low",
    });
    expect(res.statusCode).toBe(409);
  });
});

describe("PUT /api/services/:id", () => {
  test("updates a service successfully", async () => {
    const res = await request(app).put("/api/services/1").send({
      name: "Academic Advising Updated", description: "Updated description", duration: 45, priority: "medium",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.service.duration).toBe(45);
    expect(res.body.service.priority).toBe("medium");
  });

  test("returns 404 for unknown service", async () => {
    const res = await request(app).put("/api/services/999").send({
      name: "Ghost", description: "Doesn't exist", duration: 10, priority: "low",
    });
    expect(res.statusCode).toBe(404);
  });
});


describe("DELETE /api/services/:id", () => {
  test("deletes a service", async () => {
    const res = await request(app).delete("/api/services/2");
    expect(res.statusCode).toBe(200);
    expect(store.services.find((s) => s.id === 2)).toBeUndefined();
  });

  test("returns 404 for unknown service", async () => {
    const res = await request(app).delete("/api/services/999");
    expect(res.statusCode).toBe(404);
  });
});