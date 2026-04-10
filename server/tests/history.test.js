// tests/history.test.js
jest.mock("../db", () => ({ query: jest.fn() }));

const request = require("supertest");
const app     = require("../server");
const db      = require("../db");

const mockHistory = [
  { id: 1, userId: 2, service: "Academic Advising", date: "2024-01-05", outcome: "Served",     waitTime: 30 },
  { id: 2, userId: 3, service: "Financial Aid",     date: "2024-01-04", outcome: "Left Queue",  waitTime: 20 },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/history", () => {
  test("returns all history records", async () => {
    db.query.mockResolvedValueOnce({ rows: mockHistory });

    const res = await request(app).get("/api/history");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test("history records contain expected fields", async () => {
    db.query.mockResolvedValueOnce({ rows: mockHistory });

    const res = await request(app).get("/api/history");
    expect(res.body[0]).toHaveProperty("service");
    expect(res.body[0]).toHaveProperty("outcome");
    expect(res.body[0]).toHaveProperty("waitTime");
  });

  test("returns empty array when no history exists", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/history");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).get("/api/history");
    expect(res.statusCode).toBe(500);
  });
});

describe("GET /api/history/:userId", () => {
  test("returns history for a specific user", async () => {
    db.query.mockResolvedValueOnce({ rows: [mockHistory[0]] });

    const res = await request(app).get("/api/history/2");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].userId).toBe(2);
  });

  test("returns empty array for user with no history", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/history/99");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).get("/api/history/2");
    expect(res.statusCode).toBe(500);
  });
});
