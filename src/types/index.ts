// User Types
export type UserRole = 'developer' | 'admin' | 'employee'

export interface User {
  id: string
  role: UserRole
  full_name: string
  email: string
  phone?: string
  employee_id?: string
  department: string
  position?: string
  bio?: string
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
  last_login_at?: string
  promoted_to_admin_at?: string
  promoted_by_id?: string
  promotion_note?: string
  demoted_from_admin_at?: string
  demoted_by_id?: string
  demotion_note?: string
}

// Survey Types
export type SurveyType = 'internal' | 'external'
export type SurveyStatus = 'draft' | 'active' | 'expired' | 'paused' | 'closed' | 'deleted'
export type DurationType = 'limited' | 'unlimited'

export interface Survey {
  id: string
  admin_id: string
  title: string
  description?: string
  welcome_message?: string
  thank_you_message?: string
  survey_type: SurveyType
  client_name?: string
  client_company?: string
  target_department?: string
  duration_type: DurationType
  start_date?: string
  end_date?: string
  duration_hours?: number
  status: SurveyStatus
  unique_slug: string
  is_anonymous: boolean
  allow_multiple: boolean
  requires_auth: boolean
  max_responses?: number
  track_ip: boolean
  track_location: boolean
  allow_editing: boolean
  show_progress_bar: boolean
  redirect_url?: string
  created_at: string
  updated_at: string
  published_at?: string
  closed_at?: string
  total_responses: number
  completed_responses: number
  total_views: number
}

// Question Types
export type QuestionType = 
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'time'
  | 'single_choice'
  | 'multiple_choice'
  | 'rating'
  | 'rating_scale'
  | 'yes_no'
  | 'file_upload'
  | 'dropdown'
  | 'matrix'
  | 'ranking'
  | 'nps'
  | 'slider'
  | 'currency'
  | 'url'

export interface Question {
  id: string
  survey_id: string
  question_type: QuestionType
  question_text: string
  description?: string
  is_required: boolean
  order_index: number
  validation_rules?: Record<string, any>
  options?: Record<string, any>
  conditional_logic?: Record<string, any>
  created_at: string
  updated_at: string
}

// Response Types
export type ResponseStatus = 'in_progress' | 'completed'

export interface Response {
  id: string
  survey_id: string
  employee_id?: string
  respondent_name?: string
  respondent_email?: string
  respondent_phone?: string
  status: ResponseStatus
  ip_address?: string
  user_agent?: string
  device_type?: string
  browser?: string
  os?: string
  location?: Record<string, any>
  started_at: string
  completed_at?: string
  duration_seconds?: number
  created_at: string
  updated_at: string
}

export interface Answer {
  id: string
  response_id: string
  question_id: string
  answer_text?: string
  answer_number?: number
  answer_boolean?: boolean
  answer_date?: string
  answer_time?: string
  answer_json?: Record<string, any>
  created_at: string
  updated_at: string
}

// Activity Log Types
export interface ActivityLog {
  id: string
  user_id?: string
  action: string
  entity_type?: string
  entity_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  full_name: string
  email: string
  password: string
  confirm_password: string
  phone?: string
  department: string
  position?: string
  terms_accepted: boolean
}

export interface SurveyForm {
  title: string
  description?: string
  survey_type: SurveyType
  client_name?: string
  client_company?: string
  target_department?: string
  duration_type: DurationType
  start_date?: string
  end_date?: string
  duration_hours?: number
  is_anonymous: boolean
  allow_multiple: boolean
  requires_auth: boolean
  max_responses?: number
  track_ip: boolean
  track_location: boolean
  allow_editing: boolean
  show_progress_bar: boolean
  redirect_url?: string
}

// Dashboard Types
export interface DashboardStats {
  total_employees: number
  total_admins: number
  total_surveys: number
  total_responses: number
  active_surveys: number
  completed_surveys: number
  new_employees_this_week: number
  new_employees_today: number
}

export interface ClientProgress {
  client_name: string
  total_surveys: number
  average_rating: number
  improvement_percentage: number
  last_survey_date: string
}

// Export Types
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  surveys: string[]
  date_range?: {
    start: string
    end: string
  }
  include_metadata: boolean
}
