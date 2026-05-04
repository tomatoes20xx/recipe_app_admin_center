import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/api.service';
import { HiddenComment, HiddenRecipe } from '../../core/models';

type ActiveTab = 'recipes' | 'comments';
type CommentFilter = 'all' | 'reported' | 'flagged_only' | 'deleted_only';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [DatePipe, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="adm-page">

      <!-- ── Page head ── -->
      <div class="adm-page-head">
        <div>
          <h2 class="adm-page-title">Hidden content</h2>
          <div class="adm-page-sub">Recipes and comments that have been auto-flagged or removed.</div>
        </div>
      </div>

      <!-- ── Tabs ── -->
      <div class="adm-tabs" style="margin-bottom:14px;">
        <button class="adm-tab" [class.active]="activeTab() === 'recipes'" (click)="switchTab('recipes')">
          Recipes
          <span style="color:var(--ink-400); margin-left:4px;">{{ recipes().length }}</span>
        </button>
        <button class="adm-tab" [class.active]="activeTab() === 'comments'" (click)="switchTab('comments')">
          Comments
          <span style="color:var(--ink-400); margin-left:4px;">{{ comments().length }}</span>
        </button>
      </div>

      <!-- ── Recipes tab ── -->
      @if (activeTab() === 'recipes') {
        <div class="adm-card">
          @if (recipesLoading() && recipes().length === 0) {
            <div class="adm-loading"><mat-spinner diameter="40" /></div>
          } @else {
            <div class="adm-table-wrap">
              <table class="adm-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Reports</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @if (recipes().length === 0) {
                    <tr><td colspan="5" class="adm-empty">No hidden recipes.</td></tr>
                  }
                  @for (r of recipes(); track r.id) {
                    <tr>
                      <td class="recipe-title-cell" style="font-weight:500; color:var(--ink-900);">{{ r.title }}</td>
                      <td class="adm-muted">&#64;{{ r.author_username }}</td>
                      <td>
                        <span class="adm-badge banned adm-tabular">{{ r.report_count }} reports</span>
                      </td>
                      <td class="adm-muted" style="white-space:nowrap; font-size:12px;">{{ r.created_at | date:'MMM d, y' }}</td>
                      <td class="adm-text-right">
                        <div class="adm-hstack" style="justify-content:flex-end; gap:6px;">
                          <button class="adm-btn sm outline" [disabled]="actionLoading()">Preview</button>
                          <button class="adm-btn sm primary" (click)="restoreRecipe(r)" [disabled]="actionLoading()">
                            Restore
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="adm-load-more">
              @if (recipeNextCursor()) {
                <button class="adm-btn outline" (click)="loadMoreRecipes()" [disabled]="recipesLoading()">
                  @if (recipesLoading()) { <mat-spinner diameter="16" /> } @else { Load more }
                </button>
              }
            </div>
          }
        </div>
      }

      <!-- ── Comments tab ── -->
      @if (activeTab() === 'comments') {
        <div class="adm-chips" style="margin-bottom:12px;">
          @for (f of commentFilters; track f.value) {
            <button class="adm-chip" [class.active]="activeCommentFilter() === f.value"
                    (click)="setCommentFilter(f.value)">
              {{ f.label }}
            </button>
          }
        </div>

        <div class="adm-card">
          @if (commentsLoading() && comments().length === 0) {
            <div class="adm-loading"><mat-spinner diameter="40" /></div>
          } @else {
            <div class="adm-table-wrap">
              <table class="adm-table">
                <thead>
                  <tr>
                    <th>Comment</th>
                    <th>Author</th>
                    <th>Reports</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @if (comments().length === 0) {
                    <tr><td colspan="5" class="adm-empty">No hidden comments.</td></tr>
                  }
                  @for (c of comments(); track c.id) {
                    <tr>
                      <td class="comment-content-cell adm-muted">{{ c.content }}</td>
                      <td class="adm-muted">&#64;{{ c.author_username }}</td>
                      <td>
                        <span class="adm-badge banned adm-tabular">{{ c.report_count }} reports</span>
                      </td>
                      <td class="adm-muted" style="white-space:nowrap; font-size:12px;">{{ c.created_at | date:'MMM d, y' }}</td>
                      <td class="adm-text-right">
                        <button class="adm-btn sm primary" (click)="restoreComment(c)" [disabled]="actionLoading()">
                          Restore
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="adm-load-more">
              @if (commentNextCursor()) {
                <button class="adm-btn outline" (click)="loadMoreComments()" [disabled]="commentsLoading()">
                  @if (commentsLoading()) { <mat-spinner diameter="16" /> } @else { Load more }
                </button>
              }
            </div>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    .recipe-title-cell  { max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .comment-content-cell { max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  `],
})
export class ContentComponent implements OnInit {
  limit = 20;

  activeTab = signal<ActiveTab>('recipes');

  recipes = signal<HiddenRecipe[]>([]);
  recipeNextCursor = signal<string | null>(null);
  recipesLoading = signal(false);

  commentFilters: { label: string; value: CommentFilter }[] = [
    { label: 'All flagged',  value: 'all' },
    { label: 'Any report',  value: 'reported' },
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

  switchTab(tab: ActiveTab) {
    this.activeTab.set(tab);
    if (tab === 'recipes' && this.recipes().length === 0) this.loadRecipes();
    if (tab === 'comments' && this.comments().length === 0) this.loadComments();
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

  setCommentFilter(value: CommentFilter) {
    this.activeCommentFilter.set(value);
    this.loadComments();
  }
}
