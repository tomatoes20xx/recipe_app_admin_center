import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/api.service';
import {
  BanRequest,
  ModAction,
  ModCounts,
  ModItem,
  ModStatusFilter,
  ModTarget,
} from '../../core/models';
import { BanDialogComponent } from '../users/ban-dialog.component';
import { RESOLUTION_TEXT, STATUS_TEXT, modItemTitle } from './moderation-text';

type TypeFilter = 'all' | ModTarget;

/** A button on a queue item. `ban_author` bans the content's author; the rest call the moderation endpoint. */
interface ItemAction {
  key: ModAction | 'ban_author';
  label: string;
  style: 'primary' | 'outline' | 'danger';
  hint: string;
}

const DONE_TEXT: Record<ModAction, string> = {
  dismiss: 'Reports dismissed.',
  hide: 'Hidden from the app.',
  restore: 'Restored.',
  keep_hidden: 'Kept hidden, reports closed.',
  ban: 'User banned, reports closed.',
};

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [DatePipe, MatProgressSpinnerModule, MatDialogModule, MatSnackBarModule, MatTooltipModule],
  template: `
    <div class="adm-page">

      <div class="adm-page-head">
        <div>
          <h2 class="adm-page-title">Moderation</h2>
          <div class="adm-page-sub">Reported and hidden recipes, comments and users, one row per item.</div>
        </div>
      </div>

      <!-- ── Status tabs ── -->
      <div class="adm-tabs" style="margin-bottom:12px;">
        @for (s of statusTabs; track s.value) {
          <button class="adm-tab" [class.active]="status() === s.value" (click)="setStatus(s.value)"
                  [matTooltip]="s.hint">
            {{ s.label }}
            <span class="tab-count">{{ statusCount(s.value) }}</span>
          </button>
        }
      </div>

      <!-- ── Type chips ── -->
      <div class="adm-chips" style="margin-bottom:14px;">
        @for (t of typeChips; track t.value) {
          <button class="adm-chip" [class.active]="type() === t.value" (click)="setType(t.value)">
            {{ t.label }}
            <span class="chip-count">{{ typeCount(t.value) }}</span>
          </button>
        }
      </div>

      <div class="adm-card">
        @if (loading() && items().length === 0) {
          <div class="adm-loading"><mat-spinner diameter="40" /></div>
        } @else if (loadError()) {
          <div class="adm-empty">
            Couldn't load the queue. <button class="adm-btn sm outline" (click)="load()">Retry</button>
          </div>
        } @else if (items().length === 0) {
          <div class="adm-empty">{{ emptyText() }}</div>
        } @else {
          @for (item of items(); track item.target_type + item.target_id) {
            <div class="mod-item" [class.busy]="busyId() === item.target_id">
              <div class="mod-main">
                <div class="mod-title-row">
                  <span class="adm-badge {{ item.target_type }}"><span class="dot"></span>{{ item.target_type }}</span>
                  <span class="mod-title" [class.comment]="item.target_type === 'comment'">{{ title(item) }}</span>
                </div>

                <div class="mod-meta">
                  @if (item.target_type === 'comment' && item.comment?.recipe_title) {
                    <span>on <strong>{{ item.comment!.recipe_title }}</strong></span>
                  }
                  @if (item.target_type !== 'user' && item.author) {
                    <span>
                      by &#64;{{ item.author.username ?? 'unknown' }}
                      @if (!item.author.is_active) { <span class="author-flag bad">banned</span> }
                      @else if (isFuture(item.author.soft_banned_until)) {
                        <span class="author-flag warn">soft banned until {{ item.author.soft_banned_until | date:'MMM d' }}</span>
                      }
                    </span>
                  }
                  @if (item.target_type === 'user') {
                    @if (item.author?.display_name) { <span>{{ item.author!.display_name }}</span> }
                    @if (item.user?.email) { <span>{{ item.user!.email }}</span> }
                    @if (item.user?.ban_reason) { <span>Ban reason: {{ item.user!.ban_reason }}</span> }
                  }
                </div>

                <div class="mod-reports">
                  @if (item.total_reports === 0) {
                    <span class="adm-muted">Hidden without report history</span>
                  } @else {
                    <span class="flag" [class.open]="item.open_reports > 0">
                      🚩 {{ item.open_reports > 0 ? item.open_reports + ' open' : 'no open' }}
                      {{ item.open_reports === 1 ? 'report' : 'reports' }}
                      @if (item.total_reports !== item.open_reports) {
                        <span class="adm-muted">({{ item.total_reports }} total)</span>
                      }
                    </span>
                    <span class="reasons">
                      @for (r of item.reasons; track r.label; let last = $last) {
                        {{ r.label }}@if (r.count > 1) { <span class="adm-muted"> ×{{ r.count }}</span> }@if (!last) {<span class="adm-muted">, </span>}
                      }
                    </span>
                    <span class="adm-muted">· last {{ item.last_activity_at | date:'MMM d, HH:mm' }}</span>
                    <button class="link-btn" (click)="toggle(item)">
                      {{ expanded().has(item.target_id) ? 'Hide reports' : 'Show reports' }}
                    </button>
                  }
                </div>

                @if (expanded().has(item.target_id)) {
                  <div class="report-list">
                    @for (r of item.reports; track r.id) {
                      <div class="report-row" [class.resolved]="r.resolved_at">
                        <span class="report-who">{{ r.reporter_username ? '@' + r.reporter_username : 'Deleted user' }}</span>
                        <span class="report-reason">{{ r.reason }}</span>
                        <span class="report-when">{{ r.created_at | date:'MMM d, y' }}</span>
                        @if (r.resolved_at) {
                          <span class="adm-badge neutral">{{ resolutionText(r) }}</span>
                        } @else {
                          <span class="adm-badge soft">Open</span>
                        }
                      </div>
                    }
                    @if (item.total_reports > item.reports.length) {
                      <div class="adm-muted" style="font-size:12px; padding-top:4px;">
                        Showing the latest {{ item.reports.length }} of {{ item.total_reports }}.
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="mod-side">
                <span class="status-pill {{ statusInfo(item).tone }}" [matTooltip]="statusInfo(item).hint">
                  <span class="dot"></span>{{ statusInfo(item).label }}
                </span>
                <div class="mod-actions">
                  @for (a of actionsFor(item); track a.key) {
                    <button class="adm-btn sm {{ a.style }}" [matTooltip]="a.hint"
                            [disabled]="busyId() !== null" (click)="run(item, a)">
                      {{ a.label }}
                    </button>
                  }
                </div>
              </div>
            </div>
          }

          <div class="adm-load-more">
            @if (nextCursor()) {
              <button class="adm-btn outline" (click)="loadMore()" [disabled]="loading()">
                @if (loading()) { <mat-spinner diameter="16" /> } @else { Load more }
              </button>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .tab-count { color: var(--ink-400); margin-left: 4px; font-feature-settings: 'tnum'; }

    .mod-item {
      display: flex; gap: 16px; align-items: flex-start;
      padding: 14px 20px; border-bottom: 1px solid var(--border);
      transition: opacity .15s;
    }
    .mod-item:last-of-type { border-bottom: none; }
    .mod-item.busy { opacity: .5; }

    .mod-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
    .mod-title-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .mod-title {
      font-size: 14px; font-weight: 600; color: var(--ink-900);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;
    }
    .mod-title.comment { font-weight: 500; white-space: normal; display: -webkit-box;
      -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

    .mod-meta { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12.5px; color: var(--ink-500); }
    .mod-meta strong { font-weight: 600; color: var(--ink-700); }
    .author-flag { font-size: 11px; font-weight: 600; padding: 1px 6px; border-radius: 5px; margin-left: 4px; }
    .author-flag.bad { background: var(--danger-bg); color: var(--danger); }
    .author-flag.warn { background: var(--warn-bg); color: var(--warn); }

    .mod-reports { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; font-size: 12.5px; color: var(--ink-700); }
    .flag { font-weight: 600; color: var(--ink-500); }
    .flag.open { color: var(--danger); }
    .link-btn {
      border: none; background: none; padding: 0; cursor: pointer;
      font: 600 12px var(--font-admin); color: var(--info);
    }
    .link-btn:hover { text-decoration: underline; }

    .report-list {
      margin-top: 6px; padding: 8px 12px; border-radius: 8px;
      background: var(--canvas); display: flex; flex-direction: column; gap: 6px;
    }
    .report-row {
      display: grid; grid-template-columns: 130px minmax(0, 1fr) 90px auto;
      gap: 10px; align-items: baseline; font-size: 12.5px;
    }
    .report-row.resolved { color: var(--ink-400); }
    .report-who { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .report-reason { overflow-wrap: anywhere; }
    .report-when { color: var(--ink-400); white-space: nowrap; }

    .mod-side { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }
    .mod-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; max-width: 320px; }

    .status-pill {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 9px; border-radius: 99px; font-size: 11.5px; font-weight: 600; white-space: nowrap;
    }
    .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .status-pill.ok    { background: var(--success-bg); color: var(--success); }
    .status-pill.warn  { background: var(--warn-bg);    color: var(--warn); }
    .status-pill.bad   { background: var(--danger-bg);  color: var(--danger); }
    .status-pill.muted { background: var(--hover);      color: var(--ink-500); }

    @media (max-width: 760px) {
      .mod-item { flex-direction: column; }
      .mod-side { align-items: flex-start; width: 100%; }
      .mod-actions { justify-content: flex-start; max-width: none; }
      .report-row { grid-template-columns: minmax(0, 1fr) auto; }
      .report-reason { grid-column: 1 / -1; grid-row: 2; }
    }
  `],
})
export class ModerationComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);

  statusTabs: { value: ModStatusFilter; label: string; hint: string }[] = [
    { value: 'needs_review', label: 'Needs review', hint: 'Items with reports nobody has acted on yet' },
    { value: 'hidden', label: 'Hidden', hint: 'Hidden recipes, flagged or removed comments, banned users' },
    { value: 'all', label: 'All', hint: 'Everything that was ever reported or hidden' },
  ];
  typeChips: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'recipe', label: 'Recipes' },
    { value: 'comment', label: 'Comments' },
    { value: 'user', label: 'Users' },
  ];

  status = signal<ModStatusFilter>('needs_review');
  type = signal<TypeFilter>('all');
  items = signal<ModItem[]>([]);
  counts = signal<ModCounts | null>(null);
  nextCursor = signal<string | null>(null);
  loading = signal(false);
  loadError = signal(false);
  busyId = signal<string | null>(null);
  expanded = signal<Set<string>>(new Set());

  title = modItemTitle;
  private request = 0;

  emptyText = computed(() => {
    switch (this.status()) {
      case 'needs_review': return 'Nothing waiting for review 🎉';
      case 'hidden': return 'Nothing is hidden right now.';
      default: return 'Nothing has been reported yet.';
    }
  });

  ngOnInit() { this.load(); }

  setStatus(value: ModStatusFilter) { this.status.set(value); this.load(); }
  setType(value: TypeFilter) { this.type.set(value); this.load(); }

  statusCount(status: ModStatusFilter): number | string {
    const c = this.counts();
    if (!c) return '—';
    const types: ModTarget[] = this.type() === 'all' ? ['recipe', 'comment', 'user'] : [this.type() as ModTarget];
    return types.reduce((sum, t) => sum + c[t][status], 0);
  }

  typeCount(type: TypeFilter): number | string {
    const c = this.counts();
    if (!c) return '—';
    const status = this.status();
    if (type === 'all') return c.recipe[status] + c.comment[status] + c.user[status];
    return c[type][status];
  }

  load() {
    const request = ++this.request;
    this.loading.set(true);
    this.loadError.set(false);
    this.items.set([]);
    this.nextCursor.set(null);
    this.api.getModeration({ type: this.type(), status: this.status(), limit: 20 }).subscribe({
      next: (res) => {
        if (request !== this.request) return;
        this.items.set(res.items);
        this.counts.set(res.counts);
        this.nextCursor.set(res.next_cursor);
        this.loading.set(false);
      },
      error: () => {
        if (request !== this.request) return;
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  loadMore() {
    const cursor = this.nextCursor();
    if (!cursor) return;
    const request = this.request;
    this.loading.set(true);
    this.api.getModeration({ type: this.type(), status: this.status(), limit: 20, cursor }).subscribe({
      next: (res) => {
        if (request !== this.request) return;
        this.items.update((prev) => [...prev, ...res.items]);
        this.counts.set(res.counts);
        this.nextCursor.set(res.next_cursor);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggle(item: ModItem) {
    this.expanded.update((prev) => {
      const next = new Set(prev);
      if (next.has(item.target_id)) next.delete(item.target_id); else next.add(item.target_id);
      return next;
    });
  }

  statusInfo(item: ModItem) { return STATUS_TEXT[item.status] ?? STATUS_TEXT.missing; }

  resolutionText(r: { resolution: ModAction | null }) {
    return r.resolution ? RESOLUTION_TEXT[r.resolution] ?? 'Resolved' : 'Resolved';
  }

  isFuture(date: string | null) { return !!date && new Date(date) > new Date(); }

  /** Buttons for an item, based on what it is and what state it's in. */
  actionsFor(item: ModItem): ItemAction[] {
    const open = item.open_reports > 0;
    const out: ItemAction[] = [];
    const banAuthor = (): ItemAction | null =>
      item.author && item.author.is_active
        ? { key: 'ban_author', label: 'Ban author', style: 'danger', hint: `Soft or permanent ban for @${item.author.username}` }
        : null;
    const close: ItemAction = { key: 'keep_hidden', label: 'Close reports', style: 'outline', hint: 'Mark the reports as handled' };

    switch (item.target_type) {
      case 'recipe':
        if (item.status === 'visible') {
          if (open) out.push({ key: 'dismiss', label: 'Dismiss', style: 'outline', hint: 'Reports are unfounded; keep the recipe visible' });
          out.push({ key: 'hide', label: 'Hide', style: 'danger', hint: 'Hide the recipe from the app (can be restored)' });
        } else if (item.status === 'hidden') {
          out.push({ key: 'restore', label: 'Restore', style: 'primary', hint: 'Make the recipe visible again' });
          if (open) out.push({ key: 'keep_hidden', label: 'Keep hidden', style: 'outline', hint: 'Confirm it stays hidden and close the reports' });
        } else if (open) {
          out.push(close);
        }
        break;

      case 'comment':
        if (item.status === 'visible') {
          if (open) out.push({ key: 'dismiss', label: 'Dismiss', style: 'outline', hint: 'Reports are unfounded; keep the comment' });
          out.push({ key: 'hide', label: 'Remove', style: 'danger', hint: 'Remove the comment from the app (can be restored)' });
        } else if (item.status === 'flagged') {
          out.push({ key: 'restore', label: 'Unflag', style: 'primary', hint: 'Show the comment normally again' });
          out.push({ key: 'hide', label: 'Remove', style: 'danger', hint: 'Remove the comment from the app (can be restored)' });
        } else if (item.status === 'removed') {
          out.push({ key: 'restore', label: 'Restore', style: 'primary', hint: 'Put the comment back' });
          if (open) out.push({ key: 'keep_hidden', label: 'Keep removed', style: 'outline', hint: 'Confirm it stays removed and close the reports' });
        } else if (open) {
          out.push(close);
        }
        break;

      case 'user':
        if (open) {
          out.push(item.status === 'active'
            ? { key: 'dismiss', label: 'Dismiss', style: 'outline', hint: 'Reports are unfounded' }
            : { key: 'dismiss', label: 'Close reports', style: 'outline', hint: 'Mark the reports as handled' });
        }
        if (item.status === 'active' || item.status === 'soft_banned') {
          out.push({ key: 'ban', label: 'Ban', style: 'danger', hint: 'Soft or permanent ban; closes the reports' });
        }
        return out;
    }

    const ban = banAuthor();
    if (ban) out.push(ban);
    return out;
  }

  run(item: ModItem, action: ItemAction) {
    if (action.key === 'ban_author') {
      this.banAuthor(item);
    } else if (action.key === 'ban') {
      this.askBan(item.author?.username ?? 'user', (ban) => this.moderate(item, 'ban', ban));
    } else {
      this.moderate(item, action.key);
    }
  }

  private askBan(username: string, onConfirm: (ban: BanRequest) => void) {
    this.dialog
      .open(BanDialogComponent, { width: '420px', data: { username } })
      .afterClosed()
      .subscribe((result: BanRequest | undefined) => { if (result) onConfirm(result); });
  }

  private banAuthor(item: ModItem) {
    const author = item.author;
    if (!author) return;
    this.askBan(author.username ?? 'user', (ban) => {
      this.busyId.set(item.target_id);
      this.api.banUser(author.id, ban).subscribe({
        next: () => {
          this.busyId.set(null);
          const until = ban.type === 'soft'
            ? new Date(Date.now() + (ban.duration_days ?? 7) * 86_400_000).toISOString()
            : author.soft_banned_until;
          // The author appears on every item they wrote; update them all.
          this.items.update((list) => list.map((i) =>
            i.author?.id === author.id
              ? { ...i, author: { ...i.author, is_active: ban.type === 'soft', soft_banned_until: until } }
              : i,
          ));
          this.snackbar.open(`@${author.username} banned. The reports on this item are still open.`, 'OK', { duration: 4000 });
        },
        error: () => {
          this.busyId.set(null);
          this.snackbar.open('Failed to ban the author.', 'OK', { duration: 4000 });
        },
      });
    });
  }

  private moderate(item: ModItem, action: ModAction, ban?: BanRequest) {
    this.busyId.set(item.target_id);
    this.api.moderate(item.target_type, item.target_id, action, ban).subscribe({
      next: (res) => {
        this.busyId.set(null);
        this.counts.set(res.counts);
        const updated = res.item;
        this.items.update((list) => {
          const stillListed = updated && this.matchesFilter(updated);
          return stillListed
            ? list.map((i) => (i.target_id === item.target_id ? updated : i))
            : list.filter((i) => i.target_id !== item.target_id);
        });
        this.snackbar.open(DONE_TEXT[action], 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.busyId.set(null);
        this.snackbar.open(err?.error?.error ?? 'That action failed.', 'OK', { duration: 4000 });
      },
    });
  }

  private matchesFilter(item: ModItem): boolean {
    if (this.type() !== 'all' && item.target_type !== this.type()) return false;
    switch (this.status()) {
      case 'needs_review': return item.open_reports > 0;
      case 'hidden': return ['hidden', 'flagged', 'removed', 'banned', 'soft_banned'].includes(item.status);
      default: return true;
    }
  }
}
