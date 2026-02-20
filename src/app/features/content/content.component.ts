import { Component, OnInit, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { HiddenComment, HiddenRecipe } from '../../core/models';

type CommentFilter = 'all' | 'reported' | 'flagged_only' | 'deleted_only';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    DatePipe,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Hidden Content</h1>
      </div>

      <mat-tab-group (selectedIndexChange)="onTabChange($event)">
        <!-- ── Recipes ──────────────────────────────────────────────── -->
        <mat-tab label="Recipes">
          <mat-card class="tab-card">
            @if (recipesLoading() && recipes().length === 0) {
              <div class="loading-state"><mat-spinner diameter="40" /></div>
            } @else {
              <table mat-table [dataSource]="recipes()" class="full-width">

                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef>Title</th>
                  <td mat-cell *matCellDef="let r" class="preview-cell">{{ r.title }}</td>
                </ng-container>

                <ng-container matColumnDef="author">
                  <th mat-header-cell *matHeaderCellDef>Author</th>
                  <td mat-cell *matCellDef="let r">&#64;{{ r.author_username }}</td>
                </ng-container>

                <ng-container matColumnDef="reports">
                  <th mat-header-cell *matHeaderCellDef>Reports</th>
                  <td mat-cell *matCellDef="let r">
                    <span class="report-count">{{ r.report_count }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Created</th>
                  <td mat-cell *matCellDef="let r">{{ r.created_at | date:'MMM d, y' }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let r">
                    <button mat-stroked-button color="primary" (click)="restoreRecipe(r)" [disabled]="actionLoading()">
                      <mat-icon>restore</mat-icon> Restore
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="recipeColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: recipeColumns;"></tr>
                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell empty-state" [attr.colspan]="recipeColumns.length">No hidden recipes.</td>
                </tr>
              </table>

              <div class="load-more">
                @if (recipeNextCursor()) {
                  <button mat-stroked-button (click)="loadMoreRecipes()" [disabled]="recipesLoading()">
                    @if (recipesLoading()) { <mat-spinner diameter="18" /> } @else { Load More }
                  </button>
                }
              </div>
            }
          </mat-card>
        </mat-tab>

        <!-- ── Comments ────────────────────────────────────────────── -->
        <mat-tab label="Comments">
          <mat-chip-listbox class="filter-chips" (change)="onCommentFilterChange($event.value)">
            @for (f of commentFilters; track f.value) {
              <mat-chip-option [value]="f.value" [selected]="activeCommentFilter() === f.value">
                {{ f.label }}
              </mat-chip-option>
            }
          </mat-chip-listbox>

          <mat-card class="tab-card">
            @if (commentsLoading() && comments().length === 0) {
              <div class="loading-state"><mat-spinner diameter="40" /></div>
            } @else {
              <table mat-table [dataSource]="comments()" class="full-width">

                <ng-container matColumnDef="content">
                  <th mat-header-cell *matHeaderCellDef>Comment</th>
                  <td mat-cell *matCellDef="let c" class="preview-cell">{{ c.content }}</td>
                </ng-container>

                <ng-container matColumnDef="author">
                  <th mat-header-cell *matHeaderCellDef>Author</th>
                  <td mat-cell *matCellDef="let c">&#64;{{ c.author_username }}</td>
                </ng-container>

                <ng-container matColumnDef="reports">
                  <th mat-header-cell *matHeaderCellDef>Reports</th>
                  <td mat-cell *matCellDef="let c">
                    <span class="report-count">{{ c.report_count }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Created</th>
                  <td mat-cell *matCellDef="let c">{{ c.created_at | date:'MMM d, y' }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let c">
                    <button mat-stroked-button color="primary" (click)="restoreComment(c)" [disabled]="actionLoading()">
                      <mat-icon>restore</mat-icon> Restore
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="commentColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: commentColumns;"></tr>
                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell empty-state" [attr.colspan]="commentColumns.length">No hidden comments.</td>
                </tr>
              </table>

              <div class="load-more">
                @if (commentNextCursor()) {
                  <button mat-stroked-button (click)="loadMoreComments()" [disabled]="commentsLoading()">
                    @if (commentsLoading()) { <mat-spinner diameter="18" /> } @else { Load More }
                  </button>
                }
              </div>
            }
          </mat-card>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { margin-bottom: 16px; }
    h1 { margin: 0; font-size: 22px; font-weight: 600; }
    .filter-chips { display: block; margin-top: 16px; margin-bottom: 8px; }
    .tab-card { margin-top: 16px; }
    .loading-state { display: flex; justify-content: center; padding: 48px; }
    .load-more { display: flex; justify-content: center; padding: 16px; }
    .full-width { width: 100%; }
    .preview-cell { max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .report-count { background: #ffebee; color: #c62828; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 600; }
    .empty-state { text-align: center; padding: 40px; color: rgba(0,0,0,0.38); }
    td.mat-cell { padding: 12px 16px; }
    th.mat-header-cell { padding: 12px 16px; font-weight: 600; color: rgba(0,0,0,0.6); }
  `],
})
export class ContentComponent implements OnInit {
  recipeColumns = ['title', 'author', 'reports', 'date', 'actions'];
  commentColumns = ['content', 'author', 'reports', 'date', 'actions'];
  limit = 20;

  recipes = signal<HiddenRecipe[]>([]);
  recipeNextCursor = signal<string | null>(null);
  recipesLoading = signal(false);

  commentFilters: { label: string; value: CommentFilter }[] = [
    { label: 'All flagged', value: 'all' },
    { label: 'Any report', value: 'reported' },
    { label: 'Flagged only', value: 'flagged_only' },
    { label: 'Deleted only', value: 'deleted_only' },
  ];
  activeCommentFilter = signal<CommentFilter>('all');

  comments = signal<HiddenComment[]>([]);
  commentNextCursor = signal<string | null>(null);
  commentsLoading = signal(false);

  actionLoading = signal(false);

  constructor(private api: ApiService, private snackbar: MatSnackBar) {}

  ngOnInit() {
    this.loadRecipes();
    this.loadComments();
  }

  loadRecipes() {
    this.recipes.set([]);
    this.recipeNextCursor.set(null);
    this.recipesLoading.set(true);
    this.api.getHiddenRecipes({ limit: this.limit }).subscribe({
      next: (res) => { this.recipes.set(res.recipes); this.recipeNextCursor.set(res.next_cursor); this.recipesLoading.set(false); },
      error: () => this.recipesLoading.set(false),
    });
  }

  loadMoreRecipes() {
    if (!this.recipeNextCursor()) return;
    this.recipesLoading.set(true);
    this.api.getHiddenRecipes({ limit: this.limit, cursor: this.recipeNextCursor()! }).subscribe({
      next: (res) => {
        this.recipes.update(prev => [...prev, ...res.recipes]);
        this.recipeNextCursor.set(res.next_cursor);
        this.recipesLoading.set(false);
      },
      error: () => this.recipesLoading.set(false),
    });
  }

  loadComments() {
    this.comments.set([]);
    this.commentNextCursor.set(null);
    this.commentsLoading.set(true);
    this.api.getHiddenComments({ limit: this.limit, filter: this.activeCommentFilter() }).subscribe({
      next: (res) => { this.comments.set(res.comments); this.commentNextCursor.set(res.next_cursor); this.commentsLoading.set(false); },
      error: () => this.commentsLoading.set(false),
    });
  }

  loadMoreComments() {
    if (!this.commentNextCursor()) return;
    this.commentsLoading.set(true);
    this.api.getHiddenComments({ limit: this.limit, cursor: this.commentNextCursor()!, filter: this.activeCommentFilter() }).subscribe({
      next: (res) => {
        this.comments.update(prev => [...prev, ...res.comments]);
        this.commentNextCursor.set(res.next_cursor);
        this.commentsLoading.set(false);
      },
      error: () => this.commentsLoading.set(false),
    });
  }

  restoreRecipe(recipe: HiddenRecipe) {
    this.actionLoading.set(true);
    this.api.restoreRecipe(recipe.id).subscribe({
      next: () => { this.snackbar.open('Recipe restored.', 'OK', { duration: 3000 }); this.actionLoading.set(false); this.loadRecipes(); },
      error: () => { this.snackbar.open('Failed to restore recipe.', 'OK', { duration: 3000 }); this.actionLoading.set(false); },
    });
  }

  restoreComment(comment: HiddenComment) {
    this.actionLoading.set(true);
    this.api.restoreComment(comment.id).subscribe({
      next: () => { this.snackbar.open('Comment restored.', 'OK', { duration: 3000 }); this.actionLoading.set(false); this.loadComments(); },
      error: () => { this.snackbar.open('Failed to restore comment.', 'OK', { duration: 3000 }); this.actionLoading.set(false); },
    });
  }

  onCommentFilterChange(value: CommentFilter) {
    this.activeCommentFilter.set(value ?? 'all');
    this.loadComments();
  }

  onTabChange(index: number) {
    if (index === 0) this.loadRecipes();
    else this.loadComments();
  }
}
