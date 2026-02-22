import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-sidenav-container class="shell-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon class="logo-icon">admin_panel_settings</mat-icon>
          <span class="logo-text">Yummy Admin</span>
        </div>

        <mat-nav-list>
          <a mat-list-item routerLink="/admin/reports" routerLinkActive="active-link">
            <mat-icon matListItemIcon>flag</mat-icon>
            <span matListItemTitle>Reports</span>
          </a>
          <a mat-list-item routerLink="/admin/users" routerLinkActive="active-link">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Users</span>
          </a>
          <a mat-list-item routerLink="/admin/content" routerLinkActive="active-link">
            <mat-icon matListItemIcon>restore</mat-icon>
            <span matListItemTitle>Content</span>
          </a>
        </mat-nav-list>

        <div class="sidenav-footer">
          <button mat-button (click)="auth.logout()" class="logout-btn">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .shell-container { height: 100vh; }

    .sidenav {
      width: 220px;
      display: flex;
      flex-direction: column;
      background: #fff;
      color: #fff;
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 16px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .logo-icon { color: #53B175; font-size: 28px; width: 28px; height: 28px; }
    .logo-text { font-size: 16px; font-weight: 600; color: black }

    mat-nav-list { flex: 1; padding-top: 8px; }

    .active-link {
      background: rgba(83, 177, 117, 0.15) !important;
      color: #53B175 !important;
    }
    .active-link mat-icon { color: #53B175 !important; }

    mat-list-item { color: rgba(255,255,255,0.75); border-radius: 8px; margin: 2px 8px; }
    mat-list-item mat-icon { color: rgba(255,255,255,0.5); }

    .sidenav-footer {
      padding: 12px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .logout-btn { color: rgba(255,255,255,0.6); width: 100%; justify-content: flex-start; gap: 8px; }
    .logout-btn:hover { color: #fff; }

    .main-content { background: #f5f5f5; }
  `],
})
export class ShellComponent {
  constructor(public auth: AuthService) {}
}
