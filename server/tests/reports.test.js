// tests/reports.test.js
jest.mock("../db", () => ({ query: jest.fn() }));

const request = require("supertest");
const app     = require("../server");
const db      = require("../db");

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------

const ADMIN_MOCK = { rows: [{ role: "admin" }] };

const mockOverall = {
  totalEntries: "10",
  totalServed:  "7",
  totalCanceled: "3",
  avgWaitTime:  "18.5",
};

const mockByService = [
  { service: "Academic Advising", served: "4", canceled: "1", avgWaitTime: "20.0" },
  { service: "Financial Aid",     served: "3", canceled: "2", avgWaitTime: "15.5" },
];

const mockHistoryRows = [
  { id: 1, userId: 2, userName: "Alice", service: "Academic Advising", date: "2024-01-05", outcome: "served",   waitTime: 22 },
  { id: 2, userId: 3, userName: "Bob",   service: "Financial Aid",     date: "2024-01-04", outcome: "canceled", waitTime: null },
];

// ---------------------------------------------------------------------------
// GET /api/reports/summary
// ---------------------------------------------------------------------------

describe("GET /api/reports/summary", () => {
  test("returns overall stats and per-service breakdown", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)                      // requireAdmin
      .mockResolvedValueOnce({ rows: [mockOverall] })         // overall query
      .mockResolvedValueOnce({ rows: mockByService });        // by-service query

    const res = await request(app).get("/api/reports/summary").set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("overall");
    expect(res.body).toHaveProperty("byService");
  });

  test("overall stats contain expected fields", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: [mockOverall] })
      .mockResolvedValueOnce({ rows: mockByService });

    const res = await request(app).get("/api/reports/summary").set("x-user-id", "1");

    expect(res.body.overall).toHaveProperty("totalServed");
    expect(res.body.overall).toHaveProperty("totalCanceled");
    expect(res.body.overall).toHaveProperty("avgWaitTime");
  });

  test("byService is an array with correct structure", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: [mockOverall] })
      .mockResolvedValueOnce({ rows: mockByService });

    const res = await request(app).get("/api/reports/summary").set("x-user-id", "1");

    expect(Array.isArray(res.body.byService)).toBe(true);
    expect(res.body.byService[0]).toHaveProperty("service");
    expect(res.body.byService[0]).toHaveProperty("served");
    expect(res.body.byService[0]).toHaveProperty("avgWaitTime");
  });

  test("accepts startDate filter without error", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: [mockOverall] })
      .mockResolvedValueOnce({ rows: mockByService });

    const res = await request(app)
      .get("/api/reports/summary?startDate=2024-01-01")
      .set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
  });

  test("accepts endDate filter without error", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: [mockOverall] })
      .mockResolvedValueOnce({ rows: mockByService });

    const res = await request(app)
      .get("/api/reports/summary?endDate=2024-01-31")
      .set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
  });

  test("accepts serviceId filter without error", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: [mockOverall] })
      .mockResolvedValueOnce({ rows: mockByService });

    const res = await request(app)
      .get("/api/reports/summary?serviceId=1")
      .set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
  });

  test("accepts combined date range and service filters", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: [mockOverall] })
      .mockResolvedValueOnce({ rows: mockByService });

    const res = await request(app)
      .get("/api/reports/summary?startDate=2024-01-01&endDate=2024-01-31&serviceId=2")
      .set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("overall");
  });

  test("returns empty byService array when no records match", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: [{ totalEntries: "0", totalServed: "0", totalCanceled: "0", avgWaitTime: null }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/reports/summary").set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
    expect(res.body.byService).toEqual([]);
  });

  test("returns 401 when no x-user-id header", async () => {
    const res = await request(app).get("/api/reports/summary");
    expect(res.statusCode).toBe(401);
  });

  test("returns 403 for non-admin user", async () => {
    db.query.mockResolvedValueOnce({ rows: [{ role: "user" }] }); // requireAdmin

    const res = await request(app).get("/api/reports/summary").set("x-user-id", "2");
    expect(res.statusCode).toBe(403);
  });

  test("returns 500 on database error", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)                     // requireAdmin
      .mockRejectedValueOnce(new Error("DB error"));         // summary query fails

    const res = await request(app).get("/api/reports/summary").set("x-user-id", "1");

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");
  });
});

