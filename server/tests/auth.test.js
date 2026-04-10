// tests/auth.test.js
jest.mock("../db", () => ({ query: jest.fn() }));
jest.mock("bcrypt");

const request = require("supertest");
const app     = require("../server");
const db      = require("../db");
const bcrypt  = require("bcrypt");

beforeEach(() => {
  jest.clearAllMocks();
  bcrypt.hash.mockResolvedValue("$2b$10$hashedpassword");
  bcrypt.compare.mockResolvedValue(true);
});

// -- register

describe("POST /api/auth/register", () => {
  test("registers a new user successfully", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })                                              // no duplicate
      .mockResolvedValueOnce({ rows: [{ id: 1, email: "test@example.com", role: "user" }] }) // insert creds
      .mockResolvedValueOnce({ rows: [] });                                             // insert profile

    const res = await request(app).post("/api/auth/register").send({
      name: "Test User", email: "test@example.com", password: "secure123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toMatchObject({ name: "Test User", email: "test@example.com", role: "user" });
    expect(res.body.user.password).toBeUndefined();
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
    db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // existing user found

    const res = await request(app).post("/api/auth/register").send({
      name: "Duplicate", email: "alice@example.com", password: "password123",
    });
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });

  test("assigns admin role when specified", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 2, email: "newadmin@queuesmart.com", role: "admin" }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post("/api/auth/register").send({
      name: "New Admin", email: "newadmin@queuesmart.com", password: "adminpass", role: "admin",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe("admin");
  });

  test("returns 500 on unexpected database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB connection lost"));

    const res = await request(app).post("/api/auth/register").send({
      name: "Error User", email: "error@example.com", password: "secure123",
    });
    expect(res.statusCode).toBe(500);
  });
});

// -- login

describe("POST /api/auth/login", () => {
  const mockUser = {
    id: 2, email: "alice@example.com", password_hash: "$2b$10$hashed",
    role: "user", name: "Alice Johnson",
  };

  test("logs in with valid credentials", async () => {
    db.query.mockResolvedValueOnce({ rows: [mockUser] });

    const res = await request(app).post("/api/auth/login").send({
      email: "alice@example.com", password: "password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toMatchObject({ name: "Alice Johnson", role: "user" });
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.password_hash).toBeUndefined();
  });

  test("logs in admin with admin credentials", async () => {
    db.query.mockResolvedValueOnce({ rows: [{ ...mockUser, role: "admin", name: "Admin User" }] });

    const res = await request(app).post("/api/auth/login").send({
      email: "admin@queuesmart.com", password: "admin123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.user.role).toBe("admin");
  });

  test("rejects wrong password", async () => {
    db.query.mockResolvedValueOnce({ rows: [mockUser] });
    bcrypt.compare.mockResolvedValueOnce(false);

    const res = await request(app).post("/api/auth/login").send({
      email: "alice@example.com", password: "wrongpassword",
    });
    expect(res.statusCode).toBe(401);
  });

  test("rejects non-existent email", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com", password: "password123",
    });
    expect(res.statusCode).toBe(401);
  });

  test("rejects missing fields", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "alice@example.com" });
    expect(res.statusCode).toBe(400);
  });

  test("returns 500 on unexpected database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).post("/api/auth/login").send({
      email: "alice@example.com", password: "password123",
    });
    expect(res.statusCode).toBe(500);
  });
});

// -- get all users

describe("GET /api/auth/users", () => {
  test("returns list of users without passwords", async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 1, name: "Admin User",   email: "admin@queuesmart.com", role: "admin" },
        { id: 2, name: "Alice Johnson", email: "alice@example.com",   role: "user"  },
      ],
    });

    const res = await request(app).get("/api/auth/users");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    res.body.forEach((u) => expect(u.password_hash).toBeUndefined());
  });

  test("returns 500 on database error", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).get("/api/auth/users");
    expect(res.statusCode).toBe(500);
  });
});
