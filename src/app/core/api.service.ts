import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  BanRequest,
  HiddenCommentsResponse,
  HiddenRecipesResponse,
  ReportTargetType,
  ReportsResponse,
  UsersResponse,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // ── Reports ────────────────────────────────────────────────────────────────

  getReports(params: { limit?: number; cursor?: string; type?: ReportTargetType | 'all' }) {
    let p = new HttpParams().set('limit', params.limit ?? 20);
    if (params.cursor) p = p.set('cursor', params.cursor);
    if (params.type && params.type !== 'all') p = p.set('target_type', params.type);
    return this.http.get<ReportsResponse>(`${this.base}/reports`, { params: p });
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  getUsers(params: { limit?: number; cursor?: string; filter?: 'all' | 'soft_banned' | 'permanently_banned' | 'has_violations' }) {
    let p = new HttpParams().set('limit', params.limit ?? 20);
    if (params.cursor) p = p.set('cursor', params.cursor);
    if (params.filter && params.filter !== 'all') p = p.set('filter', params.filter);
    return this.http.get<UsersResponse>(`${this.base}/users`, { params: p });
  }

  banUser(userId: string, body: BanRequest) {
    return this.http.post<void>(`${this.base}/users/${userId}/ban`, body);
  }

  unbanUser(userId: string) {
    return this.http.post<void>(`${this.base}/users/${userId}/unban`, {});
  }

  // ── Content ────────────────────────────────────────────────────────────────

  getHiddenRecipes(params: { limit?: number; cursor?: string }) {
    let p = new HttpParams().set('limit', params.limit ?? 20);
    if (params.cursor) p = p.set('cursor', params.cursor);
    return this.http.get<HiddenRecipesResponse>(`${this.base}/recipes/hidden`, { params: p });
  }

  restoreRecipe(recipeId: string) {
    return this.http.post<void>(`${this.base}/recipes/${recipeId}/restore`, {});
  }

  getHiddenComments(params: { limit?: number; cursor?: string; filter?: 'all' | 'reported' | 'flagged_only' | 'deleted_only' }) {
    let p = new HttpParams().set('limit', params.limit ?? 20);
    if (params.cursor) p = p.set('cursor', params.cursor);
    if (params.filter) p = p.set('filter', params.filter);
    return this.http.get<HiddenCommentsResponse>(`${this.base}/comments/flagged`, { params: p });
  }

  restoreComment(commentId: string) {
    return this.http.post<void>(`${this.base}/comments/${commentId}/restore`, {});
  }
}
