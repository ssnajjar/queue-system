// tests/notifications.test.js
jest.mock("../db", () => ({ query: jest.fn() }));

const request = require("supertest");
const app     = require("../server");
const db      = require("../db");

const mockNotifications = [
  { id: 1, userId: 2, message: "You joined the queue.", type: "info",    time: "2024-01-01T10:00:00Z", read: false },
  { id: 2, userId: 2, message: "It's your turn!",       type: "success", time: "2024-01-01T10:30:00Z", read: true  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/notifications/:userId", () => {
  test("returns notifications for a user", async () => {
    db.query.mockResolvedValueOnce({ rows: mockNotifications });

    const res = await request(app).get("/api/notifications/2");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test("notifications include read status", async () => {
    db.query.mockResolvedValueOnce({ rows: mockNotifications });

    const res = await request(app).get("/api/notifications/2");
    res.body.forEach((n) => expect(n).toHaveProperty("read"));
  });

  test("returns empty array when user has no notifications", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/notifications/99");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).get("/api/notifications/2");
    expect(res.statusCode).toBe(500);
  });
});

describe("PATCH /api/notifications/:id/read", () => {
  test("marks a notification as read", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, user_id: 2, message: "You joined the queue.", type: "info", status: "viewed" }],
    });

    const res = await request(app).patch("/api/notifications/1/read");
    expect(res.statusCode).toBe(200);
    expect(res.body.notification.read).toBe(true);
  });

  test("returns 404 if notification not found", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).patch("/api/notifications/999/read");
    expect(res.statusCode).toBe(404);
  });

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).patch("/api/notifications/1/read");
    expect(res.statusCode).toBe(500);
  });
});

describe("DELETE /api/notifications/:userId", () => {
  test("clears all notifications for a user", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete("/api/notifications/2");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/cleared/i);
  });

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).delete("/api/notifications/2");
    expect(res.statusCode).toBe(500);
  });
});