// ---------------------------------------------------------------------------
// GET /api/reports/history
// ---------------------------------------------------------------------------

describe("GET /api/reports/history", () => {
  test("returns all history records", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: mockHistoryRows });

    const res = await request(app).get("/api/reports/history").set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test("records contain expected fields", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: mockHistoryRows });

    const res = await request(app).get("/api/reports/history").set("x-user-id", "1");

    const row = res.body[0];
    expect(row).toHaveProperty("userId");
    expect(row).toHaveProperty("userName");
    expect(row).toHaveProperty("service");
    expect(row).toHaveProperty("date");
    expect(row).toHaveProperty("outcome");
    expect(row).toHaveProperty("waitTime");
  });

  test("returns empty array when no records match", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/reports/history").set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("accepts serviceId filter without error", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: [mockHistoryRows[0]] });

    const res = await request(app)
      .get("/api/reports/history?serviceId=1")
      .set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  test("accepts date range filters without error", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: mockHistoryRows });

    const res = await request(app)
      .get("/api/reports/history?startDate=2024-01-01&endDate=2024-01-31")
      .set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
  });

  test("returns 500 on database error", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).get("/api/reports/history").set("x-user-id", "1");

    expect(res.statusCode).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// GET /api/reports/export/csv
// ---------------------------------------------------------------------------

describe("GET /api/reports/export/csv", () => {
  test("responds with text/csv content type", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: mockHistoryRows });

    const res = await request(app).get("/api/reports/export/csv").set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/csv/);
  });

  test("sets Content-Disposition as attachment", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: mockHistoryRows });

    const res = await request(app).get("/api/reports/export/csv").set("x-user-id", "1");

    expect(res.headers["content-disposition"]).toMatch(/attachment/);
    expect(res.headers["content-disposition"]).toMatch(/\.csv/);
  });

  test("first line of CSV contains correct column headers", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: mockHistoryRows });

    const res = await request(app).get("/api/reports/export/csv").set("x-user-id", "1");
    const firstLine = res.text.split("\n")[0];

    expect(firstLine).toContain("Entry ID");
    expect(firstLine).toContain("User Name");
    expect(firstLine).toContain("Service");
    expect(firstLine).toContain("Outcome");
    expect(firstLine).toContain("Wait Time (min)");
  });

  test("CSV body contains a row for each history record", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: mockHistoryRows });

    const res = await request(app).get("/api/reports/export/csv").set("x-user-id", "1");
    const lines = res.text.trim().split("\n");

    // header + 2 data rows
    expect(lines.length).toBe(3);
  });

  test("data rows include correct user name and service", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: mockHistoryRows });

    const res = await request(app).get("/api/reports/export/csv").set("x-user-id", "1");
    const lines = res.text.trim().split("\n");

    expect(lines[1]).toContain("Alice");
    expect(lines[1]).toContain("Academic Advising");
  });

  test("returns only headers when no records match filters", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/reports/export/csv").set("x-user-id", "1");
    const lines = res.text.trim().split("\n");

    expect(res.statusCode).toBe(200);
    expect(lines.length).toBe(1); // only the header line
  });

  test("accepts date and service filters without error", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: [mockHistoryRows[0]] });

    const res = await request(app)
      .get("/api/reports/export/csv?startDate=2024-01-01&serviceId=1")
      .set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
  });

  test("handles null waitTime without crashing", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockResolvedValueOnce({ rows: [mockHistoryRows[1]] }); // Bob, waitTime: null

    const res = await request(app).get("/api/reports/export/csv").set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
    const lines = res.text.trim().split("\n");
    expect(lines.length).toBe(2);
  });

  test("returns 401 when no x-user-id header", async () => {
    const res = await request(app).get("/api/reports/export/csv");
    expect(res.statusCode).toBe(401);
  });

  test("returns 500 on database error", async () => {
    db.query
      .mockResolvedValueOnce(ADMIN_MOCK)
      .mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).get("/api/reports/export/csv").set("x-user-id", "1");

    expect(res.statusCode).toBe(500);
  });
});
