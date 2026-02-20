import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { BanRequest } from '../../core/models';

@Component({
  selector: 'app-ban-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Ban &#64;{{ data.username }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Ban type</mat-label>
          <mat-select formControlName="type">
            <mat-option value="soft">Temporary (soft ban)</mat-option>
            <mat-option value="permanent">Permanent</mat-option>
          </mat-select>
        </mat-form-field>

        @if (form.value.type === 'soft') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Duration (days)</mat-label>
            <input matInput type="number" formControlName="duration_days" min="1" />
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Reason</mat-label>
          <textarea matInput formControlName="reason" rows="3" placeholder="Explain why this user is being banned..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Cancel</button>
      <button mat-flat-button color="warn" [disabled]="form.invalid" (click)="confirm()">
        Ban User
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; min-width: 360px; }
    .full-width { width: 100%; }
  `],
})
export class BanDialogComponent {
  private fb = inject(FormBuilder);
  public ref = inject(MatDialogRef<BanDialogComponent>);
  public data: { username: string } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    type: ['soft', Validators.required],
    duration_days: [7, Validators.min(1)],
    reason: ['', Validators.required],
  });

  confirm() {
    if (this.form.invalid) return;
    const { type, duration_days, reason } = this.form.value;
    const result: BanRequest = { type: type as 'soft' | 'permanent', reason: reason! };
    if (type === 'soft') result.duration_days = duration_days ?? 7;
    this.ref.close(result);
  }
}
