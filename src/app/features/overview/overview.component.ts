import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/api.service';
import { AnalyticsStats, ModCounts, ModItem, StatsRange } from '../../core/models';
import { eventColor, eventLabel, fmtNum } from '../../core/events';
import { ActivityChartComponent } from '../../shared/activity-chart.component';
import { RangePickerComponent, RANGE_LABELS } from '../../shared/range-picker.component';
import { modItemTitle } from '../moderation/moderation-text';

const RANGE_STORAGE_KEY = 'admin_overview_range';

const CHART_SUBTITLES: Record<StatsRange, string> = {
  today: 'Events per hour, today',
  '7d': 'Events per day, last 7 days',
  '30d': 'Events per day, last 30 days',
  '90d': 'Events per week, last 90 days',
  all: 'Events per month, all time',
};

// Signup steps have their own funnel card, so they're left out of "Events by type".
const FUNNEL_EVENTS = ['signup_complete', 'email_verify_complete', 'onboarding_complete'];

function loadRange(): StatsRange {
  try {
    const v = localStorage.getItem(RANGE_STORAGE_KEY);
    if (v && v in RANGE_LABELS) return v as StatsRange;
  } catch { /* storage unavailable */ }
  return '7d';
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink, MatProgressSpinnerModule, ActivityChartComponent, RangePickerComponent],
  template: `
    <div class="adm-page">

      <!-- ── Page head ── -->
      <div class="adm-page-head">
        <div>
          <h2 class="adm-page-title">{{ greeting }}, Admin 👋</h2>
          <div class="adm-page-sub">Here's what's happening across Yummy, {{ today | date:'MMMM d' }}.</div>
        </div>
        <app-range-picker [value]="range()" (valueChange)="setRange($event)" />
      </div>

      <!-- ── Stat cards ── -->
      <div class="adm-stats-grid">
        <a class="adm-stat-card stat-link" routerLink="/admin/moderation">
          <div class="adm-stat-row">
            <div class="adm-stat-label">
              <div class="adm-stat-icon danger">🚩</div>
              Needs review
            </div>
          </div>
          <div class="adm-stat-value">
            @if (modLoading()) { <mat-spinner diameter="24" /> }
            @else { {{ needsReview() ?? '—' }} }
          </div>
          <div class="adm-stat-foot">
            @if (hiddenCount() !== null) { {{ hiddenCount() }} hidden items · }
            Open moderation queue
          </div>
        </a>

        <div class="adm-stat-card">
          <div class="adm-stat-row">
            <div class="adm-stat-label">
              <div class="adm-stat-icon info">👥</div>
              Active users
            </div>
          </div>
          <div class="adm-stat-value">
            @if (statsLoading()) { <mat-spinner diameter="24" /> }
            @else { {{ stats() ? fmtNum(stats()!.period.active_users) : '—' }} }
          </div>
          <div class="adm-stat-foot">
            Signed-in users with any activity
            @if (stats()) { · {{ stats()!.period.signups | number }} new signups }
          </div>
        </div>

        <div class="adm-stat-card">
          <div class="adm-stat-row">
            <div class="adm-stat-label">
              <div class="adm-stat-icon violet">🍴</div>
              Recipes engaged
            </div>
          </div>
          <div class="adm-stat-value">
            @if (statsLoading()) { <mat-spinner diameter="24" /> }
            @else { {{ stats() ? fmtNum(stats()!.period.recipes) : '—' }} }
          </div>
          <div class="adm-stat-foot">Recipes viewed, liked, saved, cooked…</div>
        </div>

        <div class="adm-stat-card">
          <div class="adm-stat-row">
            <div class="adm-stat-label">
              <div class="adm-stat-icon warn">📈</div>
              Events
            </div>
          </div>
          <div class="adm-stat-value">
            @if (statsLoading()) { <mat-spinner diameter="24" /> }
            @else { {{ stats() ? fmtNum(stats()!.period.events) : '—' }} }
          </div>
          <div class="adm-stat-foot">
            @if (stats()) { {{ fmtNum(stats()!.overall.events_last_24h) }} in the last 24 hours }
          </div>
        </div>
      </div>

      <!-- ── Chart + Funnel row ── -->
      <div class="two-col-wide" style="margin-bottom: 16px;">
        <div class="adm-card">
          <div class="adm-card-head">
            <div>
              <div class="adm-card-title">Activity</div>
              <div class="adm-card-sub">{{ chartSubtitle() }} · hover a column for details</div>
            </div>
          </div>
          <div class="adm-card-pad">
            @if (statsLoading() && !stats()) {
              <div class="adm-loading" style="height: 260px;"><mat-spinner diameter="32" /></div>
            } @else if (statsError()) {
              <div class="adm-empty">Couldn't load activity. <button class="adm-btn sm outline" (click)="loadStats()">Retry</button></div>
            } @else if (stats()) {
              <div [class.reloading]="statsLoading()">
                <app-activity-chart [points]="stats()!.series" [bucket]="stats()!.range.bucket" [height]="220" />
              </div>
            }
          </div>
        </div>

        <div class="adm-card">
          <div class="adm-card-head">
            <div class="adm-card-title">Signup funnel</div>
            <span class="adm-badge neutral">{{ rangeLabel() }}</span>
          </div>
          <div class="adm-card-pad">
            @if (statsLoading() && !stats()) {
              <div class="adm-loading"><mat-spinner diameter="32" /></div>
            } @else if (signupFunnel()) {
              <div class="funnel-rows">
                <div class="funnel-row">
                  <div class="funnel-head">
                    <span class="funnel-lbl">Signed up</span>
                    <span class="funnel-val">{{ signupFunnel()!.signups | number }}</span>
                  </div>
                  <div class="funnel-bar-wrap">
                    <div class="funnel-bar" style="width: 100%; background: var(--ink-900);"></div>
                  </div>
                </div>
                @for (step of signupFunnel()!.steps; track step.label) {
                  <div class="funnel-row">
                    <div class="funnel-head">
                      <span class="funnel-lbl">{{ step.label }}</span>
                      <span class="funnel-val">
                        {{ step.count | number }}
                        @if (step.pct !== null) { <span class="funnel-pct">{{ step.pct | number:'1.0-0' }}%</span> }
                      </span>
                    </div>
                    <div class="funnel-bar-wrap">
                      <div class="funnel-bar" [style.width.%]="step.pct === null ? 0 : (step.pct > 100 ? 100 : step.pct)"></div>
                    </div>
                  </div>
                }
                <div class="funnel-note">Onboarding counts guests too, so it can pass 100%.</div>
              </div>
            } @else {
              <div class="adm-empty">No signups in this period</div>
            }
          </div>
        </div>
      </div>

      <!-- ── Moderation queue + Events by type row ── -->
      <div class="two-col-equal">
        <div class="adm-card">
          <div class="adm-card-head">
            <div class="adm-card-title">Needs review</div>
            <a routerLink="/admin/moderation" class="adm-btn ghost sm">Open moderation →</a>
          </div>
          @if (modLoading()) {
            <div class="adm-loading"><mat-spinner diameter="32" /></div>
          } @else if (queuePreview().length) {
            <table class="adm-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Item</th>
                  <th class="adm-text-right">Reports</th>
                  <th>Last</th>
                </tr>
              </thead>
              <tbody>
                @for (item of queuePreview(); track item.target_id) {
                  <tr>
                    <td><span class="adm-badge {{ item.target_type }}"><span class="dot"></span>{{ item.target_type }}</span></td>
                    <td class="queue-title">
                      <div class="queue-main">{{ itemTitle(item) }}</div>
                      <div class="queue-sub">{{ item.reasons[0]?.label ?? '' }}</div>
                    </td>
                    <td class="adm-text-right adm-tabular" style="font-weight:700;">{{ item.open_reports }}</td>
                    <td class="adm-muted" style="white-space:nowrap; font-size:12px;">{{ item.last_activity_at | date:'MMM d' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <div class="adm-empty">Nothing waiting for review 🎉</div>
          }
        </div>

        <div class="adm-card">
          <div class="adm-card-head">
            <div class="adm-card-title">Events by type</div>
            <span class="adm-badge neutral">{{ rangeLabel() }}</span>
          </div>
          <div class="adm-card-pad">
            @if (statsLoading() && !stats()) {
              <div class="adm-loading"><mat-spinner diameter="32" /></div>
            } @else if (topEventTypes().length) {
              <div class="events-type-list">
                @for (ev of topEventTypes(); track ev.event_type) {
                  <div class="event-type-row">
                    <div class="event-type-name">
                      <span class="swatch" [style.background]="color(ev.event_type)"></span>
                      {{ label(ev.event_type) }}
                    </div>
                    <div class="event-type-bar-wrap">
                      <div class="event-type-bar"
                           [style.width.%]="(ev.in_range / maxEventType()) * 100"
                           [style.background]="color(ev.event_type)"></div>
                    </div>
                    <div class="event-type-val adm-tabular">{{ fmtNum(ev.in_range) }}</div>
                  </div>
                }
              </div>
            } @else {
              <div class="adm-empty">No events in this period</div>
            }
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .two-col-wide {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
      gap: 16px;
    }
    .two-col-equal {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 16px;
    }
    @media (max-width: 900px) {
      .two-col-wide, .two-col-equal { grid-template-columns: minmax(0, 1fr); }
    }

    .stat-link { text-decoration: none; color: inherit; transition: border-color .12s; }
    .stat-link:hover { border-color: var(--border-strong); }

    .reloading { opacity: .55; transition: opacity .15s; }

    /* Funnel rows */
    .funnel-rows { display: flex; flex-direction: column; gap: 14px; }
    .funnel-row { display: flex; flex-direction: column; gap: 5px; }
    .funnel-head { display: flex; justify-content: space-between; align-items: baseline; }
    .funnel-lbl { font-size: 12.5px; font-weight: 600; color: var(--ink-700); }
    .funnel-val { font-size: 13px; font-weight: 700; color: var(--ink-900); font-feature-settings: 'tnum'; }
    .funnel-pct { color: var(--ink-400); font-weight: 500; margin-left: 6px; }
    .funnel-bar-wrap { height: 6px; background: var(--canvas); border-radius: 4px; overflow: hidden; }
    .funnel-bar { height: 100%; background: var(--yummy-green); border-radius: 4px; transition: width 0.3s ease; }
    .funnel-note { font-size: 11px; color: var(--ink-400); }

    /* Queue preview */
    .queue-title { max-width: 260px; }
    .queue-main {
      font-weight: 500; color: var(--ink-900);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .queue-sub { font-size: 11.5px; color: var(--ink-400); }

    /* Events by type */
    .events-type-list { display: flex; flex-direction: column; gap: 10px; }
    .event-type-row {
      display: grid;
      grid-template-columns: 150px minmax(0, 1fr) 48px;
      align-items: center;
      gap: 10px;
    }
    .event-type-name {
      display: flex; align-items: center; gap: 7px;
      font-size: 12.5px; font-weight: 500; color: var(--ink-700);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .swatch { width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0; }
    .event-type-bar-wrap { height: 6px; background: var(--canvas); border-radius: 4px; overflow: hidden; }
    .event-type-bar { height: 100%; border-radius: 4px; }
    .event-type-val { font-size: 12.5px; font-weight: 700; color: var(--ink-700); text-align: right; }
  `],
})
export class OverviewComponent implements OnInit {
  private api = inject(ApiService);

