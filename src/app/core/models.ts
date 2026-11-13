// ── Auth ────────────────────────────────────────────────────────────────────
export interface LoginResponse {
  token: string;
  is_admin: boolean;
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

// ── Moderation ───────────────────────────────────────────────────────────────
export type ModTarget = 'recipe' | 'comment' | 'user';
export type ModStatusFilter = 'needs_review' | 'hidden' | 'all';
export type ModAction = 'dismiss' | 'hide' | 'restore' | 'keep_hidden' | 'ban';

/**
 * Current state of the reported thing:
 * recipe  → visible | hidden | deleted (by its author)
 * comment → visible | flagged (collapsed in the app) | removed
 * user    → active | soft_banned | banned
 * any     → missing (no longer in the database)
 */
export type ModItemStatus =
  | 'visible' | 'hidden' | 'deleted'
  | 'flagged' | 'removed'
  | 'active' | 'soft_banned' | 'banned'
  | 'missing';

export interface ModReport {
  id: string;
  reason: string;
  reporter_username: string | null;
  created_at: string;
  resolved_at: string | null;
  resolution: ModAction | null;
}

export interface ModItem {
  target_type: ModTarget;
  target_id: string;
  status: ModItemStatus;
  open_reports: number;
  total_reports: number;
  last_activity_at: string;
  reasons: { label: string; count: number }[];
  reports: ModReport[];
  recipe: { title: string | null } | null;
  comment: { body: string | null; recipe_id: string | null; recipe_title: string | null } | null;
  user: { email: string | null; ban_reason: string | null } | null;
  /** Recipe/comment author, or the reported user themselves. */
  author: {
    id: string;
    username: string | null;
    display_name: string | null;
    is_active: boolean;
    soft_banned_until: string | null;
  } | null;
}

export type ModCounts = Record<ModTarget, { needs_review: number; hidden: number; all: number }>;

export interface ModerationResponse {
  items: ModItem[];
  next_cursor: string | null;
  counts: ModCounts;
}

export interface ModActionResponse {
  item: ModItem | null;
  counts: ModCounts;
}

// ── Analytics ────────────────────────────────────────────────────────────────
export type StatsRange = 'today' | '7d' | '30d' | '90d' | 'all';
export type StatsBucket = 'hour' | 'day' | 'week' | 'month';

export interface AnalyticsOverall {
  total_events: number;
  unique_users: number;
  unique_recipes: number;
  events_last_24h: number;
  events_last_7d: number;
  events_last_30d: number;
}

export interface AnalyticsPeriod {
  events: number;
  active_users: number;
  recipes: number;
  signups: number;
}

export interface AnalyticsByType {
  event_type: string;
  total: number;
  last_24h: number;
  last_7d: number;
  in_range: number;
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
  cooks?: number;
}

/** One chart column: `start` is the bucket's local start time (`YYYY-MM-DDTHH:mm`). */
export interface AnalyticsSeriesPoint {
  start: string;
  counts: Record<string, number>;
}

export interface AnalyticsPlatforms {
  ios: number;
  android: number;
  unknown: number;
}

export interface AnalyticsStats {
  range: { key: StatsRange; bucket: StatsBucket; tz: string; start: string };
  period: AnalyticsPeriod;
  series: AnalyticsSeriesPoint[];
  overall: AnalyticsOverall;
  by_type: AnalyticsByType[];
  top_recipes: AnalyticsTopRecipe[];
  platforms: AnalyticsPlatforms;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  user_id: string | null;
  user_username: string | null;
  recipe_id: string | null;
  recipe_title: string | null;
  created_at: string;
  metadata: Record<string, unknown> | string | null;
}

export interface AnalyticsEventsResponse {
  items: AnalyticsEvent[];
  next_cursor: string | null;
}

export interface CohortCell {
  /** Users in the cohort whose period has fully passed. */
  eligible: number;
  /** Of those, how many did anything in the app during the period. */
  retained: number;
}

export interface CohortsResponse {
  group: 'week' | 'month';
  count: number;
  tz: string;
  /** Number of period columns (Week 1…N / Month 1…N). */
  periods: number;
  cohorts: { cohort_start: string; size: number; cells: CohortCell[] }[];
  average: CohortCell[];
}

export interface AnalyticsFunnel {
  total_users: number;
  had_view: number;
  had_like: number;
  had_save: number;
  had_cook: number;
}
