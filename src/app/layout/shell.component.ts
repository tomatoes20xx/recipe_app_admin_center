import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <div class="shell" [class.nav-open]="sidebarOpen()">

      <!-- Mobile overlay -->
      <div class="overlay" (click)="closeSidebar()"></div>

      <!-- ── Sidebar ── -->
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2c2 3 3 5 3 8a3 3 0 0 1-6 0c0-3 1-5 3-8z" fill="white"/>
              <path d="M5 14c2.5 4 5 6 7 6s4.5-2 7-6" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <div class="brand-name">Yummy Admin</div>
            <div class="brand-sub">Trust &amp; Safety</div>
          </div>
        </div>

        <nav class="nav">
          <div class="nav-label">Workspace</div>
          @for (item of navItems; track item.id) {
            <a class="nav-item"
               [routerLink]="item.path"
               routerLinkActive="active"
               (click)="closeSidebar()">
              <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
              <span>{{ item.label }}</span>
            </a>
          }
          <div class="nav-label">Account</div>
          <button class="nav-item" (click)="auth.logout()">
            <mat-icon class="nav-icon">logout</mat-icon>
            <span>Logout</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <div class="user-pill">
            <div class="u-avatar">{{ userInitials }}</div>
            <div class="u-info">
              <div class="u-name">{{ userDisplay }}</div>
              <div class="u-role">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- ── Main ── -->
      <div class="main">
        <header class="topbar">
          <button class="hamburger" (click)="toggleSidebar()">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="tb-spacer"></div>
          <div class="tb-search">
            <mat-icon class="tb-search-icon">search</mat-icon>
            <input class="tb-search-input" placeholder="Search users, recipes, reports…" />
          </div>
          <button class="tb-icon-btn">
            <mat-icon>notifications_none</mat-icon>
          </button>
        </header>

        <div class="content-wrap">
          <router-outlet />
        </div>
      </div>

      <!-- ── Mobile bottom nav ── -->
      <nav class="bottom-nav">
        @for (item of navItems; track item.id) {
          <a class="bnav-item"
             [routerLink]="item.path"
             routerLinkActive="active"
             (click)="closeSidebar()">
            <mat-icon>{{ item.icon }}</mat-icon>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      font-family: var(--font-admin);
      -webkit-font-smoothing: antialiased;
      background: var(--canvas);
      position: relative;
    }

    /* ── Overlay ── */
    .overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 40;
    }
    @media (max-width: 768px) {
      .nav-open .overlay { display: block; }
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 240px;
      flex-shrink: 0;
      background: var(--rail);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      overflow-x: hidden;
    }
    .sidebar::-webkit-scrollbar { width: 0; }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 50;
        transform: translateX(-100%);
        transition: transform 0.22s cubic-bezier(0.2, 0.7, 0.3, 1);
        width: 260px;
        box-shadow: var(--shadow-md);
      }
      .nav-open .sidebar {
        transform: translateX(0);
      }
    }

    /* Brand */
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 18px 18px 22px;
      flex-shrink: 0;
    }
    .brand-mark {
      width: 32px;
      height: 32px;
      border-radius: 9px;
      background: var(--yummy-green);
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .brand-name {
      font-size: 14.5px;
      font-weight: 700;
      color: var(--ink-900);
      letter-spacing: -0.01em;
      line-height: 1.2;
    }
    .brand-sub {
      font-size: 11px;
      color: var(--ink-400);
      font-weight: 500;
      margin-top: 1px;
    }

    /* Nav */
    .nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 0 10px;
      flex: 1;
    }
    .nav-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--ink-400);
      font-weight: 600;
      padding: 14px 10px 6px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: 8px;
      color: var(--ink-700);
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      background: none;
      text-align: left;
      width: 100%;
      text-decoration: none;
      font-family: var(--font-admin);
      transition: background 0.12s;
    }
    .nav-item:hover { background: var(--hover); }
    .nav-item.active {
      background: var(--yummy-green-50);
      color: var(--yummy-green-600) !important;
    }
    .nav-item.active .nav-icon { color: var(--yummy-green-600) !important; }
    .nav-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: var(--ink-500);
      flex-shrink: 0;
    }

    /* Footer */
    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid var(--border);
      flex-shrink: 0;
    }
    .user-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      border-radius: 10px;
    }
    .u-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FFD37A, #FF9054);
      color: white;
      display: grid;
      place-items: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .u-info { flex: 1; min-width: 0; }
    .u-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--ink-900);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .u-role { font-size: 11px; color: var(--ink-400); }

    /* ── Main area ── */
    .main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Topbar */
    .topbar {
      height: 64px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 24px;
      gap: 12px;
      flex-shrink: 0;
    }

    .hamburger {
      display: none;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--ink-700);
      padding: 6px;
      border-radius: 8px;
      line-height: 1;
    }
    .hamburger mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .hamburger:hover { background: var(--hover); }

    @media (max-width: 768px) {
      .hamburger { display: flex; align-items: center; }
    }

    .tb-spacer { flex: 1; }

    .tb-search {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--canvas);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 8px 12px;
      width: 260px;
      color: var(--ink-400);
    }
    .tb-search-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
      flex-shrink: 0;
    }
    .tb-search-input {
      border: none;
      background: none;
      outline: none;
      flex: 1;
      font-size: 13px;
      color: var(--ink-700);
      font-family: var(--font-admin);
      min-width: 0;
    }
    .tb-search-input::placeholder { color: var(--ink-400); }

    @media (max-width: 640px) {
      .tb-search { display: none; }
    }

    .tb-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 9px;
      border: 1px solid var(--border);
      background: var(--surface);
      display: grid;
      place-items: center;
      color: var(--ink-700);
      cursor: pointer;
    }
    .tb-icon-btn:hover { background: var(--hover); }
    .tb-icon-btn mat-icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
    }

    /* Content scroll area */
    .content-wrap {
      flex: 1;
      overflow-y: auto;
      background: var(--canvas);
    }
    .content-wrap::-webkit-scrollbar { width: 8px; }
    .content-wrap::-webkit-scrollbar-thumb {
      background: var(--border-strong);
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .content-wrap { padding-bottom: 64px; }
    }

    /* ── Mobile bottom nav ── */
    .bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: var(--surface);
      border-top: 1px solid var(--border);
      grid-template-columns: repeat(5, 1fr);
      z-index: 30;
    }
    @media (max-width: 768px) {
      .bottom-nav { display: grid; }
    }

    .bnav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      font-size: 10px;
      color: var(--ink-400);
      font-weight: 500;
      text-decoration: none;
      font-family: var(--font-admin);
      transition: color 0.12s;
    }
    .bnav-item mat-icon {
      font-size: 22px !important;
      width: 22px !important;
      height: 22px !important;
    }
    .bnav-item.active { color: var(--yummy-green-600); }
  `],
})
export class ShellComponent {
  constructor(public auth: AuthService) {}

  sidebarOpen = signal(false);

  navItems = [
    { id: 'overview',   label: 'Overview',   icon: 'dashboard', path: '/admin/overview' },
    { id: 'reports',    label: 'Reports',    icon: 'flag',      path: '/admin/reports' },
    { id: 'users',      label: 'Users',      icon: 'people',    path: '/admin/users' },
    { id: 'content',    label: 'Content',    icon: 'layers',    path: '/admin/content' },
    { id: 'analytics',  label: 'Analytics',  icon: 'insights',  path: '/admin/analytics' },
  ];

  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  closeSidebar()  { this.sidebarOpen.set(false); }

  get userInitials(): string {
    const token = this.auth.token();
    if (!token) return 'AD';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const email: string = payload.sub || payload.email || '';
      if (!email) return 'AD';
      const local = email.split('@')[0];
      const parts = local.split(/[._\-]/);
      return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : local.slice(0, 2).toUpperCase();
    } catch {
      return 'AD';
    }
  }

  get userDisplay(): string {
    const token = this.auth.token();
    if (!token) return 'Administrator';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.email || 'Administrator';
    } catch {
      return 'Administrator';
    }
  }
}
