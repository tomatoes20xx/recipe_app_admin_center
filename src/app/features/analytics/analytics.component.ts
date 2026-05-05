import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/api.service';
import { AnalyticsStats, AnalyticsEvent, AnalyticsRetentionResponse, AnalyticsFunnel } from '../../core/models';

type ActiveTab = 'overview' | 'events' | 'retention';

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

const EVENT_COLORS: Record<string, string> = {
  view:     'var(--info)',
  like:     '#D6336C',
  bookmark: 'var(--violet)',
  comment:  'var(--warn)',
  cook:     'var(--yummy-green)',
  search:   '#283593',
};

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
    FormsModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <div class="adm-page">

      <!-- ── Page head ── -->
      <div class="adm-page-head">
        <div>
          <h2 class="adm-page-title">Analytics</h2>
          <div class="adm-page-sub">Engagement and growth across the Yummy app.</div>
        </div>
        <div class="adm-hstack">
          <button class="adm-btn outline">Last 30 days</button>
          <button class="adm-btn outline">Export</button>
        </div>
      </div>

      <!-- ── Tabs ── -->
      <div class="adm-tabs" style="margin-bottom:22px;">
        <button class="adm-tab" [class.active]="activeTab() === 'overview'"   (click)="activeTab.set('overview')">Overview</button>
        <button class="adm-tab" [class.active]="activeTab() === 'retention'" (click)="activeTab.set('retention')">Retention</button>
        <button class="adm-tab" [class.active]="activeTab() === 'events'"    (click)="activeTab.set('events')">Events log</button>
      </div>

      <!-- ════════════════════ OVERVIEW TAB ════════════════════ -->
      @if (activeTab() === 'overview') {

        @if (statsLoading()) {
          <div class="adm-loading" style="height:200px;"><mat-spinner diameter="48" /></div>

        } @else if (statsError()) {
          <div class="adm-empty" style="padding:60px;">
            <div style="font-size:18px; margin-bottom:12px;">Failed to load analytics.</div>
            <button class="adm-btn primary" (click)="loadStats()">Retry</button>
          </div>

        } @else if (stats()) {

          <!-- Stat cards -->
          <div class="adm-stats-grid">
            <div class="adm-stat-card">
              <div class="adm-stat-row">
                <div class="adm-stat-label"><div class="adm-stat-icon info">👁</div> Total events</div>
              </div>
              <div class="adm-stat-value">{{ fmtNum(stats()!.overall.total_events) }}</div>
              <div class="adm-stat-foot">All time</div>
            </div>
            <div class="adm-stat-card">
              <div class="adm-stat-row">
                <div class="adm-stat-label"><div class="adm-stat-icon violet">👥</div> Unique users</div>
              </div>
              <div class="adm-stat-value">{{ fmtNum(stats()!.overall.unique_users) }}</div>
              <div class="adm-stat-foot">Active accounts</div>
            </div>
            <div class="adm-stat-card">
              <div class="adm-stat-row">
                <div class="adm-stat-label"><div class="adm-stat-icon green">🍴</div> Unique recipes</div>
              </div>
              <div class="adm-stat-value">{{ fmtNum(stats()!.overall.unique_recipes) }}</div>
              <div class="adm-stat-foot">Published</div>
            </div>
            <div class="adm-stat-card">
              <div class="adm-stat-row">
                <div class="adm-stat-label"><div class="adm-stat-icon warn">📈</div> Events · 24h</div>
              </div>
              <div class="adm-stat-value">{{ fmtNum(stats()!.overall.events_last_24h) }}</div>
              <div class="adm-stat-foot">{{ fmtNum(stats()!.overall.events_last_7d) }} this week</div>
            </div>
          </div>

          <!-- Daily chart + Funnel row -->
          <div class="an-row" style="margin-bottom:16px;">
            <div class="adm-card" style="flex:2;">
              <div class="adm-card-head">
                <div>
                  <div class="adm-card-title">Daily events — last 30 days</div>
                </div>
                <span class="adm-badge neutral">
                  <span class="dot" style="background:var(--yummy-green);"></span> Events
                </span>
              </div>
              <div class="adm-card-pad">
                @if (stats()!.daily_events.length) {
                  <div class="adm-chart-bars">
                    @for (day of stats()!.daily_events; track day.date) {
                      <div class="adm-bar-col" [title]="day.date + ': ' + day.total">
                        <div class="adm-bar" [style.height.%]="(day.total / maxDaily()) * 100"></div>
                      </div>
                    }
                  </div>
                  <div style="display:flex; justify-content:space-between; margin-top:8px;">
                    <span class="adm-bar-label">{{ stats()!.daily_events[0].date | date:'MMM d' }}</span>
                    <span class="adm-bar-label">{{ stats()!.daily_events[stats()!.daily_events.length - 1].date | date:'MMM d' }}</span>
                  </div>
                } @else {
                  <div class="adm-empty">No daily data</div>
                }
              </div>
            </div>

            @if (signupFunnel().signup) {
              <div class="adm-card" style="flex:1;">
                <div class="adm-card-head">
                  <div class="adm-card-title">Signup funnel</div>
                </div>
                <div class="adm-card-pad">
                  <div class="funnel-rows">
                    <div class="funnel-row">
                      <div style="display:flex; justify-content:space-between;">
                        <span class="funnel-lbl">Signed up</span>
                        <span class="funnel-val">{{ signupFunnel().signup!.total | number }}</span>
                      </div>
                      <div class="funnel-bar-wrap">
                        <div class="funnel-bar" style="width:100%; background:var(--ink-900);"></div>
                      </div>
                      <div style="font-size:11px; color:var(--ink-400); margin-top:2px;">{{ signupFunnel().signup!.last_24h }} today · {{ signupFunnel().signup!.last_7d }} this week</div>
                    </div>
                    @if (signupFunnel().verifyRate !== null) {
                      <div class="funnel-row">
                        <div style="display:flex; justify-content:space-between;">
                          <span class="funnel-lbl">Email verified</span>
                          <span class="funnel-val">{{ signupFunnel().verifyRate! | number:'1.0-0' }}%</span>
                        </div>
                        <div class="funnel-bar-wrap">
                          <div class="funnel-bar" [style.width.%]="signupFunnel().verifyRate!"></div>
                        </div>
                      </div>
                    }
                    @if (signupFunnel().onboardingRate !== null) {
                      <div class="funnel-row">
                        <div style="display:flex; justify-content:space-between;">
                          <span class="funnel-lbl">Onboarded</span>
                          <span class="funnel-val">{{ signupFunnel().onboardingRate! | number:'1.0-0' }}%</span>
                        </div>
                        <div class="funnel-bar-wrap">
                          <div class="funnel-bar" [style.width.%]="signupFunnel().onboardingRate!"></div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Top recipes + Events by type -->
          <div class="an-row">
            <div class="adm-card" style="flex:1.4;">
              <div class="adm-card-head">
                <div class="adm-card-title">Top recipes</div>
              </div>
              <div class="adm-table-wrap">
                <table class="adm-table">
                  <thead>
                    <tr>
                      <th style="width:32px;">#</th>
                      <th>Recipe</th>
                      <th class="adm-text-right" style="width:56px;">👁</th>
                      <th class="adm-text-right" style="width:56px;">❤️</th>
                      <th class="adm-text-right" style="width:56px;">🔖</th>
                      <th class="adm-text-right" style="width:56px;">💬</th>
                      <th class="adm-text-right" style="width:64px;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    @if (stats()!.top_recipes.length === 0) {
                      <tr><td colspan="7" class="adm-empty">No recipe data.</td></tr>
                    }
                    @for (r of stats()!.top_recipes; track r.recipe_id; let i = $index) {
                      <tr>
                        <td class="adm-muted adm-tabular" style="font-size:13px;">{{ i + 1 }}</td>
                        <td>
                          <div class="adm-cell-name">
                            <span class="primary">{{ r.recipe_title }}</span>
                            <span class="secondary">&#64;{{ r.author_username }}</span>
                          </div>
                        </td>
                        <td class="adm-text-right adm-tabular" style="font-size:12.5px;">{{ fmtNum(r.views) }}</td>
                        <td class="adm-text-right adm-tabular" style="font-size:12.5px;">{{ fmtNum(r.likes) }}</td>
                        <td class="adm-text-right adm-tabular" style="font-size:12.5px;">{{ fmtNum(r.bookmarks) }}</td>
                        <td class="adm-text-right adm-tabular" style="font-size:12.5px;">{{ r.comments }}</td>
                        <td class="adm-text-right adm-tabular" style="font-weight:700; font-size:13px; color:var(--yummy-green-600);">{{ fmtNum(r.total_events) }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <div class="adm-card" style="flex:1;">
              <div class="adm-card-head"><div class="adm-card-title">Events by type</div></div>
              <div class="adm-card-pad">
                <div style="display:flex; flex-direction:column; gap:12px;">
                  @for (t of stats()!.by_type; track t.event_type) {
                    <div>
                      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span style="font-size:12.5px; font-weight:500; color:var(--ink-700);">{{ t.event_type }}</span>
                        <span style="font-size:12.5px; font-weight:700; font-feature-settings:'tnum';">{{ fmtNum(t.total) }}</span>
                      </div>
                      <div style="height:6px; background:var(--canvas); border-radius:4px; overflow:hidden;">
                        <div [style.width.%]="(t.total / maxByType()) * 100"
                             [style.background]="eventColor(t.event_type)"
                             style="height:100%; border-radius:4px;"></div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Feed CTR -->
          @if (feedCtr()) {
            <div class="adm-card" style="margin-top:16px;">
              <div class="adm-card-head"><div class="adm-card-title">Feed CTR</div></div>
              <div class="adm-card-pad">
                <div class="ctr-row">
                  <div class="ctr-stat">
                    <div class="ctr-val">{{ feedCtr()!.impressions.total | number }}</div>
                    <div class="ctr-lbl">Impressions</div>
                    <div class="ctr-sub">{{ feedCtr()!.impressions.last_24h }} today</div>
                  </div>
                  <div class="ctr-stat">
                    <div class="ctr-val">{{ feedCtr()!.taps?.total | number }}</div>
                    <div class="ctr-lbl">Taps</div>
                    <div class="ctr-sub">{{ feedCtr()!.taps?.last_24h ?? 0 }} today</div>
                  </div>
                  <div class="ctr-stat ctr-highlight">
                    <div class="ctr-val">{{ feedCtr()!.ctr | number:'1.1-1' }}%</div>
                    <div class="ctr-lbl">CTR</div>
                    <div class="ctr-sub">taps ÷ impressions</div>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Platform breakdown -->
          @if (platformBreakdown()) {
            <div class="adm-card" style="margin-top:16px;">
              <div class="adm-card-head">
                <div class="adm-card-title">Platform breakdown</div>
                <span style="font-size:12px; color:var(--ink-400);">{{ platformBreakdown()!.total | number }} registered users</span>
              </div>
              <div class="adm-card-pad">
                <div style="display:flex; flex-direction:column; gap:14px;">
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                      <span style="font-size:12.5px; font-weight:600; color:var(--ink-700);">🍎 iOS</span>
                      <span style="font-size:12.5px; font-weight:700; font-feature-settings:'tnum';">
                        {{ platformBreakdown()!.ios | number }} <span style="color:var(--ink-400); font-weight:400;">({{ platformBreakdown()!.iosPct | number:'1.0-0' }}%)</span>
                      </span>
                    </div>
                    <div style="height:6px; background:var(--canvas); border-radius:4px; overflow:hidden;">
                      <div [style.width.%]="platformBreakdown()!.iosPct" style="height:100%; background:#555; border-radius:4px;"></div>
                    </div>
                  </div>
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                      <span style="font-size:12.5px; font-weight:600; color:var(--ink-700);">🤖 Android</span>
                      <span style="font-size:12.5px; font-weight:700; font-feature-settings:'tnum';">
                        {{ platformBreakdown()!.android | number }} <span style="color:var(--ink-400); font-weight:400;">({{ platformBreakdown()!.androidPct | number:'1.0-0' }}%)</span>
                      </span>
                    </div>
                    <div style="height:6px; background:var(--canvas); border-radius:4px; overflow:hidden;">
                      <div [style.width.%]="platformBreakdown()!.androidPct" style="height:100%; background:var(--yummy-green); border-radius:4px;"></div>
                    </div>
                  </div>
                  @if (platformBreakdown()!.unknown > 0) {
                    <div>
                      <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span style="font-size:12.5px; font-weight:600; color:var(--ink-400);">Unknown</span>
                        <span style="font-size:12.5px; font-weight:700; font-feature-settings:'tnum'; color:var(--ink-400);">
                          {{ platformBreakdown()!.unknown | number }} ({{ platformBreakdown()!.unknownPct | number:'1.0-0' }}%)
                        </span>
                      </div>
                      <div style="height:6px; background:var(--canvas); border-radius:4px; overflow:hidden;">
                        <div [style.width.%]="platformBreakdown()!.unknownPct" style="height:100%; background:var(--ink-300); border-radius:4px;"></div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        }
      }

      <!-- ════════════════════ RETENTION TAB ════════════════════ -->
      @if (activeTab() === 'retention') {

        @if (retentionLoading() || funnelLoading()) {
          <div class="adm-loading" style="height:200px;"><mat-spinner diameter="48" /></div>

        } @else {

          <!-- Engagement funnel -->
          @if (funnelRows().length) {
            <div class="adm-card" style="margin-bottom:16px;">
              <div class="adm-card-head">
                <div class="adm-card-title">Engagement funnel</div>
                <span style="font-size:12px; color:var(--ink-400);">All-time, unique users</span>
              </div>
              <div class="adm-card-pad">
                <div style="display:flex; flex-direction:column; gap:14px;">
                  @for (step of funnelRows(); track step.label) {
                    <div>
                      <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span style="font-size:13px; font-weight:600; color:var(--ink-700);">{{ step.label }}</span>
                        <span style="font-size:13px; font-weight:700; font-feature-settings:'tnum';">
                          {{ step.count | number }}
                          <span style="color:var(--ink-400); font-weight:400; margin-left:6px;">{{ step.pct | number:'1.0-0' }}%</span>
                        </span>
                      </div>
                      <div style="height:8px; background:var(--canvas); border-radius:4px; overflow:hidden;">
                        <div [style.width.%]="step.pct" [style.background]="step.color" style="height:100%; border-radius:4px; transition:width .3s;"></div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Cohort retention table -->
          <div class="adm-card">
            <div class="adm-card-head">
              <div>
                <div class="adm-card-title">Cohort retention — last 13 weeks</div>
                <div style="font-size:12px; color:var(--ink-400); margin-top:2px;">% of users who returned on exactly D1, D7, D30 after signup</div>
              </div>
            </div>
            <div class="adm-table-wrap">
              <table class="adm-table">
                <thead>
                  <tr>
                    <th>Cohort week</th>
                    <th class="adm-text-right" style="width:72px;">Users</th>
                    <th class="adm-text-right" style="width:88px;">D1</th>
                    <th class="adm-text-right" style="width:88px;">D7</th>
                    <th class="adm-text-right" style="width:88px;">D30</th>
                  </tr>
                </thead>
                <tbody>
                  @if (!retentionRows().length) {
                    <tr><td colspan="5" class="adm-empty">No cohort data yet.</td></tr>
                  }
                  @for (row of retentionRows(); track row.cohort_week) {
                    <tr>
                      <td style="font-size:13px; font-weight:500;">{{ row.cohort_week | date:'MMM d, y' }}</td>
                      <td class="adm-text-right adm-tabular" style="font-size:13px;">{{ row.cohort_size | number }}</td>
                      <td class="adm-text-right adm-tabular">
                        @if (row.d1Mature) {
                          <span class="ret-pct" [class.ret-good]="row.d1Pct >= 20" [class.ret-ok]="row.d1Pct >= 10 && row.d1Pct < 20">
                            {{ row.d1Pct | number:'1.0-0' }}%
                          </span>
                        } @else {
                          <span class="adm-muted" style="font-size:12px;">—</span>
                        }
                      </td>
                      <td class="adm-text-right adm-tabular">
                        @if (row.d7Mature) {
                          <span class="ret-pct" [class.ret-good]="row.d7Pct >= 10" [class.ret-ok]="row.d7Pct >= 5 && row.d7Pct < 10">
                            {{ row.d7Pct | number:'1.0-0' }}%
                          </span>
                        } @else {
                          <span class="adm-muted" style="font-size:12px;">—</span>
                        }
                      </td>
                      <td class="adm-text-right adm-tabular">
                        @if (row.d30Mature) {
                          <span class="ret-pct" [class.ret-good]="row.d30Pct >= 5" [class.ret-ok]="row.d30Pct >= 2 && row.d30Pct < 5">
                            {{ row.d30Pct | number:'1.0-0' }}%
                          </span>
                        } @else {
                          <span class="adm-muted" style="font-size:12px;">—</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }

      <!-- ════════════════════ EVENTS LOG TAB ════════════════════ -->
      @if (activeTab() === 'events') {

        <!-- Type filter chips -->
        <div class="adm-chips" style="margin-bottom:12px; flex-wrap:nowrap; overflow-x:auto; padding-bottom:4px;">
          <button class="adm-chip" [class.active]="activeType() === 'all'" (click)="onTypeChange('all')" style="flex-shrink:0;">
            All
          </button>
          @for (t of eventTypes(); track t) {
            <button class="adm-chip" [class.active]="activeType() === t" (click)="onTypeChange(t)" style="flex-shrink:0; text-transform:capitalize;">
              {{ t }}
            </button>
          }
        </div>

        <!-- ID filters -->
        <div class="id-filters" style="margin-bottom:16px;">
          <mat-form-field appearance="outline" class="id-field">
            <mat-label>Recipe ID</mat-label>
            <input matInput [(ngModel)]="recipeIdValue" (keyup.enter)="applyFilters()" />
            @if (recipeIdValue) {
              <button matSuffix mat-icon-button type="button" (click)="recipeIdValue = ''; applyFilters()">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="id-field">
            <mat-label>User ID</mat-label>
            <input matInput [(ngModel)]="userIdValue" (keyup.enter)="applyFilters()" />
            @if (userIdValue) {
              <button matSuffix mat-icon-button type="button" (click)="userIdValue = ''; applyFilters()">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>

          <button class="adm-btn primary" (click)="applyFilters()">Apply</button>
        </div>

        <!-- Events table -->
        @if (eventsLoading() && events().length === 0) {
          <div class="adm-loading"><mat-spinner diameter="40" /></div>
        } @else {
          <div class="adm-card">
            <div class="adm-table-wrap">
              <table class="adm-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>User</th>
                    <th>Recipe</th>
                    <th>Details</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  @if (events().length === 0) {
                    <tr><td colspan="5" class="adm-empty">No events found.</td></tr>
                  }
                  @for (e of events(); track e.id) {
                    <tr>
                      <td>
                        <span class="ev-badge ev-{{ e.event_type }}">{{ e.event_type }}</span>
                      </td>
                      <td class="adm-muted" style="font-size:13px;">{{ e.user_username ?? '—' }}</td>
                      <td class="adm-muted recipe-title-cell" style="font-size:13px;">{{ e.recipe_title ?? '—' }}</td>
                      <td class="adm-muted" style="font-size:12px; font-style:italic;">{{ formatMetadata(e.metadata) }}</td>
                      <td class="adm-muted" style="white-space:nowrap; font-size:12px;">{{ e.created_at | date:'MMM d · HH:mm' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="adm-load-more">
              @if (nextCursor()) {
                <button class="adm-btn outline" (click)="loadMore()" [disabled]="eventsLoading()">
                  @if (eventsLoading()) { <mat-spinner diameter="16" /> } @else { Load more }
                </button>
              }
            </div>
          </div>
        }
      }

    </div>
  `,
  styles: [`
    /* Analytics 2-col rows */
    .an-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      align-items: flex-start;
    }
    @media (max-width: 900px) {
      .an-row { flex-direction: column; }
      .an-row > * { flex: none !important; width: 100%; }
    }

    /* Funnel bars */
    .funnel-rows { display: flex; flex-direction: column; gap: 12px; }
    .funnel-row { display: flex; flex-direction: column; gap: 4px; }
    .funnel-lbl { font-size: 12.5px; font-weight: 600; color: var(--ink-700); font-family: var(--font-admin); }
    .funnel-val { font-size: 13px; font-weight: 700; font-family: var(--font-admin); }
    .funnel-bar-wrap { height: 6px; background: var(--canvas); border-radius: 4px; overflow: hidden; }
    .funnel-bar { height: 100%; background: var(--yummy-green); border-radius: 4px; }

    /* Feed CTR */
    .ctr-row { display: flex; gap: 0; }
    .ctr-stat {
      flex: 1;
      text-align: center;
      padding: 12px 16px;
      border-right: 1px solid var(--border);
    }
    .ctr-stat:last-child { border-right: none; }
    .ctr-val { font-size: 26px; font-weight: 700; color: var(--ink-900); line-height: 1; font-family: var(--font-admin); }
    .ctr-lbl { font-size: 11px; color: var(--ink-500); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    .ctr-sub { font-size: 11px; color: var(--ink-400); margin-top: 3px; }
    .ctr-highlight .ctr-val { color: var(--yummy-green-600); }

    /* Event type badges */
    .ev-badge {
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 600;
      background: var(--success-bg);
      color: var(--success);
      font-family: var(--font-admin);
      white-space: nowrap;
    }
    .ev-view     { background: var(--info-bg);   color: var(--info); }
    .ev-like     { background: #fce4ec;           color: #880e4f; }
    .ev-comment  { background: var(--warn-bg);    color: var(--warn); }
    .ev-bookmark { background: var(--violet-bg);  color: var(--violet); }
    .ev-search   { background: #e8eaf6;           color: #283593; }

    /* ID filters row */
    .id-filters { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .id-field { max-width: 200px; }

    /* Retention table */
    .ret-pct {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 5px;
      font-size: 12.5px;
      font-weight: 700;
      background: var(--canvas);
      color: var(--ink-500);
    }
    .ret-pct.ret-ok   { background: #fff8e1; color: #e65100; }
    .ret-pct.ret-good { background: var(--success-bg); color: var(--success); }

    /* Recipe title cell in events */
    .recipe-title-cell {
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
})
export class AnalyticsComponent implements OnInit {
  private api = inject(ApiService);
  fmtNum = fmtNum;

  activeTab = signal<ActiveTab>('overview');

  stats = signal<AnalyticsStats | null>(null);
  statsLoading = signal(false);
  statsError = signal(false);

  events = signal<AnalyticsEvent[]>([]);
  nextCursor = signal<string | null>(null);
  eventsLoading = signal(false);

  retention = signal<AnalyticsRetentionResponse | null>(null);
  retentionLoading = signal(false);
  funnel = signal<AnalyticsFunnel | null>(null);
  funnelLoading = signal(false);

  activeType = signal('all');
  recipeIdValue = '';
  userIdValue = '';

  eventTypes = computed(() => (this.stats()?.by_type ?? []).map(e => e.event_type));

  maxDaily = computed(() => {
    const days = this.stats()?.daily_events ?? [];
    return Math.max(...days.map(d => d.total), 1);
  });

  maxByType = computed(() => {
    const bt = this.stats()?.by_type ?? [];
    return Math.max(...bt.map(t => t.total), 1);
  });

  signupFunnel = computed(() => {
    const bt = this.stats()?.by_type ?? [];
    const find = (t: string) => bt.find(e => e.event_type === t) ?? null;
    const signup = find('signup_complete');
    const verify = find('email_verify_complete');
    const onboarding = find('onboarding_complete');
    const total = signup?.total ?? 0;
    return {
      signup,
      verifyRate: total > 0 && verify ? (verify.total / total) * 100 : null,
      onboardingRate: total > 0 && onboarding ? (onboarding.total / total) * 100 : null,
    };
  });

  feedCtr = computed(() => {
    const bt = this.stats()?.by_type ?? [];
    const impressions = bt.find(e => e.event_type === 'feed_card_impression') ?? null;
    const taps = bt.find(e => e.event_type === 'feed_card_tap') ?? null;
    if (!impressions) return null;
    const ctr = impressions.total > 0 && taps ? (taps.total / impressions.total) * 100 : 0;
    return { impressions, taps, ctr };
  });

  platformBreakdown = computed(() => {
    const p = this.stats()?.platforms;
    if (!p) return null;
    const total = p.ios + p.android + p.unknown;
    return {
      ios: p.ios,
      android: p.android,
      unknown: p.unknown,
      total,
      iosPct: total > 0 ? (p.ios / total) * 100 : 0,
      androidPct: total > 0 ? (p.android / total) * 100 : 0,
      unknownPct: total > 0 ? (p.unknown / total) * 100 : 0,
    };
  });

  retentionRows = computed(() => {
    const cohorts = this.retention()?.cohorts ?? [];
    const now = Date.now();
    return cohorts.map(row => {
      const weekMs = new Date(row.cohort_week).getTime();
      const daysSince = (now - weekMs) / 86_400_000;
      const d1Pct  = row.cohort_size > 0 ? (row.d1_count  / row.cohort_size) * 100 : 0;
      const d7Pct  = row.cohort_size > 0 ? (row.d7_count  / row.cohort_size) * 100 : 0;
      const d30Pct = row.cohort_size > 0 ? (row.d30_count / row.cohort_size) * 100 : 0;
      return {
        ...row,
        d1Mature:  daysSince >= 2,
        d7Mature:  daysSince >= 8,
        d30Mature: daysSince >= 31,
        d1Pct,
        d7Pct,
        d30Pct,
      };
    });
  });

  funnelRows = computed(() => {
    const f = this.funnel();
    if (!f || f.total_users === 0) return [];
    const total = f.total_users;
    return [
      { label: '👤 Signed up',       count: total,       pct: 100,                             color: 'var(--ink-800)' },
      { label: '👁 Viewed a recipe',  count: f.had_view,  pct: (f.had_view  / total) * 100,    color: 'var(--info)' },
      { label: '❤️ Liked a recipe',   count: f.had_like,  pct: (f.had_like  / total) * 100,    color: '#D6336C' },
      { label: '🔖 Saved a recipe',   count: f.had_save,  pct: (f.had_save  / total) * 100,    color: 'var(--violet)' },
      { label: '👨‍🍳 Cooked a recipe', count: f.had_cook,  pct: (f.had_cook  / total) * 100,    color: 'var(--yummy-green)' },
    ];
  });

  ngOnInit() {
    this.loadStats();
    this.loadEvents();
    this.loadRetention();
    this.loadFunnel();
  }

  loadStats() {
    this.statsLoading.set(true);
    this.statsError.set(false);
    this.api.getAnalyticsStats().subscribe({
      next: (res) => { this.stats.set(res); this.statsLoading.set(false); },
      error: () => { this.statsError.set(true); this.statsLoading.set(false); },
    });
  }

  loadEvents(append = false) {
    this.eventsLoading.set(true);
    if (!append) { this.events.set([]); this.nextCursor.set(null); }
    this.api.getAnalyticsEvents({
      cursor: append ? (this.nextCursor() ?? undefined) : undefined,
      event_type: this.activeType() !== 'all' ? this.activeType() : undefined,
      recipe_id: this.recipeIdValue || undefined,
      user_id: this.userIdValue || undefined,
    }).subscribe({
      next: (res) => {
        this.events.update(prev => [...prev, ...res.items]);
        this.nextCursor.set(res.next_cursor);
        this.eventsLoading.set(false);
      },
      error: () => this.eventsLoading.set(false),
    });
  }

  loadRetention() {
    this.retentionLoading.set(true);
    this.api.getRetention().subscribe({
      next: (res) => { this.retention.set(res); this.retentionLoading.set(false); },
      error: () => this.retentionLoading.set(false),
    });
  }

  loadFunnel() {
    this.funnelLoading.set(true);
    this.api.getFunnel().subscribe({
      next: (res) => { this.funnel.set(res); this.funnelLoading.set(false); },
      error: () => this.funnelLoading.set(false),
    });
  }

  onTypeChange(value: string) { this.activeType.set(value); this.loadEvents(); }
  applyFilters() { this.loadEvents(); }
  loadMore() { if (!this.nextCursor()) return; this.loadEvents(true); }

  eventColor(type: string): string {
    return EVENT_COLORS[type] ?? 'var(--yummy-green)';
  }

  formatMetadata(raw: string | null): string {
    if (!raw) return '';
    try {
      const obj = JSON.parse(raw);
      return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(', ');
    } catch {
      return raw;
    }
  }
}
