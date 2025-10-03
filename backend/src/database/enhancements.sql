-- AMSteel Survey System - Database Enhancements
-- Additional features and optimizations for the survey system

-- ============================================================================
-- SURVEY TEMPLATES TABLE
-- Stores reusable survey templates for quick survey creation
-- ============================================================================
CREATE TABLE IF NOT EXISTS survey_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 0,
  template_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_survey_templates_created_by ON survey_templates(created_by_id);
CREATE INDEX IF NOT EXISTS idx_survey_templates_category ON survey_templates(category);
CREATE INDEX IF NOT EXISTS idx_survey_templates_is_public ON survey_templates(is_public);

-- ============================================================================
-- SURVEY NOTIFICATIONS TABLE
-- Tracks notification/reminder sending for survey invitations
-- ============================================================================
CREATE TABLE IF NOT EXISTS survey_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('invitation', 'reminder', 'thank_you', 'follow_up')),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_survey_notifications_survey ON survey_notifications(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_notifications_employee ON survey_notifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_survey_notifications_status ON survey_notifications(status);
CREATE INDEX IF NOT EXISTS idx_survey_notifications_sent_at ON survey_notifications(sent_at DESC);

-- ============================================================================
-- SURVEY ANALYTICS TABLE
-- Stores pre-calculated analytics for faster dashboard performance
-- ============================================================================
CREATE TABLE IF NOT EXISTS survey_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  calculation_date DATE NOT NULL,
  total_responses INTEGER DEFAULT 0,
  completed_responses INTEGER DEFAULT 0,
  in_progress_responses INTEGER DEFAULT 0,
  average_completion_time_seconds INTEGER,
  response_rate_percentage DECIMAL(5,2),
  satisfaction_score DECIMAL(5,2),
  nps_score DECIMAL(5,2),
  device_breakdown JSONB,
  location_breakdown JSONB,
  time_breakdown JSONB,
  question_statistics JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_survey_date UNIQUE (survey_id, calculation_date)
);

CREATE INDEX IF NOT EXISTS idx_survey_analytics_survey ON survey_analytics(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_analytics_date ON survey_analytics(calculation_date DESC);

-- ============================================================================
-- SURVEY COMMENTS TABLE
-- Allows admins and managers to add internal comments on surveys
-- ============================================================================
CREATE TABLE IF NOT EXISTS survey_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  parent_comment_id UUID REFERENCES survey_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_survey_comments_survey ON survey_comments(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_comments_user ON survey_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_comments_parent ON survey_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_survey_comments_created ON survey_comments(created_at DESC);

-- ============================================================================
-- QUESTION RESPONSE STATISTICS TABLE
-- Stores aggregated statistics per question for quick analysis
-- ============================================================================
CREATE TABLE IF NOT EXISTS question_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  total_answers INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  answer_distribution JSONB,
  average_value DECIMAL(10,2),
  median_value DECIMAL(10,2),
  mode_value TEXT,
  min_value DECIMAL(10,2),
  max_value DECIMAL(10,2),
  standard_deviation DECIMAL(10,2),
  last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_question_stats UNIQUE (question_id)
);

CREATE INDEX IF NOT EXISTS idx_question_statistics_question ON question_statistics(question_id);

-- ============================================================================
-- SURVEY SHARING TABLE
-- Tracks survey sharing and external access links
-- ============================================================================
CREATE TABLE IF NOT EXISTS survey_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  shared_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  share_token VARCHAR(100) UNIQUE NOT NULL,
  share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('public', 'restricted', 'password', 'email')),
  access_password_hash VARCHAR(255),
  allowed_emails TEXT[],
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_survey_shares_survey ON survey_shares(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_shares_token ON survey_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_survey_shares_active ON survey_shares(is_active);

-- ============================================================================
-- RESPONSE ATTACHMENTS TABLE
-- Stores file attachments uploaded as part of survey responses
-- ============================================================================
CREATE TABLE IF NOT EXISTS response_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100),
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_response_attachments_answer ON response_attachments(answer_id);

