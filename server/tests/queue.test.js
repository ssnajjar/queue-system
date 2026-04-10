// tests/queue.test.js
jest.mock("../db", () => ({ query: jest.fn() }));

const request = require("supertest");
const app     = require("../server");
const db      = require("../db");

const mockService = { id: 1, name: "Academic Advising", duration: 30 };
const mockEntry   = {
  id: 100, user_id: 2, user_name: "Alice", position: 1,
  wait_time_minutes: 30, join_time: "2024-01-01T00:00:00Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

// -- open / close queue

describe("PUT /api/queue/:serviceId/status", () => {
  test("closes an open queue", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // service exists
      .mockResolvedValueOnce({ rows: [] })           // insert (on conflict do nothing)
      .mockResolvedValueOnce({ rows: [] });          // update status

    const res = await request(app).put("/api/queue/1/status").send({ status: "closed" });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("closed");
  });

  test("opens a closed queue", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).put("/api/queue/1/status").send({ status: "open" });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("open");
  });

  test("rejects invalid status value", async () => {
    const res = await request(app).put("/api/queue/1/status").send({ status: "paused" });
    expect(res.statusCode).toBe(400);
  });

  test("returns 404 for unknown service", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).put("/api/queue/999/status").send({ status: "closed" });
    expect(res.statusCode).toBe(404);
  });

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).put("/api/queue/1/status").send({ status: "closed" });
    expect(res.statusCode).toBe(500);
  });
});

// -- active queue lookup

describe("GET /api/queue/active/:userId", () => {
  test("returns active queue entry when user is in a queue", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 100, position: 2, wait_time_minutes: 60, service_id: 1, service_name: "Academic Advising" }],
    });

    const res = await request(app).get("/api/queue/active/2");
    expect(res.statusCode).toBe(200);
    expect(res.body.entry.position).toBe(2);
    expect(res.body.entry.serviceName).toBe("Academic Advising");
    expect(res.body.entry.serviceId).toBe(1);
  });

  test("returns null when user is not in any queue", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/queue/active/2");
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeNull();
  });

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).get("/api/queue/active/2");
    expect(res.statusCode).toBe(500);
  });
});

// -- get queue state

describe("GET /api/queue/:serviceId", () => {
  test("returns empty queue for a valid service", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [mockService] }) // get service
      .mockResolvedValueOnce({ rows: [] });           // queue entries

    const res = await request(app).get("/api/queue/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.queue).toEqual([]);
  });

  test("returns queue with entries and formatted status", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [mockService] })
      .mockResolvedValueOnce({ rows: [mockEntry] });

    const res = await request(app).get("/api/queue/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.queue.length).toBe(1);
    expect(res.body.queue[0].status).toBe("almost-ready"); // position 1
    expect(res.body.queue[0].userId).toBe(2);
  });

  test("returns 404 for unknown service", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/queue/999");
    expect(res.statusCode).toBe(404);
  });

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).get("/api/queue/1");
    expect(res.statusCode).toBe(500);
  });
});

// -- join queue

describe("POST /api/queue/:serviceId/join", () => {
  function mockJoin({ serviceRows = [mockService], queueId = 1, dupRows = [], countStr = "0", entryRow = mockEntry } = {}) {
    db.query
      .mockResolvedValueOnce({ rows: serviceRows })            // get service
      .mockResolvedValueOnce({ rows: [{ id: queueId }] })     // get queue (exists)
      .mockResolvedValueOnce({ rows: dupRows })                // duplicate check
      .mockResolvedValueOnce({ rows: [{ count: countStr }] }) // count for position
      .mockResolvedValueOnce({ rows: [entryRow] })            // insert entry
      .mockResolvedValue({ rows: [] });                        // notifications
  }

  test("user can join a queue", async () => {
    mockJoin();
    const res = await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    expect(res.statusCode).toBe(201);
    expect(res.body.entry.position).toBe(1);
    expect(res.body.entry.userId).toBe(2);
  });

  test("calculates wait time correctly (position × duration)", async () => {
    const entry2 = { ...mockEntry, user_id: 3, user_name: "Bob", position: 2, wait_time_minutes: 60 };
    mockJoin({ countStr: "1", entryRow: entry2 });

    const res = await request(app).post("/api/queue/1/join").send({ userId: 3, name: "Bob" });
    expect(res.body.entry.waitTime).toBe(60);
    expect(res.body.entry.position).toBe(2);
  });

  test("first user gets almost-ready status", async () => {
    mockJoin();
    const res = await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    expect(res.body.entry.status).toBe("almost-ready");
  });

  test("user at position 3+ gets waiting status", async () => {
    const entry3 = { ...mockEntry, user_id: 4, user_name: "Carol", position: 3, wait_time_minutes: 90 };
    mockJoin({ countStr: "2", entryRow: entry3 });

    const res = await request(app).post("/api/queue/1/join").send({ userId: 4, name: "Carol" });
    expect(res.body.entry.status).toBe("waiting");
  });

  test("prevents duplicate queue entry for same user", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [mockService] })
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockResolvedValueOnce({ rows: [{ id: 100 }] }); // duplicate found

    const res = await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    expect(res.statusCode).toBe(409);
  });

  test("rejects join with missing userId", async () => {
    const res = await request(app).post("/api/queue/1/join").send({ name: "Alice" });
    expect(res.statusCode).toBe(400);
  });

  test("rejects join for unknown service", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post("/api/queue/999/join").send({ userId: 2, name: "Alice" });
    expect(res.statusCode).toBe(404);
  });

  test("logs a notification when user joins", async () => {
    mockJoin();
    await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });

    const allCalls = db.query.mock.calls;
    const notifCall = allCalls.find(([sql]) => sql.includes("INSERT INTO notification"));
    expect(notifCall).toBeDefined();
  });

  test("rejects join when queue is closed", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [mockService] })           // get service
      .mockResolvedValueOnce({ rows: [{ id: 1, status: "closed" }] }); // queue is closed

    const res = await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/closed/i);
  });

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).post("/api/queue/1/join").send({ userId: 2, name: "Alice" });
    expect(res.statusCode).toBe(500);
  });
});

