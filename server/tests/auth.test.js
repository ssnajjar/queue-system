// tests/auth.test.js
const request = require("supertest");
const app     = require("../server");
const store   = require("../data/store");

beforeEach(() => {
  store.users = [
    { id: 1, name: "Admin User",   email: "admin@queuesmart.com", password: "admin123",   role: "admin" },
    { id: 2, name: "Alice Johnson",email: "alice@example.com",    password: "password123", role: "user"  },
  ];
  store._nextUserId = 3;
});

describe("POST /api/auth/register", () => {
  test("registers a new user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User", email: "test@example.com", password: "secure123",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toMatchObject({ name: "Test User", email: "test@example.com", role: "user" });
    expect(res.body.user.password).toBeUndefined(); // password must not be returned
  });

  test("rejects registration with missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "No Email" });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/missing/i);
  });

  test("rejects registration with invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Bad Email", email: "not-an-email", password: "secure123",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  test("rejects registration with short password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Short Pass", email: "short@example.com", password: "abc",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/password/i);
  });

  test("rejects duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Duplicate", email: "alice@example.com", password: "password123",
    });
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });

  test("assigns admin role when specified", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "New Admin", email: "newadmin@queuesmart.com", password: "adminpass", role: "admin",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe("admin");
  });
});

describe("POST /api/auth/login", () => {
  test("logs in with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "alice@example.com", password: "password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toMatchObject({ name: "Alice Johnson", role: "user" });
    expect(res.body.user.password).toBeUndefined();
  });

  test("logs in admin with admin credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@queuesmart.com", password: "admin123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.user.role).toBe("admin");
  });

  test("rejects wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "alice@example.com", password: "wrongpassword",
    });
    expect(res.statusCode).toBe(401);
  });

  test("rejects non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com", password: "password123",
    });
    expect(res.statusCode).toBe(401);
  });

  test("rejects missing fields", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "alice@example.com" });
    expect(res.statusCode).toBe(400);
  });
});