-- ============================================================================
-- SURVEY TAGS TABLE
-- Allows categorization and organization of surveys with tags
-- ============================================================================
CREATE TABLE IF NOT EXISTS survey_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  tag_name VARCHAR(50) NOT NULL,
  created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_survey_tag UNIQUE (survey_id, tag_name)
);

CREATE INDEX IF NOT EXISTS idx_survey_tags_survey ON survey_tags(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_tags_name ON survey_tags(tag_name);

-- ============================================================================
-- RESPONSE QUALITY SCORES TABLE
-- Tracks response quality metrics to identify low-quality or suspicious responses
-- ============================================================================
CREATE TABLE IF NOT EXISTS response_quality_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  completion_time_score DECIMAL(3,2),
  answer_consistency_score DECIMAL(3,2),
  straightlining_score DECIMAL(3,2),
  text_quality_score DECIMAL(3,2),
  overall_quality_score DECIMAL(3,2),
  is_suspicious BOOLEAN DEFAULT false,
  flags JSONB,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_response_quality UNIQUE (response_id)
);

CREATE INDEX IF NOT EXISTS idx_response_quality_response ON response_quality_scores(response_id);
CREATE INDEX IF NOT EXISTS idx_response_quality_suspicious ON response_quality_scores(is_suspicious);

