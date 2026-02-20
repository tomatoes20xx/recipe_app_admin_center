import { Component, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { AdminUser, BanRequest } from '../../core/models';
import { BanDialogComponent } from './ban-dialog.component';

type BanFilter = 'all' | 'soft_banned' | 'permanently_banned' | 'has_violations';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    DatePipe,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Users</h1>
      </div>

      <mat-chip-listbox class="filter-chips" (change)="onFilterChange($event.value)">
        @for (f of filters; track f.value) {
          <mat-chip-option [value]="f.value" [selected]="activeFilter() === f.value">
            {{ f.label }}
          </mat-chip-option>
        }
      </mat-chip-listbox>

      <mat-card>
        @if (loading() && users().length === 0) {
          <div class="loading-state"><mat-spinner diameter="40" /></div>
        } @else {
          <table mat-table [dataSource]="users()" class="full-width">

            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef>User</th>
              <td mat-cell *matCellDef="let u">
                <div class="user-cell">
                  <span class="display-name">{{ u.display_name ?? u.username }}</span>
                  <span class="username">&#64;{{ u.username }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let u">{{ u.email }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let u">
                @if (!u.is_active) {
                  <span class="status-chip status-banned">Permanently Banned</span>
                } @else if (u.soft_banned_until && isFuture(u.soft_banned_until)) {
                  <span class="status-chip status-soft" [matTooltip]="'Until ' + (u.soft_banned_until | date:'MMM d, y')">
                    Soft Banned
                  </span>
                } @else {
                  <span class="status-chip status-active">Active</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="violations">
              <th mat-header-cell *matHeaderCellDef>Violations</th>
              <td mat-cell *matCellDef="let u">
                <span [class]="violationClass(u.active_violation_count)">{{ u.active_violation_count }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="joined">
              <th mat-header-cell *matHeaderCellDef>Joined</th>
              <td mat-cell *matCellDef="let u">{{ u.created_at | date:'MMM d, y' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let u">
                @if (!u.is_active || (u.soft_banned_until && isFuture(u.soft_banned_until))) {
                  <button mat-stroked-button color="primary" (click)="unban(u)" [disabled]="actionLoading()">
                    Unban
                  </button>
                } @else {
                  <button mat-stroked-button color="warn" (click)="openBanDialog(u)" [disabled]="actionLoading()">
                    Ban
                  </button>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-state" [attr.colspan]="columns.length">No users found.</td>
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

    .user-cell { display: flex; flex-direction: column; }
    .display-name { font-weight: 500; }
    .username { font-size: 12px; color: rgba(0,0,0,0.5); }

    .status-chip { padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-active { background: #e8f5e9; color: #2e7d32; }
    .status-soft { background: #fff3e0; color: #e65100; cursor: help; }
    .status-banned { background: #ffebee; color: #c62828; }

    .violations-ok { color: rgba(0,0,0,0.6); }
    .violations-warn { color: #e65100; font-weight: 600; }
    .violations-danger { color: #c62828; font-weight: 700; }

    .empty-state { text-align: center; padding: 40px; color: rgba(0,0,0,0.38); }
    td.mat-cell { padding: 12px 16px; }
    th.mat-header-cell { padding: 12px 16px; font-weight: 600; color: rgba(0,0,0,0.6); }
  `],
})
export class UsersComponent implements OnInit {
  columns = ['user', 'email', 'status', 'violations', 'joined', 'actions'];
  filters: { label: string; value: BanFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Soft Banned', value: 'soft_banned' },
    { label: 'Permanently Banned', value: 'permanently_banned' },
    { label: 'Has Violations', value: 'has_violations' },
  ];

  users = signal<AdminUser[]>([]);
  nextCursor = signal<string | null>(null);
  loading = signal(false);
  actionLoading = signal(false);
  activeFilter = signal<BanFilter>('all');
  limit = 20;

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.users.set([]);
    this.nextCursor.set(null);
    this.loading.set(true);
    this.api.getUsers({ limit: this.limit, filter: this.activeFilter() }).subscribe({
      next: (res) => { this.users.set(res.users); this.nextCursor.set(res.next_cursor); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  loadMore() {
    if (!this.nextCursor()) return;
    this.loading.set(true);
    this.api.getUsers({ limit: this.limit, cursor: this.nextCursor()!, filter: this.activeFilter() }).subscribe({
      next: (res) => {
        this.users.update(prev => [...prev, ...res.users]);
        this.nextCursor.set(res.next_cursor);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openBanDialog(user: AdminUser) {
    const ref = this.dialog.open(BanDialogComponent, {
      width: '420px',
      data: { username: user.username },
    });
    ref.afterClosed().subscribe((result: BanRequest | undefined) => {
      if (result) this.ban(user.id, result);
    });
  }

  ban(userId: string, body: BanRequest) {
    this.actionLoading.set(true);
    this.api.banUser(userId, body).subscribe({
      next: () => { this.snackbar.open('User banned.', 'OK', { duration: 3000 }); this.actionLoading.set(false); this.load(); },
      error: () => { this.snackbar.open('Failed to ban user.', 'OK', { duration: 3000 }); this.actionLoading.set(false); },
    });
  }

  unban(user: AdminUser) {
    this.actionLoading.set(true);
    this.api.unbanUser(user.id).subscribe({
      next: () => { this.snackbar.open('User unbanned.', 'OK', { duration: 3000 }); this.actionLoading.set(false); this.load(); },
      error: () => { this.snackbar.open('Failed to unban user.', 'OK', { duration: 3000 }); this.actionLoading.set(false); },
    });
  }

  onFilterChange(value: BanFilter) { this.activeFilter.set(value ?? 'all'); this.load(); }

  isFuture(date: string) { return new Date(date) > new Date(); }

  violationClass(count: number) {
    if (count >= 5) return 'violations-danger';
    if (count >= 2) return 'violations-warn';
    return 'violations-ok';
  }
}
