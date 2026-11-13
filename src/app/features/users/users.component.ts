import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule,
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

      <!-- ── Search + filter chips ── -->
      <div class="toolbar">
        <label class="search">
          <mat-icon class="search-icon">search</mat-icon>
          <input class="search-input" type="search" autocomplete="off" spellcheck="false"
                 placeholder="Search username, name or email"
                 aria-label="Search users"
                 [value]="query()"
                 (input)="onQueryInput($any($event.target).value)"
                 (keydown.escape)="clearQuery()" />
          @if (query()) {
            <button class="search-clear" type="button" (click)="clearQuery()" aria-label="Clear search">
              <mat-icon>close</mat-icon>
            </button>
          }
        </label>
        <div class="adm-chips">
          @for (f of filters; track f.value) {
            <button class="adm-chip" [class.active]="activeFilter() === f.value"
                    (click)="setFilter(f.value)">
              {{ f.label }}
            </button>
          }
        </div>
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
                  <tr><td colspan="6" class="adm-empty">
                    @if (query()) { No users match “{{ query() }}”. } @else { No users found. }
                  </td></tr>
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
    .toolbar {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      margin-bottom: 14px;
    }
    .search {
      display: flex; align-items: center; gap: 8px;
      flex: 1 1 260px; max-width: 380px;
      background: var(--surface); border: 1px solid var(--border-strong);
      border-radius: var(--r-md); padding: 7px 10px;
      cursor: text;
    }
    .search:focus-within { border-color: var(--yummy-green); box-shadow: 0 0 0 3px var(--yummy-green-50); }
    .search-icon { font-size: 18px !important; width: 18px !important; height: 18px !important; color: var(--ink-400); }
    .search-input {
      flex: 1; min-width: 0; border: none; outline: none; background: none;
      font: 13px var(--font-admin); color: var(--ink-900);
    }
    .search-input::-webkit-search-cancel-button { display: none; }
    .search-clear {
      display: grid; place-items: center; border: none; background: none; cursor: pointer;
      padding: 0; color: var(--ink-400); border-radius: 50%;
    }
    .search-clear:hover { color: var(--ink-900); }
    .search-clear mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .violations-ok     { color: var(--ink-500); }
    .violations-warn   { color: var(--warn); }
    .violations-danger { color: var(--danger); }
  `],
})
export class UsersComponent implements OnInit, OnDestroy {
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
  query = signal('');
  limit = 20;

  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private request = 0;

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
  ) {}

  ngOnInit() { this.load(); }

  ngOnDestroy() { if (this.searchTimer) clearTimeout(this.searchTimer); }

  /** Search as you type, 300 ms after the last keystroke. */
  onQueryInput(value: string) {
    this.query.set(value);
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 300);
  }

  clearQuery() {
    if (!this.query()) return;
    this.onQueryInput('');
  }

  load() {
    const request = ++this.request;
    this.users.set([]);
    this.nextCursor.set(null);
    this.loading.set(true);
    this.api.getUsers({ limit: this.limit, filter: this.activeFilter(), q: this.query().trim() }).subscribe({
      next: (res) => {
        if (request !== this.request) return;
        this.users.set(res.users);
        this.nextCursor.set(res.next_cursor);
        this.loading.set(false);
      },
      error: () => { if (request === this.request) this.loading.set(false); },
    });
  }

  loadMore() {
    if (!this.nextCursor()) return;
    const request = this.request;
    this.loading.set(true);
    this.api.getUsers({ limit: this.limit, cursor: this.nextCursor()!, filter: this.activeFilter(), q: this.query().trim() }).subscribe({
      next: (res) => {
        if (request !== this.request) return;
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