  fmtNum = fmtNum;
  label = eventLabel;
  color = eventColor;
  itemTitle = modItemTitle;
  today = new Date();

  range = signal<StatsRange>(loadRange());
  rangeLabel = computed(() => RANGE_LABELS[this.range()]);
  chartSubtitle = computed(() => CHART_SUBTITLES[this.range()]);

  stats = signal<AnalyticsStats | null>(null);
  statsLoading = signal(true);
  statsError = signal(false);

  modItems = signal<ModItem[]>([]);
  modCounts = signal<ModCounts | null>(null);
  modLoading = signal(true);

  private statsRequest = 0;

  ngOnInit() {
    this.loadStats();
    this.api.getModeration({ status: 'needs_review', limit: 4 }).subscribe({
      next: (r) => { this.modItems.set(r.items); this.modCounts.set(r.counts); this.modLoading.set(false); },
      error: () => this.modLoading.set(false),
    });
  }

  setRange(range: StatsRange) {
    this.range.set(range);
    try { localStorage.setItem(RANGE_STORAGE_KEY, range); } catch { /* storage unavailable */ }
    this.loadStats();
  }

  loadStats() {
    const request = ++this.statsRequest;
    this.statsLoading.set(true);
    this.statsError.set(false);
    this.api.getAnalyticsStats(this.range()).subscribe({
      next: (s) => {
        if (request !== this.statsRequest) return;
        this.stats.set(s);
        this.statsLoading.set(false);
      },
      error: () => {
        if (request !== this.statsRequest) return;
        this.statsError.set(true);
        this.statsLoading.set(false);
      },
    });
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  needsReview = computed(() => {
    const c = this.modCounts();
    return c ? c.recipe.needs_review + c.comment.needs_review + c.user.needs_review : null;
  });

  hiddenCount = computed(() => {
    const c = this.modCounts();
    return c ? c.recipe.hidden + c.comment.hidden : null;
  });

  queuePreview = computed(() => this.modItems().slice(0, 4));

  signupFunnel = computed(() => {
    const bt = this.stats()?.by_type ?? [];
    const count = (t: string) => bt.find((e) => e.event_type === t)?.in_range ?? 0;
    const signups = count('signup_complete');
    if (!signups) return null;
    const pct = (n: number) => (signups > 0 ? (n / signups) * 100 : null);
    return {
      signups,
      steps: [
        { label: 'Email verified', count: count('email_verify_complete'), pct: pct(count('email_verify_complete')) },
        { label: 'Onboarded', count: count('onboarding_complete'), pct: pct(count('onboarding_complete')) },
      ],
    };
  });

  topEventTypes = computed(() =>
    (this.stats()?.by_type ?? [])
      .filter((e) => !FUNNEL_EVENTS.includes(e.event_type) && e.in_range > 0)
      .sort((a, b) => b.in_range - a.in_range)
      .slice(0, 8),
  );

  maxEventType = computed(() => Math.max(...this.topEventTypes().map((t) => t.in_range), 1));
}
