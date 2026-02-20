import { Component, signal, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-page">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-icon class="logo-icon">admin_panel_settings</mat-icon>
          <mat-card-title>Yummy Admin</mat-card-title>
          <mat-card-subtitle>Sign in to continue</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
              <mat-icon matSuffix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password" autocomplete="current-password" />
              <button mat-icon-button matSuffix type="button" (click)="showPassword.set(!showPassword())">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            @if (error()) {
              <p class="error-message">{{ error() }}</p>
            }

            <button
              mat-flat-button
              type="submit"
              class="full-width submit-btn"
              [disabled]="form.invalid || loading()"
            >
              @if (loading()) {
                <mat-spinner diameter="20" />
              } @else {
                Sign In
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-page {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 16px;
    }

    mat-card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-bottom: 24px;
    }

    .logo-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #53B175;
      margin-bottom: 8px;
    }

    mat-card-title { font-size: 22px !important; }
    mat-card-subtitle { margin-top: 4px !important; }

    .full-width { width: 100%; }

    .submit-btn {
      margin-top: 8px;
      height: 44px;
      background-color: #53B175;
      color: #fff;
      font-size: 15px;
    }

    .error-message {
      color: #d32f2f;
      font-size: 13px;
      margin: -4px 0 8px;
    }

    mat-spinner { margin: 0 auto; }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/reports']),
      error: (err) => {
        this.loading.set(false);
        console.error('Login error:', err);
        if (err.message === 'ACCESS_DENIED') {
          this.error.set('Access denied. This account does not have admin privileges.');
        } else if (err.status === 401) {
          this.error.set('Invalid email or password.');
        } else if (err.status === 403) {
          this.error.set('Access denied. This account does not have admin privileges.');
        } else if (err.status === 0) {
          this.error.set('Cannot reach the server. Check the API URL or CORS configuration.');
        } else {
          this.error.set(`Error ${err.status ?? '?'}: ${err.error?.message ?? err.message ?? 'Unknown error'}`);
        }
      },
    });
  }
}
