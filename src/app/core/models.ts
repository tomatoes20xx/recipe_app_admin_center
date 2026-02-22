// ── Auth ────────────────────────────────────────────────────────────────────
export interface LoginResponse {
  token: string;
  is_admin: boolean;
}

// ── Reports ─────────────────────────────────────────────────────────────────
export type ReportTargetType = 'recipe' | 'comment' | 'user';

export interface Report {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  created_at: string;
  reporter_username: string;
  target_detail: string | null;
}

export interface ReportsResponse {
  reports: Report[];
  next_cursor: string | null;
}

// ── Users ────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  username: string;
  display_name: string | null;
  email: string;
  is_active: boolean;
  soft_banned_until: string | null;
  active_violation_count: number;
  total_soft_bans: number;
  ban_reason: string | null;
  created_at: string;
}

export interface BanRequest {
  type: 'soft' | 'permanent';
  reason: string;
  duration_days?: number;
}

export interface UsersResponse {
  users: AdminUser[];
  next_cursor: string | null;
}

// ── Content ──────────────────────────────────────────────────────────────────
export interface HiddenRecipe {
  id: string;
  title: string;
  description: string;
  report_count: number;
  created_at: string;
  author_id: string;
  author_username: string;
  author_display_name: string;
}

export interface HiddenRecipesResponse {
  recipes: HiddenRecipe[];
  next_cursor: string | null;
}

export interface HiddenComment {
  id: string;
  content: string;
  author_username: string;
  recipe_id: string;
  report_count: number;
  created_at: string;
}

export interface HiddenCommentsResponse {
  comments: HiddenComment[];
  next_cursor: string | null;
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export interface AnalyticsOverall {
  total_events: number;
  unique_users: number;
  unique_recipes: number;
  events_last_24h: number;
  events_last_7d: number;
  events_last_30d: number;
}

export interface AnalyticsByType {
  event_type: string;
  total: number;
  last_24h: number;
  last_7d: number;
}

export interface AnalyticsTopRecipe {
  recipe_id: string;
  recipe_title: string;
  author_username: string;
  total_events: number;
  views: number;
  likes: number;
  bookmarks: number;
  comments: number;
}

export interface AnalyticsDailyBreakdown {
  date: string;
  total: number;
  views: number;
  likes: number;
  bookmarks: number;
  comments: number;
}

export interface AnalyticsStats {
  overall: AnalyticsOverall;
  by_type: AnalyticsByType[];
  top_recipes: AnalyticsTopRecipe[];
  daily_events: AnalyticsDailyBreakdown[];
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  user_id: string | null;
  user_username: string | null;
  recipe_id: string | null;
  recipe_title: string | null;
  created_at: string;
  metadata: string | null;
}

export interface AnalyticsEventsResponse {
  items: AnalyticsEvent[];
  next_cursor: string | null;
}
