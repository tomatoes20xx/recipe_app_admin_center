import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  AnalyticsEventsResponse,
  AnalyticsFunnel,
  AnalyticsStats,
  BanRequest,
  CohortsResponse,
  ModAction,
  ModActionResponse,
  ModerationResponse,
  ModStatusFilter,
  ModTarget,
  StatsRange,
  UsersResponse,
} from './models';
import { browserTimezone } from './events';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // ── Moderation ─────────────────────────────────────────────────────────────

  getModeration(params: { limit?: number; cursor?: string; type?: ModTarget | 'all'; status?: ModStatusFilter }) {
    let p = new HttpParams().set('limit', params.limit ?? 20);
    if (params.cursor) p = p.set('cursor', params.cursor);
    if (params.type) p = p.set('type', params.type);
    if (params.status) p = p.set('status', params.status);
    return this.http.get<ModerationResponse>(`${this.base}/moderation`, { params: p });
  }

  moderate(type: ModTarget, id: string, action: ModAction, ban?: BanRequest) {
    return this.http.post<ModActionResponse>(`${this.base}/moderation/${type}/${id}`, { action, ban });
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  getUsers(params: {
    limit?: number;
    cursor?: string;
    filter?: 'all' | 'soft_banned' | 'permanently_banned' | 'has_violations';
    q?: string;
  }) {
    let p = new HttpParams().set('limit', params.limit ?? 20);
    if (params.cursor) p = p.set('cursor', params.cursor);
    if (params.filter && params.filter !== 'all') p = p.set('filter', params.filter);
    if (params.q) p = p.set('q', params.q);
    return this.http.get<UsersResponse>(`${this.base}/users`, { params: p });
  }

  banUser(userId: string, body: BanRequest) {
    return this.http.post<void>(`${this.base}/users/${userId}/ban`, body);
  }

  unbanUser(userId: string) {
    return this.http.post<void>(`${this.base}/users/${userId}/unban`, {});
  }

  // ── Analytics ───────────────────────────────────────────────────────────────

  getAnalyticsStats(range: StatsRange = '30d') {
    const p = new HttpParams().set('range', range).set('tz', browserTimezone());
    return this.http.get<AnalyticsStats>(`${this.base}/analytics/stats`, { params: p });
  }

  getAnalyticsEvents(params: { limit?: number; cursor?: string; event_type?: string; recipe_id?: string; user_id?: string }) {
    let p = new HttpParams().set('limit', params.limit ?? 50);
    if (params.cursor) p = p.set('cursor', params.cursor);
    if (params.event_type) p = p.set('event_type', params.event_type);
    if (params.recipe_id) p = p.set('recipe_id', params.recipe_id);
    if (params.user_id) p = p.set('user_id', params.user_id);
    return this.http.get<AnalyticsEventsResponse>(`${this.base}/analytics/events`, { params: p });
  }

  getCohorts(group: 'week' | 'month', count: number) {
    const p = new HttpParams().set('group', group).set('count', count).set('tz', browserTimezone());
    return this.http.get<CohortsResponse>(`${this.base}/analytics/cohorts`, { params: p });
  }

  getFunnel() {
    return this.http.get<AnalyticsFunnel>(`${this.base}/analytics/funnel`);
  }
}
