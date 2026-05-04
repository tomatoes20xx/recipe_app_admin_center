import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/api.service';
import { Report, ReportTargetType } from '../../core/models';

type FilterType = 'all' | ReportTargetType;

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [DatePipe, MatProgressSpinnerModule],
  template: `
    <div class="adm-page">

      <!-- ── Page head ── -->
      <div class="adm-page-head">
        <div>
          <h2 class="adm-page-title">Reports</h2>
          <div class="adm-page-sub">Review user-submitted reports and take moderation action.</div>
        </div>
        <div class="adm-hstack">
          <button class="adm-btn outline">Filters</button>
          <button class="adm-btn primary">Bulk resolve</button>
        </div>
      </div>

      <!-- ── Filter chips ── -->
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
        <div class="adm-chips">
          @for (f of filters; track f.value) {
            <button class="adm-chip" [class.active]="activeFilter() === f.value"
                    (click)="setFilter(f.value)">
              {{ f.label }}
              <span class="chip-count">{{ f.count }}</span>
            </button>
          }
        </div>
      </div>

      <!-- ── Table card ── -->
      <div class="adm-card">
        @if (loading() && reports().length === 0) {
          <div class="adm-loading"><mat-spinner diameter="40" /></div>
        } @else {
          <div class="adm-table-wrap">
            <table class="adm-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Content</th>
                  <th>Reporter</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @if (reports().length === 0) {
                  <tr>
                    <td colspan="6" class="adm-empty">No reports found.</td>
                  </tr>
                }
                @for (r of reports(); track r.id) {
                  <tr>
                    <td>
                      <span class="adm-badge {{ r.target_type }}">
                        <span class="dot"></span>{{ r.target_type }}
                      </span>
                    </td>
                    <td style="font-weight:500; color:var(--ink-900);">{{ r.reason }}</td>
                    <td class="preview-cell adm-muted">{{ r.target_detail ?? '—' }}</td>
                    <td class="adm-muted">{{ r.reporter_username ? '@' + r.reporter_username : 'Anonymous' }}</td>
                    <td class="adm-muted" style="white-space:nowrap; font-size:12px;">{{ r.created_at | date:'MMM d, y' }}</td>
                    <td class="adm-text-right">
                      <div class="adm-hstack" style="justify-content:flex-end; gap:6px;">
                        <button class="adm-btn sm outline">Review</button>
                        <button class="adm-btn sm danger">Remove</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="adm-load-more">
            @if (nextCursor()) {
              <button class="adm-btn outline" (click)="loadMore()" [disabled]="loading()">
                @if (loading()) { <mat-spinner diameter="16" /> }
                @else { Load more }
              </button>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .preview-cell {
      max-width: 260px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
})
export class ReportsComponent implements OnInit {
  filters: { label: string; value: FilterType; count: string }[] = [
    { label: 'All',      value: 'all',     count: '—' },
    { label: 'Recipes',  value: 'recipe',  count: '—' },
    { label: 'Comments', value: 'comment', count: '—' },
    { label: 'Users',    value: 'user',    count: '—' },
  ];

  reports = signal<Report[]>([]);
  nextCursor = signal<string | null>(null);
  loading = signal(false);
  activeFilter = signal<FilterType>('all');
  limit = 20;

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.reports.set([]);
    this.nextCursor.set(null);
    this.loading.set(true);
    this.api.getReports({ limit: this.limit, type: this.activeFilter() }).subscribe({
      next: (res) => {
        this.reports.set(res.reports);
        this.nextCursor.set(res.next_cursor);
        this.loading.set(false);
        this.filters[0].count = String(res.reports.length) + (res.next_cursor ? '+' : '');
      },
      error: () => this.loading.set(false),
    });
  }

  loadMore() {
    if (!this.nextCursor()) return;
    this.loading.set(true);
    this.api.getReports({ limit: this.limit, cursor: this.nextCursor()!, type: this.activeFilter() }).subscribe({
      next: (res) => {
        this.reports.update(prev => [...prev, ...res.reports]);
        this.nextCursor.set(res.next_cursor);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setFilter(value: FilterType) {
    this.activeFilter.set(value);
    this.load();
  }
}
