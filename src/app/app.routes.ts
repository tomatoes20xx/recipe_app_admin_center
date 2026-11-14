import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';
import { LoginComponent } from './pages/login/login.component';
import { LandingComponent } from './features/landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, title: 'Yummy — შენი ჯიბის სამზარეულო' },
  {
    path: 'download',
    title: 'ჩამოტვირთე Yummy',
    loadComponent: () =>
      import('./features/download/download.component').then((m) => m.DownloadComponent),
  },
  {
    path: 'privacy',
    title: 'Privacy Policy · Yummy',
    data: { doc: 'privacy' },
    loadComponent: () =>
      import('./features/legal/legal-page.component').then((m) => m.LegalPageComponent),
  },
  {
    path: 'terms',
    title: 'მომსახურების წესები · Yummy',
    data: { doc: 'terms' },
    loadComponent: () =>
      import('./features/legal/legal-page.component').then((m) => m.LegalPageComponent),
  },
  {
    path: 'delete-account',
    title: 'ანგარიშის წაშლა · Yummy',
    data: { doc: 'delete' },
    loadComponent: () =>
      import('./features/legal/legal-page.component').then((m) => m.LegalPageComponent),
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
            path: 'moderation',
            title: 'Moderation · Yummy Admin',
            loadComponent: () =>
              import('./features/moderation/moderation.component').then((m) => m.ModerationComponent),
          },
          // Reports and Content were merged into Moderation.
          { path: 'reports', redirectTo: 'moderation', pathMatch: 'full' },
          { path: 'content', redirectTo: 'moderation', pathMatch: 'full' },
          {
            path: 'users',
            title: 'Users · Yummy Admin',
            loadComponent: () =>
              import('./features/users/users.component').then((m) => m.UsersComponent),
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
