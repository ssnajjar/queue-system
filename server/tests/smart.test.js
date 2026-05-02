// tests/smart.test.js
jest.mock("../db", () => ({ query: jest.fn() }));

const request = require("supertest");
const app     = require("../server");
const db      = require("../db");

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Helper: mock the standard 3-query sequence for a service with no alternative
// needed (smartEstimate < 20).
//
// Query order inside the route:
//   1. service lookup        → { id, name, duration }
//   2. waiting count         → { queue_length }
//   3. historical avg        → { hist_avg, sample_count }
//  (4. alt service query     — only when smartEstimate >= 20)
//  (5. alt historical query  — only when alt row found)
// ---------------------------------------------------------------------------

function mockNoHistory({ serviceId = 1, duration = 10, queueLength = 1 } = {}) {
  db.query
    .mockResolvedValueOnce({ rows: [{ id: serviceId, name: "Test Service", duration }] })
    .mockResolvedValueOnce({ rows: [{ queue_length: String(queueLength) }] })
    .mockResolvedValueOnce({ rows: [{ hist_avg: null, sample_count: "0" }] });
}

function mockWithHistory({ serviceId = 1, duration = 30, queueLength = 1, histAvg = 20, samples = 5 } = {}) {
  db.query
    .mockResolvedValueOnce({ rows: [{ id: serviceId, name: "Test Service", duration }] })
    .mockResolvedValueOnce({ rows: [{ queue_length: String(queueLength) }] })
    .mockResolvedValueOnce({ rows: [{ hist_avg: String(histAvg), sample_count: String(samples) }] });
}

// ---------------------------------------------------------------------------
// GET /api/smart/estimate/:serviceId
// ---------------------------------------------------------------------------

