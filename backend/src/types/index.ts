/**
 * Type definitions for AMSteel Survey System
 * All TypeScript interfaces and types used throughout the application
 */

import { Request } from 'express';

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = 'developer' | 'admin' | 'employee';

export interface User {
  id: string;
  role: UserRole;

  // Core Information
  full_name: string;
  email: string;
  password_hash: string;
  phone?: string;
  employee_id?: string;
  department: string;
  position?: string;

  // Status Flags
  is_active: boolean;
  email_verified: boolean;

  // Timestamps
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;

  // Role Change Tracking
  promoted_to_admin_at?: Date;
  promoted_by_id?: string;
  promotion_note?: string;
  demoted_from_admin_at?: Date;
  demoted_by_id?: string;
  demotion_note?: string;
}

export interface UserSafeInfo {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string;
  employee_id?: string;
  department: string;
  position?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  last_login_at?: Date;
}

export interface CreateUserDto {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  employee_id?: string;
  department: string;
  position?: string;
}

export interface UpdateUserDto {
  full_name?: string;
  phone?: string;
  employee_id?: string;
  department?: string;
  position?: string;
}

// ============================================================================
// SURVEY TYPES
// ============================================================================

export type SurveyType = 'internal' | 'external';
export type DurationType = 'limited' | 'unlimited';
export type SurveyStatus = 'draft' | 'active' | 'expired' | 'paused' | 'closed' | 'deleted';

export interface Survey {
  id: string;
  admin_id: string;

  // Basic Information
  title: string;
  description?: string;
  welcome_message?: string;
  thank_you_message?: string;

  // Type and Targeting
  survey_type: SurveyType;
  client_name?: string;
  client_company?: string;
  target_department?: string;

  // Duration Management
  duration_type: DurationType;
  start_date?: Date;
  end_date?: Date;
  duration_hours?: number;

  // Status and Access
  status: SurveyStatus;
  unique_slug: string;

  // Configuration
  is_anonymous: boolean;
  allow_multiple: boolean;
  requires_auth: boolean;
  has_password: boolean;
  password_hash?: string;
  max_responses?: number;
  track_ip: boolean;
  track_location: boolean;
  allow_editing: boolean;
  show_progress_bar: boolean;
  redirect_url?: string;

  // Timestamps
  created_at: Date;
  updated_at: Date;
  published_at?: Date;
  closed_at?: Date;

  // Statistics
  total_responses: number;
  completed_responses: number;
  total_views: number;
}

export interface CreateSurveyDto {
  title: string;
  description?: string;
  welcome_message?: string;
  thank_you_message?: string;
  survey_type: SurveyType;
  client_name?: string;
  client_company?: string;
  target_department?: string;
  duration_type: DurationType;
  start_date?: Date;
  end_date?: Date;
  duration_hours?: number;
  is_anonymous?: boolean;
  allow_multiple?: boolean;
  requires_auth?: boolean;
  has_password?: boolean;
  password?: string;
  max_responses?: number;
  track_ip?: boolean;
  track_location?: boolean;
  allow_editing?: boolean;
  show_progress_bar?: boolean;
  redirect_url?: string;
  target_employee_ids?: string[];
}

export interface UpdateSurveyDto {
  title?: string;
  description?: string;
  welcome_message?: string;
  thank_you_message?: string;
  client_company?: string;
  target_department?: string;
  duration_type?: DurationType;
  start_date?: Date;
  end_date?: Date;
  duration_hours?: number;
  is_anonymous?: boolean;
  allow_multiple?: boolean;
  max_responses?: number;
  allow_editing?: boolean;
  show_progress_bar?: boolean;
  redirect_url?: string;
}

// ============================================================================
// QUESTION TYPES
// ============================================================================

