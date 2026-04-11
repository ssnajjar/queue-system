// tests/services.test.js
jest.mock("../db", () => ({ query: jest.fn() }));

const request = require("supertest");
const app     = require("../server");
const db      = require("../db");

const mockServices = [
  { id: 1, name: "Academic Advising", description: "Course planning", duration: 30, priority: "high",   queueLength: 0 },
  { id: 2, name: "IT Help Desk",      description: "Tech support",    duration: 15, priority: "low",    queueLength: 2 },
];

beforeEach(() => {
  jest.clearAllMocks();
});

// -- GET all services

describe("GET /api/services", () => {
  test("returns all services", async () => {
    db.query.mockResolvedValueOnce({ rows: mockServices });

    const res = await request(app).get("/api/services");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test("includes queueLength on each service", async () => {
    db.query.mockResolvedValueOnce({ rows: mockServices });

    const res = await request(app).get("/api/services");
    res.body.forEach((s) => expect(s).toHaveProperty("queueLength"));
  });

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).get("/api/services");
    expect(res.statusCode).toBe(500);
  });
});

// -- GET by id

describe("GET /api/services/:id", () => {
  test("returns a specific service", async () => {
    db.query.mockResolvedValueOnce({ rows: [mockServices[0]] });

    const res = await request(app).get("/api/services/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Academic Advising");
  });

  test("returns 404 for unknown service", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/services/999");
    expect(res.statusCode).toBe(404);
  });

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).get("/api/services/1");
    expect(res.statusCode).toBe(500);
  });
});

// -- POST (create)

describe("POST /api/services", () => {
  test("creates a new service successfully", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })  // no duplicate
      .mockResolvedValueOnce({ rows: [{ id: 3, name: "Career Centre", description: "Resume help", duration: 20, priority: "medium" }] }) // insert service
      .mockResolvedValueOnce({ rows: [] }); // insert queue

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
    db.query.mockResolvedValueOnce({ rows: [{ id: 2 }] }); // duplicate found

    const res = await request(app).post("/api/services").send({
      name: "IT Help Desk", description: "Duplicate", duration: 10, priority: "low",
    });
    expect(res.statusCode).toBe(409);
  });

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).post("/api/services").send({
      name: "New Service", description: "Desc", duration: 10, priority: "low",
    });
    expect(res.statusCode).toBe(500);
  });
});

// -- PUT (update)

describe("PUT /api/services/:id", () => {
  test("updates a service successfully", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: "Academic Advising Updated", description: "Updated", duration: 45, priority: "medium" }],
    });

    const res = await request(app).put("/api/services/1").send({
      name: "Academic Advising Updated", description: "Updated description", duration: 45, priority: "medium",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.service.duration).toBe(45);
    expect(res.body.service.priority).toBe("medium");
  });

  test("returns 404 for unknown service", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).put("/api/services/999").send({
      name: "Ghost", description: "Doesn't exist", duration: 10, priority: "low",
    });
    expect(res.statusCode).toBe(404);
  });
});

// -- DELETE

describe("DELETE /api/services/:id", () => {
  test("deletes a service", async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 2 }] });

    const res = await request(app).delete("/api/services/2");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Service deleted");
  });

  test("returns 404 for unknown service", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete("/api/services/999");
    expect(res.statusCode).toBe(404);
  });

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).delete("/api/services/1");
    expect(res.statusCode).toBe(500);
  });
});
