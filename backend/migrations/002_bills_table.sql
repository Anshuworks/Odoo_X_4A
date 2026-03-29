-- Bills table for 2-stage approval workflow (Admin → Manager)
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Two-stage approval statuses
  admin_status VARCHAR(20) DEFAULT 'pending' CHECK (admin_status IN ('pending','approved','rejected')),
  manager_status VARCHAR(20) DEFAULT 'pending' CHECK (manager_status IN ('pending','approved','rejected')),

  -- Workflow stage tracking
  current_stage VARCHAR(30) DEFAULT 'admin_review' CHECK (current_stage IN ('submitted','admin_review','manager_review','completed')),

  -- Comments from approvers
  admin_comment TEXT,
  manager_comment TEXT,

  -- Timestamps for each stage
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  admin_reviewed_at TIMESTAMPTZ,
  manager_reviewed_at TIMESTAMPTZ,

  -- Who reviewed
  admin_reviewer_id UUID REFERENCES users(id),
  manager_reviewer_id UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries by stage
CREATE INDEX IF NOT EXISTS idx_bills_current_stage ON bills(current_stage);
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
