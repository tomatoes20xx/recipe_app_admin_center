import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';
import { LoginComponent } from './pages/login/login.component';
import { LandingComponent } from './features/landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, title: 'Yummy' },
  {
    path: 'download',
    title: 'Coming Soon · Yummy',
    loadComponent: () =>
      import('./features/coming-soon/coming-soon.component').then((m) => m.ComingSoonComponent),
  },
  {
    path: 'admin',
    children: [
      { path: 'login', component: LoginComponent, title: 'Yummy Admin' },
      {
        path: '',
        component: ShellComponent,
        canActivate: [authGuard],
        title: 'Yummy Admin',
        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          {
            path: 'overview',
            title: 'Overview · Yummy Admin',
            loadComponent: () =>
              import('./features/overview/overview.component').then((m) => m.OverviewComponent),
          },
          {
            path: 'reports',
            title: 'Reports · Yummy Admin',
            loadComponent: () =>
              import('./features/reports/reports.component').then((m) => m.ReportsComponent),
          },
          {
            path: 'users',
            title: 'Users · Yummy Admin',
            loadComponent: () =>
              import('./features/users/users.component').then((m) => m.UsersComponent),
          },
          {
            path: 'content',
            title: 'Content · Yummy Admin',
            loadComponent: () =>
              import('./features/content/content.component').then((m) => m.ContentComponent),
          },
          {
            path: 'analytics',
            title: 'Analytics · Yummy Admin',
            loadComponent: () =>
              import('./features/analytics/analytics.component').then((m) => m.AnalyticsComponent),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
