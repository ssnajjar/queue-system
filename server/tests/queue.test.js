// tests/queue.test.js
const request = require("supertest");
const app     = require("../server");
const store   = require("../data/store");

beforeEach(() => {
  store.services = [
    { id: 1, name: "Academic Advising", description: "Course planning", duration: 30, priority: "high" },
    { id: 2, name: "IT Help Desk",       description: "Tech support",    duration: 15, priority: "low"  },
  ];
  store.queues = { 1: [], 2: [] };
  store.history = [];
  store.notifications = [];
  store._nextQueueEntryId   = 100;
  store._nextHistoryId      = 1;
  store._nextNotificationId = 1;
});

describe("GET /api/queue/:serviceId", () => {
  test("returns empty queue for a valid service", async () => {
    const res = await request(app).get("/api/queue/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.queue).toEqual([]);
  });

  test("returns 404 for unknown service", async () => {
    const res = await request(app).get("/api/queue/999");
    expect(res.statusCode).toBe(404);
  });
});


describe("POST /api/queue/:serviceId/join", () => {
  test("user can join a queue", async () => {
    const res = await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    expect(res.statusCode).toBe(201);
    expect(res.body.entry.position).toBe(1);
    expect(res.body.entry.userId).toBe(2);
  });

  test("calculates wait time correctly (position × duration)", async () => {
    await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    const res = await request(app).post("/api/queue/1/join").send({ userId: 3, name: "Bob" });
    // position 2, duration 30 -> waitTime = 60
    expect(res.body.entry.waitTime).toBe(60);
    expect(res.body.entry.position).toBe(2);
  });

  test("first user gets almost-ready status", async () => {
    const res = await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    expect(res.body.entry.status).toBe("almost-ready");
  });

  test("user at position 3+ gets waiting status", async () => {
    await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    await request(app).post("/api/queue/1/join").send({ userId: 3, name: "Bob" });
    const res = await request(app).post("/api/queue/1/join").send({ userId: 4, name: "Carol" });
    expect(res.body.entry.status).toBe("waiting");
  });

  test("prevents duplicate queue entry for same user", async () => {
    await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    const res = await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    expect(res.statusCode).toBe(409);
  });

  test("rejects join with missing userId", async () => {
    const res = await request(app).post("/api/queue/1/join").send({ name: "Alice" });
    expect(res.statusCode).toBe(400);
  });

  test("rejects join for unknown service", async () => {
    const res = await request(app).post("/api/queue/999/join").send({ userId: 2, name: "Alice" });
    expect(res.statusCode).toBe(404);
  });

  test("logs a notification when user joins", async () => {
    await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    const notifications = store.notifications.filter((n) => n.userId === 2);
    expect(notifications.length).toBeGreaterThan(0);
  });
});

describe("DELETE /api/queue/:serviceId/leave", () => {
  test("user can leave a queue", async () => {
    await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    const res = await request(app).delete("/api/queue/1/leave").send({ userId: 2 });
    expect(res.statusCode).toBe(200);
    expect(store.queues[1].length).toBe(0);
  });

  test("positions are rebuilt after a user leaves", async () => {
    await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    await request(app).post("/api/queue/1/join").send({ userId: 3, name: "Bob" });
    await request(app).post("/api/queue/1/join").send({ userId: 4, name: "Carol" });

    // alice (pos 1) leaves -> bob should become pos 1
    await request(app).delete("/api/queue/1/leave").send({ userId: 2 });
    expect(store.queues[1][0].position).toBe(1);
    expect(store.queues[1][0].userId).toBe(3);
  });

  test("records Left Queue in history", async () => {
    await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    await request(app).delete("/api/queue/1/leave").send({ userId: 2 });
    const historyEntry = store.history.find((h) => h.userId === 2 && h.outcome === "Left Queue");
    expect(historyEntry).toBeDefined();
  });

  test("returns 404 if user not in queue", async () => {
    const res = await request(app).delete("/api/queue/1/leave").send({ userId: 99 });
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /api/queue/:serviceId/serve", () => {
  test("admin can serve next user", async () => {
    await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    const res = await request(app).post("/api/queue/1/serve");
    expect(res.statusCode).toBe(200);
    expect(res.body.served.userId).toBe(2);
    expect(store.queues[1].length).toBe(0);
  });

  test("records Served in history", async () => {
    await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    await request(app).post("/api/queue/1/serve");
    const historyEntry = store.history.find((h) => h.userId === 2 && h.outcome === "Served");
    expect(historyEntry).toBeDefined();
  });

  test("returns 400 when queue is empty", async () => {
    const res = await request(app).post("/api/queue/1/serve");
    expect(res.statusCode).toBe(400);
  });

  test("second user becomes position 1 after serving", async () => {
    await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    await request(app).post("/api/queue/1/join").send({ userId: 3, name: "Bob" });
    await request(app).post("/api/queue/1/serve");
    expect(store.queues[1][0].position).toBe(1);
    expect(store.queues[1][0].userId).toBe(3);
  });
});