-- ============================================================================
-- SURVEY VERSIONS TABLE
-- Tracks survey version history for auditing and rollback
-- ============================================================================
CREATE TABLE IF NOT EXISTS survey_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  changed_by_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  change_summary TEXT,
  survey_data JSONB NOT NULL,
  questions_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_survey_version UNIQUE (survey_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_survey_versions_survey ON survey_versions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_versions_created ON survey_versions(created_at DESC);

-- ============================================================================
-- SCHEDULED REPORTS TABLE
-- Stores scheduled report configurations for automated report generation
-- ============================================================================
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_name VARCHAR(200) NOT NULL,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('summary', 'detailed', 'analytics', 'responses', 'custom')),
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  recipients TEXT[] NOT NULL,
  format VARCHAR(20) NOT NULL CHECK (format IN ('pdf', 'excel', 'csv', 'html')),
  filters JSONB,
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP,
  next_scheduled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_survey ON scheduled_reports(survey_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_scheduled ON scheduled_reports(next_scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_active ON scheduled_reports(is_active);

-- ============================================================================
-- TRIGGERS FOR ENHANCEMENTS
-- ============================================================================

-- Update updated_at trigger for new tables
CREATE TRIGGER update_survey_templates_updated_at BEFORE UPDATE ON survey_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_comments_updated_at BEFORE UPDATE ON survey_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Update Survey Response Counts
-- Automatically updates denormalized response counts when responses are added
-- ============================================================================
CREATE OR REPLACE FUNCTION update_survey_response_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE surveys
    SET total_responses = total_responses + 1,
        completed_responses = completed_responses + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END
    WHERE id = NEW.survey_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status AND NEW.status = 'completed' THEN
      UPDATE surveys
      SET completed_responses = completed_responses + 1
      WHERE id = NEW.survey_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE surveys
    SET total_responses = total_responses - 1,
        completed_responses = completed_responses - CASE WHEN OLD.status = 'completed' THEN 1 ELSE 0 END
    WHERE id = OLD.survey_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_response_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON responses
FOR EACH ROW EXECUTE FUNCTION update_survey_response_counts();

-- ============================================================================
-- FUNCTION: Update Target Employee Response Status
-- Marks employee as responded when they complete a survey
-- ============================================================================
CREATE OR REPLACE FUNCTION update_target_employee_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.employee_id IS NOT NULL THEN
    UPDATE survey_target_employees
    SET has_responded = true,
        responded_at = NEW.completed_at
    WHERE survey_id = NEW.survey_id
      AND employee_id = NEW.employee_id
      AND has_responded = false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_target_employee_trigger
AFTER UPDATE ON responses
FOR EACH ROW EXECUTE FUNCTION update_target_employee_status();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Survey Summary with Response Rates
CREATE OR REPLACE VIEW survey_summary AS
SELECT
  s.id,
  s.title,
  s.survey_type,
  s.status,
  s.admin_id,
  u.full_name as admin_name,
  s.created_at,
  s.start_date,
  s.end_date,
  s.total_responses,
  s.completed_responses,
  CASE
    WHEN s.survey_type = 'internal' THEN (
      SELECT COUNT(*) FROM survey_target_employees WHERE survey_id = s.id
    )
    ELSE NULL
  END as target_count,
  CASE
    WHEN s.survey_type = 'internal' THEN
      ROUND(
        (s.completed_responses::DECIMAL / NULLIF((SELECT COUNT(*) FROM survey_target_employees WHERE survey_id = s.id), 0)) * 100,
        2
      )
    ELSE NULL
  END as response_rate_percentage,
  (SELECT COUNT(*) FROM questions WHERE survey_id = s.id) as question_count
FROM surveys s
JOIN users u ON s.admin_id = u.id
WHERE s.status != 'deleted';

-- View: Employee Survey Assignments
CREATE OR REPLACE VIEW employee_survey_assignments AS
SELECT
  ste.id,
  ste.survey_id,
  s.title as survey_title,
  s.description as survey_description,
  s.end_date,
  ste.employee_id,
  u.full_name as employee_name,
  u.email as employee_email,
  u.department,
  ste.has_responded,
  ste.responded_at,
  ste.created_at as assigned_at,
  CASE
    WHEN ste.has_responded THEN 'completed'
    WHEN s.end_date < CURRENT_TIMESTAMP THEN 'expired'
    ELSE 'pending'
  END as assignment_status
FROM survey_target_employees ste
JOIN surveys s ON ste.survey_id = s.id
JOIN users u ON ste.employee_id = u.id
WHERE s.status = 'active';

-- View: Real-time Survey Analytics
CREATE OR REPLACE VIEW survey_realtime_analytics AS
SELECT
  s.id as survey_id,
  s.title,
  s.survey_type,
  s.status,
  COUNT(DISTINCT r.id) as total_responses,
  COUNT(DISTINCT CASE WHEN r.status = 'completed' THEN r.id END) as completed_responses,
  COUNT(DISTINCT CASE WHEN r.status = 'in_progress' THEN r.id END) as in_progress_responses,
  AVG(CASE WHEN r.status = 'completed' THEN r.duration_seconds END) as avg_completion_time,
  COUNT(DISTINCT a.id) as total_answers,
  COUNT(DISTINCT CASE WHEN r.device_type = 'mobile' THEN r.id END) as mobile_responses,
  COUNT(DISTINCT CASE WHEN r.device_type = 'desktop' THEN r.id END) as desktop_responses,
  COUNT(DISTINCT CASE WHEN r.device_type = 'tablet' THEN r.id END) as tablet_responses,
  MIN(r.created_at) as first_response_at,
  MAX(r.completed_at) as last_response_at
FROM surveys s
LEFT JOIN responses r ON s.id = r.survey_id
LEFT JOIN answers a ON r.id = a.response_id
WHERE s.status IN ('active', 'closed')
GROUP BY s.id, s.title, s.survey_type, s.status;

-- ============================================================================
-- COMMENTS FOR NEW TABLES
-- ============================================================================

COMMENT ON TABLE survey_templates IS 'Reusable survey templates for quick survey creation';
COMMENT ON TABLE survey_notifications IS 'Tracks notification/reminder sending for survey invitations';
COMMENT ON TABLE survey_analytics IS 'Pre-calculated analytics for faster dashboard performance';
COMMENT ON TABLE survey_comments IS 'Internal comments on surveys for team collaboration';
COMMENT ON TABLE question_statistics IS 'Aggregated statistics per question for quick analysis';
COMMENT ON TABLE survey_shares IS 'Survey sharing and external access link management';
COMMENT ON TABLE response_attachments IS 'File attachments uploaded as part of survey responses';
COMMENT ON TABLE survey_tags IS 'Categorization and organization of surveys with tags';
COMMENT ON TABLE response_quality_scores IS 'Response quality metrics to identify low-quality responses';
COMMENT ON TABLE survey_versions IS 'Survey version history for auditing and rollback';
COMMENT ON TABLE scheduled_reports IS 'Automated report generation configurations';
