import { Component, OnInit, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/api.service';
import { AnalyticsStats, Report } from '../../core/models';

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink, MatProgressSpinnerModule],
  template: `
    <div class="adm-page">

      <!-- ── Page head ── -->
      <div class="adm-page-head">
        <div>
          <h2 class="adm-page-title">{{ greeting }}, Admin 👋</h2>
          <div class="adm-page-sub">Here's what's happening across Yummy today, {{ today | date:'MMMM d' }}.</div>
        </div>
        <div class="adm-hstack">
          <button class="adm-btn outline">Last 7 days</button>
          <button class="adm-btn outline">Export</button>
        </div>
      </div>

      <!-- ── Stat cards ── -->
      <div class="adm-stats-grid">
        <div class="adm-stat-card">
          <div class="adm-stat-row">
            <div class="adm-stat-label">
              <div class="adm-stat-icon danger">🚩</div>
              Open reports
            </div>
            @if (reportsCount() !== null) {
              <span class="adm-stat-delta up">▲ pending</span>
            }
          </div>
          <div class="adm-stat-value">
            @if (reportsLoading()) { <mat-spinner diameter="24" /> }
            @else { {{ reportsCount() ?? '—' }} }
          </div>
          <div class="adm-stat-foot">Review moderation queue</div>
        </div>

        <div class="adm-stat-card">
          <div class="adm-stat-row">
            <div class="adm-stat-label">
              <div class="adm-stat-icon info">👥</div>
              Unique users
            </div>
          </div>
          <div class="adm-stat-value">
            @if (statsLoading()) { <mat-spinner diameter="24" /> }
            @else { {{ stats() ? fmtNum(stats()!.overall.unique_users) : '—' }} }
          </div>
          <div class="adm-stat-foot">All-time active accounts</div>
        </div>

        <div class="adm-stat-card">
          <div class="adm-stat-row">
            <div class="adm-stat-label">
              <div class="adm-stat-icon violet">🍴</div>
              Unique recipes
            </div>
          </div>
          <div class="adm-stat-value">
            @if (statsLoading()) { <mat-spinner diameter="24" /> }
            @else { {{ stats() ? fmtNum(stats()!.overall.unique_recipes) : '—' }} }
          </div>
          <div class="adm-stat-foot">Published recipes</div>
        </div>

        <div class="adm-stat-card">
          <div class="adm-stat-row">
            <div class="adm-stat-label">
              <div class="adm-stat-icon warn">📈</div>
              Events · 24h
            </div>
          </div>
          <div class="adm-stat-value">
            @if (statsLoading()) { <mat-spinner diameter="24" /> }
            @else { {{ stats() ? fmtNum(stats()!.overall.events_last_24h) : '—' }} }
          </div>
          <div class="adm-stat-foot">
            @if (stats()) { {{ fmtNum(stats()!.overall.events_last_7d) }} this week }
          </div>
        </div>
      </div>

      <!-- ── Chart + Funnel row ── -->
      <div class="two-col-wide" style="margin-bottom: 16px;">
        <!-- Daily chart -->
        <div class="adm-card">
          <div class="adm-card-head">
            <div>
              <div class="adm-card-title">Daily activity</div>
              <div class="adm-card-sub">Total events, last 30 days</div>
            </div>
          </div>
          <div class="adm-card-pad">
            @if (statsLoading()) {
              <div class="adm-loading" style="height: 140px;"><mat-spinner diameter="32" /></div>
            } @else if (stats()?.daily_events?.length) {
              <div class="adm-chart-bars">
                @for (day of stats()!.daily_events; track day.date) {
                  <div class="adm-bar-col" [title]="day.date + ': ' + day.total + ' events'">
                    <div class="adm-bar" [style.height.%]="(day.total / maxDaily()) * 100"></div>
                  </div>
                }
              </div>
              <div class="chart-labels">
                <span class="adm-bar-label">{{ stats()!.daily_events[0].date | date:'MMM d' }}</span>
                <span class="adm-bar-label">{{ stats()!.daily_events[stats()!.daily_events.length - 1].date | date:'MMM d' }}</span>
              </div>
            } @else {
              <div class="adm-empty" style="height: 140px; display:flex; align-items:center; justify-content:center;">No data</div>
            }
          </div>
        </div>

        <!-- Signup funnel -->
        <div class="adm-card">
          <div class="adm-card-head">
            <div class="adm-card-title">Signup funnel</div>
            <span class="adm-badge neutral">7d</span>
          </div>
          <div class="adm-card-pad">
            @if (statsLoading()) {
              <div class="adm-loading"><mat-spinner diameter="32" /></div>
            } @else if (signupFunnel()) {
              <div class="funnel-rows">
                <div class="funnel-row">
                  <div class="funnel-lbl">Signed up</div>
                  <div class="funnel-val">{{ fmtNum(signupFunnel()!.signupTotal) }}</div>
                  <div class="funnel-bar-wrap">
                    <div class="funnel-bar" style="width: 100%; background: var(--ink-900);"></div>
                  </div>
                </div>
                @if (signupFunnel()!.verifyRate !== null) {
                  <div class="funnel-row">
                    <div class="funnel-lbl">Email verified</div>
                    <div class="funnel-val">{{ signupFunnel()!.verifyRate | number:'1.0-0' }}%</div>
                    <div class="funnel-bar-wrap">
                      <div class="funnel-bar" [style.width.%]="signupFunnel()!.verifyRate!"></div>
                    </div>
                  </div>
                }
                @if (signupFunnel()!.onboardingRate !== null) {
                  <div class="funnel-row">
                    <div class="funnel-lbl">Onboarded</div>
                    <div class="funnel-val">{{ signupFunnel()!.onboardingRate | number:'1.0-0' }}%</div>
                    <div class="funnel-bar-wrap">
                      <div class="funnel-bar" [style.width.%]="signupFunnel()!.onboardingRate!"></div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="adm-empty">No funnel data</div>
            }
          </div>
        </div>
      </div>

      <!-- ── Reports queue + Events by type row ── -->
      <div class="two-col-equal">
        <!-- Reports queue -->
        <div class="adm-card">
          <div class="adm-card-head">
            <div class="adm-card-title">Reports queue</div>
            <a routerLink="/admin/reports" class="adm-btn ghost sm">View all →</a>
          </div>
          @if (reportsLoading()) {
            <div class="adm-loading"><mat-spinner diameter="32" /></div>
          } @else if (previewReports().length) {
            <table class="adm-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                @for (r of previewReports(); track r.id) {
                  <tr>
                    <td><span class="adm-badge {{ r.target_type }}"><span class="dot"></span>{{ r.target_type }}</span></td>
                    <td style="font-weight:500;">{{ r.reason }}</td>
                    <td class="adm-muted" style="white-space:nowrap; font-size:12px;">{{ r.created_at | date:'MMM d' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <div class="adm-empty">No open reports 🎉</div>
          }
        </div>

        <!-- Events by type -->
        @if (stats()?.by_type?.length) {
          <div class="adm-card">
            <div class="adm-card-head">
              <div class="adm-card-title">Events by type</div>
            </div>
            <div class="adm-card-pad">
              <div class="events-type-list">
                @for (ev of topEventTypes(); track ev.event_type) {
                  <div class="event-type-row">
                    <div class="event-type-name">{{ ev.event_type }}</div>
                    <div class="event-type-bar-wrap">
                      <div class="event-type-bar" [style.width.%]="(ev.total / maxEventType()) * 100"></div>
                    </div>
                    <div class="event-type-val adm-tabular">{{ fmtNum(ev.total) }}</div>
                  </div>
                }
              </div>
            </div>
          </div>
        } @else {
          <div class="adm-card">
            <div class="adm-card-head"><div class="adm-card-title">Events by type</div></div>
            <div class="adm-loading"><mat-spinner diameter="32" /></div>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .two-col-wide {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
    }
    .two-col-equal {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 900px) {
      .two-col-wide, .two-col-equal {
        grid-template-columns: 1fr;
      }
    }

    /* Chart labels row */
    .chart-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
    }

    /* Funnel rows */
    .funnel-rows { display: flex; flex-direction: column; gap: 12px; }
    .funnel-row { display: flex; flex-direction: column; gap: 4px; }
    .funnel-lbl-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .funnel-lbl {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--ink-700);
      font-family: var(--font-admin);
    }
    .funnel-val {
      font-size: 13px;
      font-weight: 700;
      color: var(--ink-900);
      font-family: var(--font-admin);
      text-align: right;
      margin-bottom: 2px;
    }
    .funnel-bar-wrap {
      height: 6px;
      background: var(--canvas);
      border-radius: 4px;
      overflow: hidden;
    }
    .funnel-bar {
      height: 100%;
      background: var(--yummy-green);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    /* Events by type */
    .events-type-list { display: flex; flex-direction: column; gap: 10px; }
    .event-type-row {
      display: grid;
      grid-template-columns: 100px 1fr 48px;
      align-items: center;
      gap: 8px;
    }
    .event-type-name {
      font-size: 12.5px;
      font-weight: 500;
      color: var(--ink-700);
      font-family: var(--font-admin);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .event-type-bar-wrap {
      height: 6px;
      background: var(--canvas);
      border-radius: 4px;
      overflow: hidden;
    }
    .event-type-bar {
      height: 100%;
      background: var(--yummy-green);
      border-radius: 4px;
    }
    .event-type-val {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--ink-700);
      text-align: right;
      font-family: var(--font-admin);
    }
  `],
})
export class OverviewComponent implements OnInit {
  fmtNum = fmtNum;
  today = new Date();

