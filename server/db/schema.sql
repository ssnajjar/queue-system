-- QueueSmart schema - run npm run db:init to apply

-- login credentials (email, hashed password, role)
CREATE TABLE IF NOT EXISTS user_credentials (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(254) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- extra user info, linked 1:1 to user_credentials
CREATE TABLE IF NOT EXISTS user_profile (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER UNIQUE NOT NULL
               REFERENCES user_credentials(id) ON DELETE CASCADE,
  full_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(254) NOT NULL,
  phone      VARCHAR(20),
  preferences JSONB DEFAULT '{}'
);

-- services the org offers (advising, IT help, etc.)
CREATE TABLE IF NOT EXISTS service (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(100) UNIQUE NOT NULL,
  description       TEXT         NOT NULL,
  expected_duration INTEGER      NOT NULL CHECK (expected_duration > 0),
  priority_level    VARCHAR(10)  NOT NULL DEFAULT 'medium'
                      CHECK (priority_level IN ('low', 'medium', 'high')),
  created_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- each service gets one queue, can be open or closed
CREATE TABLE IF NOT EXISTS queue (
  id           SERIAL PRIMARY KEY,
  service_id   INTEGER NOT NULL
                 REFERENCES service(id) ON DELETE CASCADE,
  status       VARCHAR(10) NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open', 'closed')),
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- individual spots in a queue (one row per person waiting)
CREATE TABLE IF NOT EXISTS queue_entry (
  id                 SERIAL PRIMARY KEY,
  queue_id           INTEGER NOT NULL
                       REFERENCES queue(id) ON DELETE CASCADE,
  user_id            INTEGER NOT NULL
                       REFERENCES user_credentials(id) ON DELETE CASCADE,
  user_name          VARCHAR(100) NOT NULL,
  position           INTEGER NOT NULL CHECK (position > 0),
  join_time          TIMESTAMPTZ DEFAULT NOW(),
  status             VARCHAR(10) NOT NULL DEFAULT 'waiting'
                       CHECK (status IN ('waiting', 'served', 'canceled')),
  wait_time_minutes  INTEGER
);

-- notifications sent to users, also doubles as activity history
CREATE TABLE IF NOT EXISTS notification (
  id        SERIAL PRIMARY KEY,
  user_id   INTEGER NOT NULL
              REFERENCES user_credentials(id) ON DELETE CASCADE,
  message   TEXT        NOT NULL,
  type      VARCHAR(20) NOT NULL DEFAULT 'info',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status    VARCHAR(10) NOT NULL DEFAULT 'sent'
              CHECK (status IN ('sent', 'viewed'))
);

-- indexes on the columns we filter by most often
CREATE INDEX IF NOT EXISTS idx_queue_service_status   ON queue(service_id, status);
CREATE INDEX IF NOT EXISTS idx_entry_queue_status      ON queue_entry(queue_id, status);
CREATE INDEX IF NOT EXISTS idx_entry_user              ON queue_entry(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_user       ON notification(user_id);
