export type ProductEventName =
  | "signup_started"
  | "signup_completed"
  | "login_completed"
  | "resume_started"
  | "resume_completed"
  | "resume_downloaded"
  | "website_started"
  | "website_published"
  | "website_viewed"
  | "contact_submitted"
  | "ats_scored"
  | "upgrade_clicked"
  | "feedback_submitted"
  | "nps_after_download";

export type PlanKey = "free" | "student" | "pro";

export interface EntitlementRecord {
  plan_key: PlanKey;
  billing_status: string;
  ai_daily_limit: number;
  pdf_monthly_limit: number;
  website_limit: number;
  custom_domain_enabled: boolean;
  priority_support_enabled: boolean;
}

export interface UsageCounterRecord {
  ai_requests_count: number;
  pdf_downloads_count: number;
  websites_published_count: number;
}

export interface ResumeActivityRecord {
  id: string;
  title?: string;
  current_step?: number;
  template?: string;
  data?: Record<string, any>;
  is_complete?: boolean;
}

export interface WebsiteActivityRecord {
  id: string;
  title?: string;
  is_published?: boolean;
}

export interface ChecklistItem {
  key: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  done: boolean;
}
