import { Component, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { Report, ReportTargetType } from '../../core/models';

type FilterType = 'all' | ReportTargetType;

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    DatePipe,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Reports</h1>
      </div>

      <mat-chip-listbox class="filter-chips" (change)="onFilterChange($event.value)">
        @for (f of filters; track f.value) {
          <mat-chip-option [value]="f.value" [selected]="activeFilter() === f.value">
            {{ f.label }}
          </mat-chip-option>
        }
      </mat-chip-listbox>

      <mat-card>
        @if (loading() && reports().length === 0) {
          <div class="loading-state">
            <mat-spinner diameter="40" />
          </div>
        } @else {
          <table mat-table [dataSource]="reports()" class="full-width">

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let r">
                <span class="type-chip type-{{ r.target_type }}">{{ r.target_type }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef>Reason</th>
              <td mat-cell *matCellDef="let r">{{ r.reason }}</td>
            </ng-container>

            <ng-container matColumnDef="preview">
              <th mat-header-cell *matHeaderCellDef>Content</th>
              <td mat-cell *matCellDef="let r" class="preview-cell">
                {{ r.target_detail ?? '—' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="reporter">
              <th mat-header-cell *matHeaderCellDef>Reporter</th>
              <td mat-cell *matCellDef="let r">{{ r.reporter_username || 'Anonymous' }}</td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let r">{{ r.created_at | date:'MMM d, y' }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-state" [attr.colspan]="columns.length">
                No reports found.
              </td>
            </tr>
          </table>

          <div class="load-more">
            @if (nextCursor()) {
              <button mat-stroked-button (click)="loadMore()" [disabled]="loading()">
                @if (loading()) {
                  <mat-spinner diameter="18" />
                } @else {
                  Load More
                }
              </button>
            }
          </div>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    h1 { margin: 0; font-size: 22px; font-weight: 600; }

    .filter-chips { margin-bottom: 16px; }

    .loading-state { display: flex; justify-content: center; padding: 48px; }
    .load-more { display: flex; justify-content: center; padding: 16px; }

    .full-width { width: 100%; }

    .type-chip {
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }
    .type-recipe { background: #e3f2fd; color: #1565c0; }
    .type-comment { background: #f3e5f5; color: #6a1b9a; }
    .type-user { background: #fff3e0; color: #e65100; }

    .preview-cell { max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .empty-state { text-align: center; padding: 40px; color: rgba(0,0,0,0.38); }
    td.mat-cell { padding: 12px 16px; }
    th.mat-header-cell { padding: 12px 16px; font-weight: 600; color: rgba(0,0,0,0.6); }
  `],
})
export class ReportsComponent implements OnInit {
  columns = ['type', 'reason', 'preview', 'reporter', 'date'];
  filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Recipes', value: 'recipe' },
    { label: 'Comments', value: 'comment' },
    { label: 'Users', value: 'user' },
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

  onFilterChange(value: FilterType) {
    this.activeFilter.set(value ?? 'all');
    this.load();
  }
}
