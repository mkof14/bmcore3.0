export interface Profile {
  id: string;
  name: string | null;
  country: string | null;
  timezone: string;
  locale: string;
  marketing_optin: boolean;
  privacy_flags: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  code: string;
  name_en: string;
  name_ru: string;
  description_en: string | null;
  description_ru: string | null;
  price_monthly: number | null;
  price_annual: number | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_annual: string | null;
  features: Record<string, unknown>;
  daily_report_cap: number;
  advanced_templates: boolean;
  export_limit: number;
  share_links: boolean;
  priority_queue: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'deleted';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  title_en: string;
  title_ru: string;
  intro_en: string | null;
  intro_ru: string | null;
  icon: string | null;
  sort_order: number;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  category_id: string;
  slug: string;
  name_en: string;
  name_ru: string;
  short_en: string | null;
  short_ru: string | null;
  long_en: string | null;
  long_ru: string | null;
  tags: string[];
  sort_order: number;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportTemplate {
  id: string;
  slug: string;
  name_en: string;
  name_ru: string;
  description_en: string | null;
  description_ru: string | null;
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  ai_recipe: Record<string, unknown>;
  version: number;
  active: boolean;
  min_plan_level: number;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  template_id: string;
  title: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error_message: string | null;
  version: number;
  tokens_used: number | null;
  processing_time_ms: number | null;
  has_second_opinion: boolean;
  ai_model_id: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface AIModel {
  id: string;
  code: string;
  name_en: string;
  name_ru: string;
  description_en: string | null;
  description_ru: string | null;
  reasoning_style: 'evidence_based' | 'contextual' | 'empathetic' | 'conservative' | 'progressive';
  provider: 'openai' | 'anthropic' | 'google' | 'custom';
  model_name: string;
  temperature: number;
  system_prompt: string;
  characteristics: Record<string, unknown>;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SecondOpinion {
  id: string;
  original_report_id: string;
  user_id: string;
  ai_model_id: string;
  title: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error_message: string | null;
  tokens_used: number | null;
  processing_time_ms: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface OpinionComparison {
  id: string;
  original_report_id: string;
  second_opinion_id: string;
  user_id: string;
  agreements: Array<Record<string, unknown>>;
  disagreements: Array<Record<string, unknown>>;
  key_differences: Array<Record<string, unknown>>;
  confidence_original: number | null;
  confidence_second: number | null;
  user_preferred: 'original' | 'second' | 'both' | 'neither' | null;
  user_notes: string | null;
  helpful_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  source: 'report' | 'chat' | 'manual';
  source_id: string | null;
  status: 'active' | 'paused' | 'completed' | 'archived';
  priority: 'high' | 'medium' | 'low';
  start_date: string;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface Habit {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'custom';
  time_anchor: 'morning' | 'afternoon' | 'evening' | 'after_meal' | 'before_sleep' | 'custom';
  specific_time: string | null;
  duration_minutes: number;
  difficulty_level: number;
  status: 'active' | 'paused' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completion_date: string;
  completed: boolean;
  note: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface DailySnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  state_summary: string;
  state_reason: string | null;
  suggestion_of_day: {
    title: string;
    description: string;
    action?: string;
  } | null;
  energy_level: 'low' | 'moderate' | 'good' | 'excellent' | null;
  recovery_status: 'recovering' | 'stable' | 'stressed' | 'excellent' | null;
  device_data_snapshot: Record<string, unknown> | null;
  second_opinion_a: string | null;
  second_opinion_b: string | null;
  created_at: string;
}

export interface SmartNudge {
  id: string;
  user_id: string;
  nudge_type: 'habit_reminder' | 'state_alert' | 'progress_celebration' | 'suggestion';
  title: string;
  message: string;
  action_text: string | null;
  action_target: string | null;
  priority: 'low' | 'medium' | 'high';
  trigger_condition: Record<string, unknown> | null;
  scheduled_for: string;
  delivered_at: string | null;
  dismissed_at: string | null;
  actioned_at: string | null;
  created_at: string;
}

export interface HealthReport {
  id: string;
  user_id: string;
  report_type: 'general' | 'thematic' | 'dynamic' | 'device_enhanced';
  topic: string | null;
  summary: string;
  insights: Array<string>;
  analysis: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
  device_data: {
    sleep?: any;
    hrv?: any;
    activity?: any;
    glucose?: any;
  } | null;
  second_opinion_a: string | null;
  second_opinion_b: string | null;
  /** Snapshot of personal context at generation time (questionnaire + profile completeness). */
  personal_context_snapshot?: Record<string, unknown> | null;
  personal_context_version?: string | null;
  metadata?: Record<string, unknown> | null;
  report_title?: string | null;
  status?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportQuestion {
  id: string;
  report_id: string;
  question: string;
  answer: string;
  order: number;
  created_at: string;
}

export interface Nudge {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  payload: Record<string, unknown>;
  priority: number;
  seen_at: string | null;
  dismissed_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface AssistantPersona {
  id: string;
  code: string;
  name_en: string;
  name_ru: string;
  description_en: string | null;
  description_ru: string | null;
  role_type: 'doctor' | 'nurse' | 'coach' | 'neutral' | 'specialist';
  tone: 'professional' | 'friendly' | 'empathetic' | 'clinical' | 'casual';
  system_prompt: string;
  avatar_url: string | null;
  voice_id: string | null;
  characteristics: Record<string, unknown>;
  reasoning_style?: 'evidence_based' | 'contextual' | string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string | null;
  persona_id: string | null;
  context: Record<string, unknown>;
  status: 'active' | 'archived' | 'deleted';
  last_message_at: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  persona_id: string | null;
  ai_model_id: string | null;
  is_second_opinion: boolean;
  parent_message_id: string | null;
  metadata: Record<string, unknown>;
  tokens_used: number | null;
  processing_time_ms: number | null;
  has_voice: boolean;
  created_at: string;
}

export interface VoiceInteraction {
  id: string;
  message_id: string;
  user_id: string;
  interaction_type: 'speech_to_text' | 'text_to_speech';
  storage_path: string | null;
  duration_ms: number | null;
  language: string;
  transcript: string | null;
  confidence_score: number | null;
  created_at: string;
}

export interface DeviceBrand {
  id: string;
  code: string;
  name: string;
  category: 'smartwatch' | 'fitness_tracker' | 'smart_ring' | 'cgm' | 'blood_pressure' | 'body_composition' | 'medical_sensor';
  logo_url: string | null;
  description_en: string | null;
  description_ru: string | null;
  capabilities: Record<string, boolean>;
  oauth_provider: string | null;
  oauth_scopes: string[] | null;
  api_version: string | null;
  requires_subscription: boolean;
  supports_realtime: boolean;
  data_refresh_interval_hours: number;
  active: boolean;
  sort_order: number;
  setup_instructions_en: string | null;
  setup_instructions_ru: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserDevice {
  id: string;
  user_id: string;
  brand_id: string;
  device_name: string | null;
  status: 'connected' | 'disconnected' | 'error' | 'token_expired';
  sync_frequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  last_sync_at: string | null;
  last_sync_status: string | null;
  next_sync_at: string | null;
  oauth_token_encrypted: string | null;
  oauth_refresh_token_encrypted: string | null;
  oauth_expires_at: string | null;
  device_metadata: Record<string, unknown>;
  error_message: string | null;
  error_count: number;
  connected_at: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceData {
  id: string;
  user_id: string;
  device_id: string;
  data_type: 'heart_rate' | 'hrv' | 'sleep' | 'activity' | 'steps' | 'calories' | 'temperature' | 'glucose' | 'blood_pressure' | 'oxygen_saturation' | 'stress' | 'recovery' | 'respiratory_rate' | 'body_composition';
  timestamp: string;
  value: number | null;
  unit: string | null;
  metadata: Record<string, unknown>;
  quality_score: number | null;
  created_at: string;
}

export interface SyncLog {
  id: string;
  device_id: string;
  user_id: string;
  sync_type: 'manual' | 'scheduled' | 'realtime' | null;
  status: 'started' | 'success' | 'partial' | 'failed' | null;
  records_synced: number;
  data_types_synced: string[] | null;
  error_message: string | null;
  duration_ms: number | null;
  started_at: string;
  completed_at: string | null;
}

export interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  category: 'welcome' | 'payment_success' | 'payment_failed' | 'password_reset' | 'billing_invoice' | 'subscription_update' | 'general' | 'promotion' | 'notification';
  subject_en: string;
  subject_ru: string | null;
  body_en: string;
  body_ru: string | null;
  variables: string[];
  status: 'draft' | 'active' | 'archived';
  description: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  template_id: string | null;
  recipient_user_id: string | null;
  recipient_email: string;
  subject: string;
  body: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface EmailTemplateVersion {
  id: string;
  template_id: string;
  version: number;
  subject_en: string;
  subject_ru: string | null;
  body_en: string;
  body_ru: string | null;
  preview_text: string | null;
  variable_schema: Array<{
    key: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
    required?: boolean;
  }>;
  status: 'draft' | 'published';
  created_by: string | null;
  created_at: string;
  published_at: string | null;
}

export interface EmailSend {
  id: string;
  template_id: string | null;
  template_version: number | null;
  recipient_user_id: string | null;
  recipient_email: string;
  subject: string;
  body_html: string;
  body_text: string | null;
  variables_used: Record<string, unknown>;
  send_type: 'transactional' | 'marketing' | 'test';
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  provider: string | null;
  provider_message_id: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  bounce_reason: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