// -- leave queue

describe("DELETE /api/queue/:serviceId/leave", () => {
  function mockLeave({ serviceRows = [mockService], queueRows = [{ id: 1 }], entryRows = [{ id: 100 }] } = {}) {
    db.query
      .mockResolvedValueOnce({ rows: serviceRows }) // get service
      .mockResolvedValueOnce({ rows: queueRows })   // get queue
      .mockResolvedValueOnce({ rows: entryRows })   // find entry
      .mockResolvedValueOnce({ rows: [] })          // update to canceled
      .mockResolvedValue({ rows: [] });             // rebuild + notification
  }

  test("user can leave a queue", async () => {
    mockLeave();
    const res = await request(app).delete("/api/queue/1/leave").send({ userId: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Left queue successfully");
  });

  test("rebuilds queue positions after user leaves", async () => {
    mockLeave();
    await request(app).delete("/api/queue/1/leave").send({ userId: 2 });

    const allCalls = db.query.mock.calls;
    const rebuildCall = allCalls.find(([sql]) => sql.includes("ROW_NUMBER()"));
    expect(rebuildCall).toBeDefined();
  });

  test("logs a notification when user leaves", async () => {
    mockLeave();
    await request(app).delete("/api/queue/1/leave").send({ userId: 2 });

    const allCalls = db.query.mock.calls;
    const notifCall = allCalls.find(([sql]) => sql.includes("INSERT INTO notification"));
    expect(notifCall).toBeDefined();
  });

  test("returns 400 if userId is missing", async () => {
    const res = await request(app).delete("/api/queue/1/leave").send({});
    expect(res.statusCode).toBe(400);
  });

  test("returns 404 if service not found", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).delete("/api/queue/999/leave").send({ userId: 2 });
    expect(res.statusCode).toBe(404);
  });

  test("returns 404 if user not in queue", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [mockService] })
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockResolvedValueOnce({ rows: [] }); // user not found

    const res = await request(app).delete("/api/queue/1/leave").send({ userId: 99 });
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/not in this queue/i);
  });

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).delete("/api/queue/1/leave").send({ userId: 2 });
    expect(res.statusCode).toBe(500);
  });
});

// -- serve next

describe("POST /api/queue/:serviceId/serve", () => {
  function mockServe({ serviceRows = [mockService], queueRows = [{ id: 1 }], firstRows = [mockEntry], newFirstRows = [] } = {}) {
    db.query
      .mockResolvedValueOnce({ rows: serviceRows })   // get service
      .mockResolvedValueOnce({ rows: queueRows })     // get queue
      .mockResolvedValueOnce({ rows: firstRows })     // first waiting entry
      .mockResolvedValueOnce({ rows: [] })            // mark as served
      .mockResolvedValueOnce({ rows: [] })            // rebuild positions
      .mockResolvedValueOnce({ rows: [] })            // notify served user
      .mockResolvedValueOnce({ rows: newFirstRows })  // get new first in line
      .mockResolvedValue({ rows: [] });               // remaining queue + any extra
  }

  test("admin can serve next user", async () => {
    mockServe();
    const res = await request(app).post("/api/queue/1/serve");
    expect(res.statusCode).toBe(200);
    expect(res.body.served.userId).toBe(2);
  });

  test("returns remaining queue after serving", async () => {
    mockServe();
    const res = await request(app).post("/api/queue/1/serve");
    expect(res.body).toHaveProperty("remainingQueue");
    expect(Array.isArray(res.body.remainingQueue)).toBe(true);
  });

  test("notifies served user", async () => {
    mockServe();
    await request(app).post("/api/queue/1/serve");

    const allCalls = db.query.mock.calls;
    const notifCall = allCalls.find(
      ([sql, params]) => sql.includes("INSERT INTO notification") && params && params[0] === 2
    );
    expect(notifCall).toBeDefined();
  });

  test("returns 400 when queue is empty", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [mockService] })
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockResolvedValueOnce({ rows: [] }); // no entries

    const res = await request(app).post("/api/queue/1/serve");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/empty/i);
  });

  test("returns 404 for unknown service", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).post("/api/queue/999/serve");
    expect(res.statusCode).toBe(404);
  });

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).post("/api/queue/1/serve");
    expect(res.statusCode).toBe(500);
  });
});
