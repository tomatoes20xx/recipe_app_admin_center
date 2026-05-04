import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/api.service';
import { AdminUser, BanRequest } from '../../core/models';
import { BanDialogComponent } from './ban-dialog.component';

type BanFilter = 'all' | 'soft_banned' | 'permanently_banned' | 'has_violations';

function initials(user: AdminUser): string {
  const name = user.display_name || user.username || '';
  const parts = name.split(/[\s._-]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '??';
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    DatePipe,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  template: `
    <div class="adm-page">

      <!-- ── Page head ── -->
      <div class="adm-page-head">
        <div>
          <h2 class="adm-page-title">Users</h2>
          <div class="adm-page-sub">Manage accounts, bans, and violations.</div>
        </div>
        <div class="adm-hstack">
          <button class="adm-btn outline">Export CSV</button>
        </div>
      </div>

      <!-- ── Filter chips ── -->
      <div class="adm-chips" style="margin-bottom:14px;">
        @for (f of filters; track f.value) {
          <button class="adm-chip" [class.active]="activeFilter() === f.value"
                  (click)="setFilter(f.value)">
            {{ f.label }}
          </button>
        }
      </div>

      <!-- ── Table card ── -->
      <div class="adm-card">
        @if (loading() && users().length === 0) {
          <div class="adm-loading"><mat-spinner diameter="40" /></div>
        } @else {
          <div class="adm-table-wrap">
            <table class="adm-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Violations</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @if (users().length === 0) {
                  <tr><td colspan="6" class="adm-empty">No users found.</td></tr>
                }
                @for (u of users(); track u.id) {
                  <tr>
                    <td>
                      <div class="adm-user-cell">
                        <div class="adm-avatar">{{ getInitials(u) }}</div>
                        <div class="adm-cell-name">
                          <span class="primary">{{ u.display_name || u.username }}</span>
                          <span class="secondary">&#64;{{ u.username }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="adm-muted" style="font-size:13px;">{{ u.email }}</td>
                    <td>
                      @if (!u.is_active) {
                        <span class="adm-badge banned"><span class="dot"></span>Permanent</span>
                        @if (u.ban_reason) {
                          <div style="font-size:11px; color:var(--ink-400); margin-top:3px;">{{ u.ban_reason }}</div>
                        }
                      } @else if (u.soft_banned_until && isFuture(u.soft_banned_until)) {
                        <span class="adm-badge soft"
                              [matTooltip]="'Until ' + (u.soft_banned_until | date:'MMM d, y')">
                          <span class="dot"></span>Soft banned
                        </span>
                      } @else {
                        <span class="adm-badge active"><span class="dot"></span>Active</span>
                      }
                    </td>
                    <td>
                      <span [class]="violationClass(u.active_violation_count)"
                            style="font-size:13px; font-weight:600; font-feature-settings:'tnum';">
                        {{ u.active_violation_count }}
                      </span>
                    </td>
                    <td class="adm-muted" style="white-space:nowrap; font-size:12px;">{{ u.created_at | date:'MMM d, y' }}</td>
                    <td class="adm-text-right">
                      @if (!u.is_active || (u.soft_banned_until && isFuture(u.soft_banned_until))) {
                        <button class="adm-btn sm outline" (click)="unban(u)" [disabled]="actionLoading()">
                          Unban
                        </button>
                      } @else {
                        <button class="adm-btn sm danger" (click)="openBanDialog(u)" [disabled]="actionLoading()">
                          Ban
                        </button>
                      }
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
    .violations-ok     { color: var(--ink-500); }
    .violations-warn   { color: var(--warn); }
    .violations-danger { color: var(--danger); }
  `],
})
export class UsersComponent implements OnInit {
  filters: { label: string; value: BanFilter }[] = [
    { label: 'All',                value: 'all' },
    { label: 'Soft banned',        value: 'soft_banned' },
    { label: 'Permanently banned', value: 'permanently_banned' },
    { label: 'Has violations',     value: 'has_violations' },
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

  setFilter(value: BanFilter) { this.activeFilter.set(value); this.load(); }

  isFuture(date: string) { return new Date(date) > new Date(); }

  getInitials(user: AdminUser) { return initials(user); }

  violationClass(count: number) {
    if (count >= 5) return 'violations-danger';
    if (count >= 2) return 'violations-warn';
    return 'violations-ok';
  }
}
