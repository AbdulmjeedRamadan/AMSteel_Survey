-- AMSteel Survey System Database Schema
-- PostgreSQL 14+
-- This schema implements the complete database structure for the survey system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS TABLE
-- Stores all user information including employees, admins, and developers
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(20) NOT NULL DEFAULT 'employee'
    CHECK (role IN ('developer', 'admin', 'employee')),

  -- Core Information
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  employee_id VARCHAR(50),
  department VARCHAR(100) NOT NULL,
  position VARCHAR(100),

  -- Status Flags
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,

  -- Role Change Tracking
  promoted_to_admin_at TIMESTAMP,
  promoted_by_id UUID REFERENCES users(id),
  promotion_note TEXT,
  demoted_from_admin_at TIMESTAMP,
  demoted_by_id UUID REFERENCES users(id),
  demotion_note TEXT
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- ============================================================================
-- SURVEYS TABLE
-- Stores survey information including internal and external surveys
-- ============================================================================
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Basic Information
  title VARCHAR(200) NOT NULL,
  description TEXT,
  welcome_message TEXT,
  thank_you_message TEXT,

  -- Type and Targeting
  survey_type VARCHAR(20) NOT NULL CHECK (survey_type IN ('internal', 'external')),
  client_name VARCHAR(255),
  client_company VARCHAR(255),
  target_department VARCHAR(100),

  -- Duration Management
  duration_type VARCHAR(20) NOT NULL CHECK (duration_type IN ('limited', 'unlimited')),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  duration_hours INTEGER,

  -- Status and Access
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'expired', 'paused', 'closed', 'deleted')),
  unique_slug VARCHAR(50) UNIQUE NOT NULL,

  -- Configuration
  is_anonymous BOOLEAN DEFAULT false,
  allow_multiple BOOLEAN DEFAULT false,
  requires_auth BOOLEAN DEFAULT false,
  has_password BOOLEAN DEFAULT false,
  password_hash VARCHAR(255),
  max_responses INTEGER,
  track_ip BOOLEAN DEFAULT false,
  track_location BOOLEAN DEFAULT false,
  allow_editing BOOLEAN DEFAULT false,
  show_progress_bar BOOLEAN DEFAULT true,
  redirect_url TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  closed_at TIMESTAMP,

  -- Denormalized Statistics (for performance)
  total_responses INTEGER DEFAULT 0,
  completed_responses INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,

  -- Constraints
  CONSTRAINT check_client_name_required
    CHECK ((survey_type = 'external' AND client_name IS NOT NULL) OR (survey_type = 'internal')),
  CONSTRAINT check_end_date_required
    CHECK ((duration_type = 'limited' AND end_date IS NOT NULL) OR (duration_type = 'unlimited'))
);

-- Indexes for surveys table
CREATE INDEX IF NOT EXISTS idx_surveys_admin_id ON surveys(admin_id);
CREATE INDEX IF NOT EXISTS idx_surveys_type ON surveys(survey_type);
CREATE INDEX IF NOT EXISTS idx_surveys_client_name ON surveys(client_name);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_slug ON surveys(unique_slug);
CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON surveys(created_at DESC);

-- ============================================================================
-- QUESTIONS TABLE
-- Stores all survey questions with their configuration
-- ============================================================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  question_type VARCHAR(50) NOT NULL,
  question_text TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  validation_rules JSONB,
  options JSONB,
  conditional_logic JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_survey_order UNIQUE (survey_id, order_index)
);

-- Indexes for questions table
CREATE INDEX IF NOT EXISTS idx_questions_survey_id ON questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(survey_id, order_index);

-- ============================================================================
-- SURVEY TARGET EMPLOYEES TABLE
-- Tracks which employees are targeted for internal surveys
-- ============================================================================
CREATE TABLE IF NOT EXISTS survey_target_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  has_responded BOOLEAN DEFAULT false,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_survey_employee UNIQUE (survey_id, employee_id)
);

-- Indexes for survey_target_employees table
CREATE INDEX IF NOT EXISTS idx_target_employees_survey ON survey_target_employees(survey_id);
CREATE INDEX IF NOT EXISTS idx_target_employees_employee ON survey_target_employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_target_employees_responded ON survey_target_employees(has_responded);

-- ============================================================================
-- RESPONSES TABLE
-- Stores survey response metadata and tracking information
-- ============================================================================
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Optional Client Information (for external surveys)
  respondent_name VARCHAR(255),
  respondent_email VARCHAR(255),
  respondent_phone VARCHAR(20),

  status VARCHAR(20) DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed')),

  -- Tracking Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(20),
  browser VARCHAR(50),
  os VARCHAR(50),
  location JSONB,

  -- Timing
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for responses table
CREATE INDEX IF NOT EXISTS idx_responses_survey_id ON responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_responses_employee_id ON responses(employee_id);
CREATE INDEX IF NOT EXISTS idx_responses_status ON responses(status);
CREATE INDEX IF NOT EXISTS idx_responses_completed_at ON responses(completed_at DESC);

-- ============================================================================
-- ANSWERS TABLE
-- Stores individual answers to survey questions
-- Supports multiple answer types through flexible column structure
-- ============================================================================
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,

  -- Flexible Answer Storage
  -- Only one of these should be populated based on question type
  answer_text TEXT,
  answer_number NUMERIC,
  answer_boolean BOOLEAN,
  answer_date DATE,
  answer_time TIME,
  answer_json JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_response_question UNIQUE (response_id, question_id)
);

-- Indexes for answers table
CREATE INDEX IF NOT EXISTS idx_answers_response_id ON answers(response_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);

-- ============================================================================
-- ACTIVITY LOGS TABLE
-- Tracks important user actions for audit and monitoring purposes
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for activity_logs table
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- ============================================================================
-- TRIGGERS
-- Automatically update timestamps on record changes
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- Documentation for tables and columns
-- ============================================================================

COMMENT ON TABLE users IS 'Stores all user accounts including developers, admins, and employees';
COMMENT ON TABLE surveys IS 'Stores survey definitions for both internal and external surveys';
COMMENT ON TABLE questions IS 'Stores survey questions with flexible configuration';
COMMENT ON TABLE survey_target_employees IS 'Tracks which employees are targeted for internal surveys';
COMMENT ON TABLE responses IS 'Stores survey response metadata and tracking information';
COMMENT ON TABLE answers IS 'Stores individual answers to survey questions';
COMMENT ON TABLE activity_logs IS 'Audit log for tracking important user actions';