describe("GET /api/smart/estimate/:serviceId", () => {

  // --- input validation ---

  test("returns 400 for a non-numeric service ID", async () => {
    const res = await request(app).get("/api/smart/estimate/abc");
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("returns 404 when service does not exist", async () => {
    db.query.mockResolvedValueOnce({ rows: [] }); // service lookup returns nothing

    const res = await request(app).get("/api/smart/estimate/999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  // --- response structure ---

  test("response contains all expected top-level fields", async () => {
    mockNoHistory();

    const res = await request(app).get("/api/smart/estimate/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("serviceId");
    expect(res.body).toHaveProperty("queueLength");
    expect(res.body).toHaveProperty("staticEstimate");
    expect(res.body).toHaveProperty("smartEstimate");
    expect(res.body).toHaveProperty("hasHistory");
    expect(res.body).toHaveProperty("sampleCount");
    expect(res.body).toHaveProperty("histAvgPerPerson");
    expect(res.body).toHaveProperty("alternative");
  });

  // --- static fallback (no history) ---

  test("falls back to static estimate when sample count is zero", async () => {
    // duration=10, queue=1 → static=10, smart=10 (< 20, no alt query)
    mockNoHistory({ duration: 10, queueLength: 1 });

    const res = await request(app).get("/api/smart/estimate/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.hasHistory).toBe(false);
    expect(res.body.smartEstimate).toBe(10);   // 1 × 10
    expect(res.body.staticEstimate).toBe(10);
    expect(res.body.histAvgPerPerson).toBeNull();
  });

  test("falls back to static estimate when sample count is below minimum (< 3)", async () => {
    // 2 samples — below MIN_SAMPLES threshold
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 1, name: "Test", duration: 15 }] })
      .mockResolvedValueOnce({ rows: [{ queue_length: "1" }] })
      .mockResolvedValueOnce({ rows: [{ hist_avg: "12.0", sample_count: "2" }] });

    const res = await request(app).get("/api/smart/estimate/1");

    expect(res.body.hasHistory).toBe(false);
    expect(res.body.smartEstimate).toBe(res.body.staticEstimate);
  });

  test("returns zero smartEstimate when queue is empty and no history", async () => {
    mockNoHistory({ duration: 30, queueLength: 0 });

    const res = await request(app).get("/api/smart/estimate/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.smartEstimate).toBe(0);
    expect(res.body.queueLength).toBe(0);
  });

  // --- blended estimate (history available) ---

  test("uses blended estimate when enough history exists", async () => {
    // duration=30, queue=1, histAvg=20, samples=5
    // static  = 1 × 30 = 30
    // blended = round(0.7 × (1×20) + 0.3 × 30) = round(14 + 9) = 23
    mockWithHistory({ duration: 30, queueLength: 1, histAvg: 20, samples: 5 });

    // Also need alt query mocks (smartEstimate=23 >= 20)
    db.query
      .mockResolvedValueOnce({ rows: [] }); // no alternatives available

    const res = await request(app).get("/api/smart/estimate/1");

    expect(res.body.hasHistory).toBe(true);
    expect(res.body.sampleCount).toBe(5);
    expect(res.body.smartEstimate).toBe(23);
    expect(res.body.staticEstimate).toBe(30);
    expect(res.body.histAvgPerPerson).toBe(20);
  });

  test("smart estimate differs from static estimate when history data differs from configured duration", async () => {
    // histAvg=10 vs duration=30 — estimates should diverge
    mockWithHistory({ duration: 30, queueLength: 2, histAvg: 10, samples: 8 });
    db.query.mockResolvedValueOnce({ rows: [] }); // no alt

    const res = await request(app).get("/api/smart/estimate/1");

    // static = 2×30 = 60,  blended = round(0.7×(2×10) + 0.3×60) = round(14+18) = 32
    expect(res.body.smartEstimate).not.toBe(res.body.staticEstimate);
    expect(res.body.smartEstimate).toBe(32);
  });

  // --- alternative service logic ---

  test("alternative is null when smartEstimate is below threshold", async () => {
    // duration=5, queue=1 → static=5, smart=5 — no alt query should fire
    mockNoHistory({ duration: 5, queueLength: 1 });

    const res = await request(app).get("/api/smart/estimate/1");

    expect(res.body.alternative).toBeNull();
    // db.query should have been called exactly 3 times (service, waiting, hist)
    expect(db.query).toHaveBeenCalledTimes(3);
  });

  test("alternative is null when no other open service exists", async () => {
    mockWithHistory({ duration: 30, queueLength: 1, histAvg: 20, samples: 5 });
    db.query.mockResolvedValueOnce({ rows: [] }); // alt query returns empty

    const res = await request(app).get("/api/smart/estimate/1");

    expect(res.body.alternative).toBeNull();
  });

  test("returns alternative when a shorter-wait open service exists", async () => {
    // Primary: smart estimate = 23 (>= 20 threshold)
    mockWithHistory({ duration: 30, queueLength: 1, histAvg: 20, samples: 5 });

    // Alt service row
    db.query.mockResolvedValueOnce({
      rows: [{
        id: 2, name: "IT Help Desk", description: "Tech support",
        priority: "low", duration: 15, queue_length: 0, queue_status: "open",
      }],
    });

    // Alt historical avg — fewer than MIN_SAMPLES, falls back to static
    db.query.mockResolvedValueOnce({ rows: [{ hist_avg: null, sample_count: "0" }] });

    const res = await request(app).get("/api/smart/estimate/1");

    expect(res.body.alternative).not.toBeNull();
    expect(res.body.alternative.id).toBe(2);
    expect(res.body.alternative.name).toBe("IT Help Desk");
    expect(res.body.alternative.queueLength).toBe(0);
    expect(res.body.alternative.smartEstimate).toBe(0); // 0 × 15 = 0
  });

  test("alternative includes smartEstimate calculated from its own history", async () => {
    // Primary smart estimate = 23
    mockWithHistory({ duration: 30, queueLength: 1, histAvg: 20, samples: 5 });

    // Alt service: 1 person waiting, duration 20
    db.query.mockResolvedValueOnce({
      rows: [{
        id: 2, name: "Registrar", description: "Registration help",
        priority: "medium", duration: 20, queue_length: 1, queue_status: "open",
      }],
    });

    // Alt has its own history: avg=8 min, 4 samples
    // altStatic = 1×20 = 20
    // altSmart  = round(0.7×(1×8) + 0.3×20) = round(5.6+6) = 12
    db.query.mockResolvedValueOnce({ rows: [{ hist_avg: "8.0", sample_count: "4" }] });

    const res = await request(app).get("/api/smart/estimate/1");

    expect(res.body.alternative).not.toBeNull();
    expect(res.body.alternative.smartEstimate).toBe(12);
  });

  test("does not return alternative when alt wait is not shorter than primary", async () => {
    // Primary smart estimate = 23
    mockWithHistory({ duration: 30, queueLength: 1, histAvg: 20, samples: 5 });

    // Alt service: 2 people waiting, duration 30 → altStatic = 60, altSmart = 60 (no hist)
    db.query.mockResolvedValueOnce({
      rows: [{
        id: 2, name: "Financial Aid", description: "Aid office",
        priority: "high", duration: 30, queue_length: 2, queue_status: "open",
      }],
    });
    db.query.mockResolvedValueOnce({ rows: [{ hist_avg: null, sample_count: "0" }] });

    const res = await request(app).get("/api/smart/estimate/1");

    // 60 is NOT less than 23 → no alternative
    expect(res.body.alternative).toBeNull();
  });

  // --- error handling ---

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB connection failed"));

    const res = await request(app).get("/api/smart/estimate/1");

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");
  });

  test("returns 500 when waiting-count query fails", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 1, name: "Test", duration: 30 }] })
      .mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).get("/api/smart/estimate/1");

    expect(res.statusCode).toBe(500);
  });
});