export interface Question {
  id: string;
  survey_id: string;
  question_type: string;
  question_text: string;
  description?: string;
  is_required: boolean;
  order_index: number;
  validation_rules?: Record<string, any>;
  options?: Record<string, any>;
  conditional_logic?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface CreateQuestionDto {
  question_type: string;
  question_text: string;
  description?: string;
  is_required?: boolean;
  order_index: number;
  validation_rules?: Record<string, any>;
  options?: Record<string, any>;
  conditional_logic?: Record<string, any>;
}

export interface UpdateQuestionDto {
  question_type?: string;
  question_text?: string;
  description?: string;
  is_required?: boolean;
  validation_rules?: Record<string, any>;
  options?: Record<string, any>;
  conditional_logic?: Record<string, any>;
}

export interface ReorderQuestionsDto {
  question_orders: Array<{
    question_id: string;
    order_index: number;
  }>;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type ResponseStatus = 'in_progress' | 'completed';

export interface Response {
  id: string;
  survey_id: string;
  employee_id?: string;

  // Optional Client Information
  respondent_name?: string;
  respondent_email?: string;
  respondent_phone?: string;

  status: ResponseStatus;

  // Tracking Metadata
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  location?: Record<string, any>;

  // Timing
  started_at: Date;
  completed_at?: Date;
  duration_seconds?: number;

  created_at: Date;
  updated_at: Date;
}

export interface CreateResponseDto {
  survey_id: string;
  respondent_name?: string;
  respondent_email?: string;
  respondent_phone?: string;
  answers: CreateAnswerDto[];
}

export interface UpdateResponseDto {
  answers: CreateAnswerDto[];
}

// ============================================================================
// ANSWER TYPES
// ============================================================================

export interface Answer {
  id: string;
  response_id: string;
  question_id: string;
  answer_text?: string;
  answer_number?: number;
  answer_boolean?: boolean;
  answer_date?: Date;
  answer_time?: string;
  answer_json?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAnswerDto {
  question_id: string;
  answer_text?: string;
  answer_number?: number;
  answer_boolean?: boolean;
  answer_date?: Date;
  answer_time?: string;
  answer_json?: Record<string, any>;
}

// ============================================================================
// SURVEY TARGET EMPLOYEES TYPES
// ============================================================================

export interface SurveyTargetEmployee {
  id: string;
  survey_id: string;
  employee_id: string;
  has_responded: boolean;
  responded_at?: Date;
  created_at: Date;
}

// ============================================================================
// ACTIVITY LOG TYPES
// ============================================================================

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface CreateActivityLogDto {
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserSafeInfo;
  token: string;
  refreshToken: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  new_password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface SurveyAnalytics {
  survey_id: string;
  total_responses: number;
  completed_responses: number;
  in_progress_responses: number;
  completion_rate: number;
  average_duration_seconds?: number;
  total_views: number;
  response_by_date: Array<{
    date: string;
    count: number;
  }>;
  question_analytics: QuestionAnalytics[];
}

export interface QuestionAnalytics {
  question_id: string;
  question_text: string;
  question_type: string;
  total_answers: number;
  choice_distribution?: Record<string, number>;
  numeric_stats?: {
    min: number;
    max: number;
    average: number;
    median: number;
  };
  text_responses?: string[];
}

export interface DashboardStats {
  total_surveys: number;
  active_surveys: number;
  total_responses: number;
  total_employees: number;
  recent_responses: number;
  surveys_by_type: {
    internal: number;
    external: number;
  };
  surveys_by_status: Record<SurveyStatus, number>;
}

export interface ClientProgress {
  client_name: string;
  surveys: Array<{
    id: string;
    title: string;
    created_at: Date;
    total_responses: number;
    average_rating?: number;
  }>;
  trend: Array<{
    period: string;
    average_rating: number;
    response_count: number;
  }>;
  improvement_percentage?: number;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportRequestDto {
  survey_ids: string[];
  format: ExportFormat;
  include_metadata?: boolean;
  date_from?: Date;
  date_to?: Date;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ============================================================================
// EXPRESS REQUEST EXTENSION
// ============================================================================

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

// ============================================================================
// QUERY FILTER TYPES
// ============================================================================

export interface SurveyFilters {
  survey_type?: SurveyType;
  status?: SurveyStatus;
  client_name?: string;
  search?: string;
  date_from?: Date;
  date_to?: Date;
}

export interface UserFilters {
  role?: UserRole;
  department?: string;
  is_active?: boolean;
  search?: string;
}

export interface ResponseFilters {
  survey_id?: string;
  status?: ResponseStatus;
  date_from?: Date;
  date_to?: Date;
}
