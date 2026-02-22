import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';
import { LoginComponent } from './pages/login/login.component';
import { LandingComponent } from './features/landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, title: 'Yummy' },
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
          { path: '', redirectTo: 'reports', pathMatch: 'full' },
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
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
