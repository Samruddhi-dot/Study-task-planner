-- =============================================
-- STUDY PLANNER DATABASE SETUP (FIXED)
-- =============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email index
CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

-- =============================================
-- TASKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  subject VARCHAR(255),
  deadline DATE,
  priority VARCHAR(10) DEFAULT 'Medium'
    CHECK (priority IN ('High', 'Medium', 'Low')),
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FIX EXISTING TABLE (if column missing)
-- =============================================
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'Medium';

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_id
ON tasks(user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_deadline
ON tasks(deadline);

CREATE INDEX IF NOT EXISTS idx_tasks_completed
ON tasks(completed);

CREATE INDEX IF NOT EXISTS idx_tasks_priority
ON tasks(priority);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- VERIFY TABLE STRUCTURE
-- =============================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tasks';