  stats = signal<AnalyticsStats | null>(null);
  statsLoading = signal(true);

  allReports = signal<Report[]>([]);
  reportsLoading = signal(true);

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getAnalyticsStats().subscribe({
      next: (s) => { this.stats.set(s); this.statsLoading.set(false); },
      error: () => this.statsLoading.set(false),
    });
    this.api.getReports({ limit: 5 }).subscribe({
      next: (r) => { this.allReports.set(r.reports); this.reportsLoading.set(false); },
      error: () => this.reportsLoading.set(false),
    });
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  reportsCount = computed(() => {
    const r = this.allReports();
    return r.length > 0 ? r.length : null;
  });

  previewReports = computed(() => this.allReports().slice(0, 4));

  maxDaily = computed(() => {
    const days = this.stats()?.daily_events ?? [];
    return Math.max(...days.map(d => d.total), 1);
  });

  signupFunnel = computed(() => {
    const bt = this.stats()?.by_type ?? [];
    const find = (t: string) => bt.find(e => e.event_type === t) ?? null;
    const signup = find('signup_complete');
    const verify = find('email_verify_complete');
    const onboarding = find('onboarding_complete');
    const total = signup?.total ?? 0;
    if (!signup) return null;
    return {
      signupTotal: total,
      verifyRate: total > 0 && verify ? (verify.total / total) * 100 : null,
      onboardingRate: total > 0 && onboarding ? (onboarding.total / total) * 100 : null,
    };
  });

  topEventTypes = computed(() => {
    const bt = this.stats()?.by_type ?? [];
    return bt
      .filter(e => !['signup_complete', 'email_verify_complete', 'onboarding_complete',
                     'feed_card_impression', 'feed_card_tap'].includes(e.event_type))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  });

  maxEventType = computed(() => {
    const types = this.topEventTypes();
    return Math.max(...types.map(t => t.total), 1);
  });
}
