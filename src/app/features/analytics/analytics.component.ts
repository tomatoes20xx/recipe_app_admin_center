import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApiService } from '../../core/api.service';
import { AnalyticsStats, AnalyticsEvent } from '../../core/models';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
    FormsModule,
    MatTabsModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  template: `
    <div class="analytics-page">
      <h1 class="page-title">Analytics</h1>

      <mat-tab-group animationDuration="0">

        <!-- ── Overview ── -->
        <mat-tab label="Overview">
          <div class="tab-content">
            @if (statsLoading()) {
              <div class="loading-state"><mat-spinner diameter="40" /></div>
            } @else if (statsError()) {
              <div class="empty-state">
                <mat-icon>error_outline</mat-icon>
                <p>Failed to load analytics data.</p>
                <button mat-stroked-button (click)="loadStats()">Retry</button>
              </div>
            } @else if (stats()) {

              <!-- Summary cards -->
              <div class="stat-cards">
                <mat-card class="stat-card">
                  <mat-icon class="stat-icon">bar_chart</mat-icon>
                  <div class="stat-value">{{ stats()!.overall.total_events | number }}</div>
                  <div class="stat-label">Total Events</div>
                </mat-card>
                <mat-card class="stat-card">
                  <mat-icon class="stat-icon">people</mat-icon>
                  <div class="stat-value">{{ stats()!.overall.unique_users | number }}</div>
                  <div class="stat-label">Unique Users</div>
                </mat-card>
                <mat-card class="stat-card">
                  <mat-icon class="stat-icon">restaurant_menu</mat-icon>
                  <div class="stat-value">{{ stats()!.overall.unique_recipes | number }}</div>
                  <div class="stat-label">Unique Recipes</div>
                </mat-card>
                <mat-card class="stat-card">
                  <mat-icon class="stat-icon">trending_up</mat-icon>
                  <div class="stat-value">{{ stats()!.overall.events_last_24h | number }}</div>
                  <div class="stat-label">Last 24 Hours</div>
                </mat-card>
              </div>

              <!-- Events by type -->
              <mat-card class="section-card">
                <mat-card-header>
                  <mat-card-title>Events by Type</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="type-grid">
                    @for (entry of stats()!.by_type; track entry.event_type) {
                      <div class="type-item">
                        <div class="type-count">{{ entry.total | number }}</div>
                        <div class="type-name">{{ entry.event_type }}</div>
                        <div class="type-sub">{{ entry.last_24h }} today · {{ entry.last_7d }} this week</div>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Top recipes -->
              <mat-card class="section-card">
                <mat-card-header>
                  <mat-card-title>Top Recipes</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <table mat-table [dataSource]="stats()!.top_recipes" class="full-width">
                    <ng-container matColumnDef="rank">
                      <th mat-header-cell *matHeaderCellDef class="rank-col">#</th>
                      <td mat-cell *matCellDef="let r; let i = index" class="rank-col">{{ i + 1 }}</td>
                    </ng-container>
                    <ng-container matColumnDef="title">
                      <th mat-header-cell *matHeaderCellDef>Recipe</th>
                      <td mat-cell *matCellDef="let r">
                        <div class="recipe-title">{{ r.recipe_title }}</div>
                        <div class="recipe-author">by {{ r.author_username }}</div>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="breakdown">
                      <th mat-header-cell *matHeaderCellDef class="breakdown-col">
                        <div class="metrics-header">
                          <span>Views</span>
                          <span>Likes</span>
                          <span>Saves</span>
                          <span>Comments</span>
                        </div>
                      </th>
                      <td mat-cell *matCellDef="let r" class="breakdown-col">
                        <div class="metrics">
                          <span>{{ r.views }}</span>
                          <span>{{ r.likes }}</span>
                          <span>{{ r.bookmarks }}</span>
                          <span>{{ r.comments }}</span>
                        </div>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="total">
                      <th mat-header-cell *matHeaderCellDef class="total-col">Total</th>
                      <td mat-cell *matCellDef="let r" class="total-col">{{ r.total_events | number }}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="recipeColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: recipeColumns;"></tr>
                    <tr class="mat-row" *matNoDataRow>
                      <td class="mat-cell empty-state-cell" colspan="4">No recipe data available.</td>
                    </tr>
                  </table>
                </mat-card-content>
              </mat-card>

              <!-- Daily chart -->
              <mat-card class="section-card">
                <mat-card-header>
                  <mat-card-title>Daily Events — Last 30 Days</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="chart-wrap">
                    @for (day of stats()!.daily_events; track day.date) {
                      <div class="bar-col" [title]="day.date + ': ' + day.total + ' events'">
                        <div class="bar" [style.height.px]="(day.total / maxDaily()) * 100"></div>
                        <span class="day-label">{{ day.date | date:'M/d' }}</span>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </mat-tab>

        <!-- ── Events Log ── -->
        <mat-tab label="Events Log">
          <div class="tab-content">

            <!-- Filters -->
            <div class="filters-row">
              <mat-chip-listbox class="type-chips" (change)="onTypeChange($event.value)">
                <mat-chip-option value="all" [selected]="activeType() === 'all'">All</mat-chip-option>
                @for (t of eventTypes(); track t) {
                  <mat-chip-option [value]="t" [selected]="activeType() === t">{{ t }}</mat-chip-option>
                }
              </mat-chip-listbox>

              <div class="id-filters">
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

                <button mat-flat-button class="apply-btn" (click)="applyFilters()">Apply</button>
              </div>
            </div>

            <!-- Table -->
            @if (eventsLoading() && events().length === 0) {
              <div class="loading-state"><mat-spinner diameter="40" /></div>
            } @else {
              <table mat-table [dataSource]="events()" class="full-width">
                <ng-container matColumnDef="event_type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let e">
                    <span class="type-badge type-badge--{{ e.event_type }}">{{ e.event_type }}</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="user">
                  <th mat-header-cell *matHeaderCellDef>User</th>
                  <td mat-cell *matCellDef="let e">{{ e.user_username ?? '—' }}</td>
                </ng-container>
                <ng-container matColumnDef="recipe">
                  <th mat-header-cell *matHeaderCellDef>Recipe</th>
                  <td mat-cell *matCellDef="let e">{{ e.recipe_title ?? '—' }}</td>
                </ng-container>
                <ng-container matColumnDef="details">
                  <th mat-header-cell *matHeaderCellDef>Details</th>
                  <td mat-cell *matCellDef="let e" class="meta">{{ formatMetadata(e.metadata) }}</td>
                </ng-container>
                <ng-container matColumnDef="created_at">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let e" class="date-col">{{ e.created_at | date:'MMM d · HH:mm' }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="eventColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: eventColumns;"></tr>
                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell empty-state-cell" [attr.colspan]="eventColumns.length">No events found.</td>
                </tr>
              </table>

              @if (nextCursor()) {
                <div class="load-more">
                  <button mat-stroked-button (click)="loadMore()" [disabled]="eventsLoading()">
                    @if (eventsLoading()) { <mat-spinner diameter="18" /> } @else { Load More }
                  </button>
                </div>
              }
            }
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
  styles: [`
    .analytics-page { padding: 24px; max-width: 1100px; }
    .page-title { font-size: 22px; font-weight: 500; margin: 0 0 20px; color: #212121; }
    .tab-content { padding: 20px 0; }

    /* Summary cards */
    .stat-cards { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .stat-card {
      flex: 1; min-width: 140px; padding: 20px 16px;
      display: flex; flex-direction: column; align-items: center; text-align: center;
    }
    .stat-icon { font-size: 32px; width: 32px; height: 32px; color: #53B175; margin-bottom: 8px; }
    .stat-value { font-size: 28px; font-weight: 700; color: #212121; line-height: 1; }
    .stat-label { font-size: 11px; color: #757575; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }

    /* Section cards */
    .section-card { margin-bottom: 20px; }

    /* Events by type grid */
    .type-grid { display: flex; flex-wrap: wrap; gap: 8px; padding-top: 8px; }
    .type-item {
      background: #f5f5f5; border-radius: 8px; padding: 12px 20px;
      min-width: 110px; text-align: center;
    }
    .type-count { font-size: 22px; font-weight: 700; color: #53B175; }
    .type-name { font-size: 11px; color: #444; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    .type-sub { font-size: 10px; color: #999; margin-top: 4px; }

    /* Top recipes table */
    .rank-col { width: 40px; color: #999; }
    .recipe-title { font-weight: 500; font-size: 13px; }
    .recipe-author { font-size: 11px; color: #999; }
    .breakdown-col { width: 240px; }
    .metrics, .metrics-header {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      text-align: center;
    }
    .metrics-header span { font-size: 11px; color: #9e9e9e; font-weight: 500; }
    .metrics span { font-size: 13px; color: #444; }
    .total-col { width: 70px; font-weight: 600; color: #53B175; }

    /* Daily chart */
    .chart-wrap {
      display: flex; align-items: flex-end; gap: 3px;
      height: 120px; padding-bottom: 20px;
    }
    .bar-col {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: flex-end; height: 100%;
    }
    .bar {
      width: 100%; background: #53B175; border-radius: 2px 2px 0 0;
      min-height: 2px; transition: height 0.2s;
    }
    .day-label { font-size: 8px; color: #bbb; margin-top: 3px; }

    /* Events log */
    .filters-row { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    .id-filters { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .id-field { max-width: 220px; }
    .apply-btn { height: 40px; background: #53B175 !important; color: #fff !important; }

    /* Type badges */
    .type-badge {
      border-radius: 4px; padding: 2px 8px; font-size: 12px; font-weight: 500;
      background: #e8f5e9; color: #2e7d32;
    }
    .type-badge--view    { background: #e3f2fd; color: #1565c0; }
    .type-badge--like    { background: #fce4ec; color: #880e4f; }
    .type-badge--comment { background: #fff3e0; color: #e65100; }
    .type-badge--bookmark { background: #f3e5f5; color: #6a1b9a; }
    .type-badge--search  { background: #e8eaf6; color: #283593; }

    .meta { font-size: 12px; color: #777; font-style: italic; }
    .date-col { white-space: nowrap; font-size: 12px; color: #666; }

    /* States */
    .loading-state { display: flex; justify-content: center; padding: 60px 0; }
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 60px 0; color: #9e9e9e; gap: 8px;
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .empty-state-cell { text-align: center; padding: 40px !important; color: #9e9e9e; }

    /* Load more */
    .load-more { display: flex; justify-content: center; padding: 20px 0; }

    .full-width { width: 100%; }
  `],
})
export class AnalyticsComponent implements OnInit {
  private api = inject(ApiService);

  stats = signal<AnalyticsStats | null>(null);
  statsLoading = signal(false);
  statsError = signal(false);

  events = signal<AnalyticsEvent[]>([]);
  nextCursor = signal<string | null>(null);
  eventsLoading = signal(false);

  activeType = signal('all');
  recipeIdValue = '';
  userIdValue = '';

  recipeColumns = ['rank', 'title', 'breakdown', 'total'];
  eventColumns = ['event_type', 'user', 'recipe', 'details', 'created_at'];

  eventTypes = computed(() => (this.stats()?.by_type ?? []).map(e => e.event_type));

  maxDaily = computed(() => {
    const days = this.stats()?.daily_events ?? [];
    return Math.max(...days.map(d => d.total), 1);
  });

  ngOnInit() {
    this.loadStats();
    this.loadEvents();
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
    if (!append) {
      this.events.set([]);
      this.nextCursor.set(null);
    }
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

  onTypeChange(value: string) {
    this.activeType.set(value ?? 'all');
    this.loadEvents();
  }

  applyFilters() {
    this.loadEvents();
  }

  loadMore() {
    if (!this.nextCursor()) return;
    this.loadEvents(true);
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
