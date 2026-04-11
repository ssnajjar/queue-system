# QueueSmart

A smart queue management application built for our Software Design class.

**Group Members:** Saleem Najjar, Jason Beltran, Ruel Cabading

---

## What it does

QueueSmart lets users join virtual queues for services (academic advising, financial aid, IT help, etc.) and track their position in real time. Admins can manage services, monitor queues, and serve users.

---

## Tech Stack

- **Frontend:** React 19 + Vite
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (hosted on Neon)
- **Testing:** Jest + Supertest

---

## Getting Started

### Prerequisites
- Node.js installed
- The `DATABASE_URL` connection string (ask a teammate for this — it goes in a `.env` file that is not committed to the repo)

### 1. Clone the repo
```bash
git clone <repo-url>
cd queue-system
```

### 2. Set up the backend
```bash
cd server
npm install
```

Create a file called `.env` inside the `server/` folder:
```
DATABASE_URL=your_connection_string_here
NODE_ENV=development
```

> The database is already set up and shared — do not run `db:init` again or it will try to re-seed.

### 3. Set up the frontend
```bash
cd ../client
npm install
```

### 4. Run the app

You need two terminals open at the same time:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
Runs on `http://localhost:3000`

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
Opens on `http://localhost:5173`

---

## Demo Credentials

| Email | Password | Role |
|---|---|---|
| admin@queuesmart.com | admin123 | Admin |
| alice@example.com | password123 | User |
| bob@example.com | pass456 | User |

---

## Running Tests

```bash
cd server
npm test
```

Coverage report is generated automatically in `server/coverage/`.

---

## Project Structure

```
queue-system/
├── client/          # React frontend
│   └── src/
│       ├── screens/ # page components (user + admin)
│       ├── components/
│       └── api.js   # all backend calls go through here
└── server/          # Express backend
    ├── routes/      # API endpoints
    ├── middleware/  # validation
    ├── db/          # schema, seed, db connection
    └── tests/       # Jest test suite
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/services` | List all services |
| POST | `/api/services` | Create a service (admin) |
| PUT | `/api/services/:id` | Update a service (admin) |
| DELETE | `/api/services/:id` | Delete a service (admin) |
| GET | `/api/queue/:serviceId` | Get queue for a service |
| POST | `/api/queue/:serviceId/join` | Join a queue |
| DELETE | `/api/queue/:serviceId/leave` | Leave a queue |
| POST | `/api/queue/:serviceId/serve` | Serve next user (admin) |
| PUT | `/api/queue/:serviceId/status` | Open or close a queue (admin) |
| GET | `/api/history/:userId` | Get queue history for a user |
| GET | `/api/notifications/:userId` | Get notifications for a user |
