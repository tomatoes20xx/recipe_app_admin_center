import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/api.service';
import { CohortCell, CohortsResponse } from '../../core/models';

type Group = 'week' | 'month';

const COUNT_OPTIONS: Record<Group, { value: number; label: string }[]> = {
  week: [
    { value: 4, label: 'Last 4 weeks' },
    { value: 8, label: 'Last 8 weeks' },
    { value: 12, label: 'Last 12 weeks' },
    { value: 26, label: 'Last 26 weeks' },
  ],
  month: [
    { value: 3, label: 'Last 3 months' },
    { value: 6, label: 'Last 6 months' },
    { value: 12, label: 'Last 12 months' },
  ],
};
const DEFAULT_COUNT: Record<Group, number> = { week: 12, month: 6 };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Sequential blue ramp (light → dark) for the heatmap; text flips to white on the dark steps.
const SHADES: { min: number; bg: string; ink: string }[] = [
  { min: 80, bg: '#1c5cab', ink: '#fff' },
  { min: 60, bg: '#2a78d6', ink: '#fff' },
  { min: 45, bg: '#5598e7', ink: '#fff' },
  { min: 30, bg: '#86b6ef', ink: 'var(--ink-900)' },
  { min: 20, bg: '#9ec5f4', ink: 'var(--ink-900)' },
  { min: 10, bg: '#b7d3f6', ink: 'var(--ink-900)' },
  { min: 0.01, bg: '#cde2fb', ink: 'var(--ink-900)' },
];

interface GridCell {
  text: string;
  pct: number | null;
  bg: string | null;
  ink: string | null;
  partial: boolean;
  tooltip: string;
}

/** Cohort retention heatmap with its own range and grouping controls. */
@Component({
  selector: 'app-cohort-grid',
  standalone: true,
  imports: [DecimalPipe, NgTemplateOutlet, MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <div class="adm-card">
      <div class="adm-card-head head">
        <div>
          <div class="adm-card-title">Cohort retention</div>
          <div class="adm-card-sub">Of the people who signed up in each {{ group() }}, how many came back later</div>
        </div>
        <div class="controls">
          <div class="seg" role="radiogroup" aria-label="Group signups by">
            <button type="button" class="seg-btn" [class.active]="group() === 'week'" (click)="setGroup('week')">Weekly</button>
            <button type="button" class="seg-btn" [class.active]="group() === 'month'" (click)="setGroup('month')">Monthly</button>
          </div>
          <select class="range-select" aria-label="Time frame" [value]="count()" (change)="setCount(+$any($event.target).value)">
            @for (o of countOptions(); track o.value) {
              <option [value]="o.value" [selected]="o.value === count()">{{ o.label }}</option>
            }
          </select>
        </div>
      </div>

      <div class="explain">
        <div><strong>How to read it:</strong> each row is everyone who signed up in that {{ group() }}.
          <strong>{{ periodName() }} 1</strong> = days 1–{{ periodDays() }} after signing up,
          <strong>{{ periodName() }} 2</strong> = days {{ periodDays() + 1 }}–{{ periodDays() * 2 }}, and so on.
          A cell is the share of that row who did anything in the app (opened a recipe, searched, liked, cooked…) during that {{ group() }}.
          Darker blue = more people came back.</div>
        <div class="explain-keys">
          <span><span class="key-box blank"></span>not reached yet</span>
          <span><span class="partial-mark">*</span> only part of the row has reached this {{ group() }} so far</span>
          <span>Hover a cell for exact numbers</span>
        </div>
      </div>

      @if (loading()) {
        <div class="adm-loading"><mat-spinner diameter="36" /></div>
      } @else if (error()) {
        <div class="adm-empty">Couldn't load retention. <button class="adm-btn sm outline" (click)="load()">Retry</button></div>
      } @else if (data(); as d) {
        @if (totalUsers() === 0) {
          <div class="adm-empty">Nobody signed up in this time frame.</div>
        } @else {
          <div class="grid-wrap">
            <table class="grid">
              <thead>
                <tr>
                  <th class="sticky c1">Signed up</th>
                  <th class="sticky c2 num">Users</th>
                  @for (p of periodCols(); track p) {
                    <th class="num">{{ periodShort() }} {{ p }}</th>
                  }
                  @if (periodCols().length === 0) { <th class="num muted-head">{{ periodName() }} 1</th> }
                </tr>
              </thead>
              <tbody>
                <tr class="avg-row">
                  <td class="sticky c1">All signups</td>
                  <td class="sticky c2 num">{{ totalUsers() | number }}</td>
                  @for (cell of averageCells(); track $index) {
                    <td class="num"><ng-container *ngTemplateOutlet="cellTpl; context: { $implicit: cell }" /></td>
                  }
                  @if (periodCols().length === 0) { <td class="num"><span class="cell blank" matTooltip="No one has been around for a full {{ group() }} yet"></span></td> }
                </tr>
                @for (row of rows(); track row.label) {
                  <tr [class.empty-row]="row.size === 0">
                    <td class="sticky c1">{{ row.label }}</td>
                    <td class="sticky c2 num">{{ row.size | number }}</td>
                    @for (cell of row.cells; track $index) {
                      <td class="num"><ng-container *ngTemplateOutlet="cellTpl; context: { $implicit: cell }" /></td>
                    }
                    @if (periodCols().length === 0) { <td class="num"><span class="cell blank"></span></td> }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </div>

    <ng-template #cellTpl let-cell>
      @if (cell.pct === null) {
        <span class="cell blank" [matTooltip]="cell.tooltip"></span>
      } @else {
        <span class="cell" [style.background]="cell.bg" [style.color]="cell.ink" [matTooltip]="cell.tooltip">
          {{ cell.text }}@if (cell.partial) {<span class="partial-mark">*</span>}
        </span>
      }
    </ng-template>
  `,
  styles: [`
    .head { flex-wrap: wrap; }
    .controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .seg {
      display: inline-flex; padding: 3px; gap: 2px;
      border: 1px solid var(--border-strong); border-radius: 9px; background: var(--surface);
    }
    .seg-btn {
      border: none; background: none; cursor: pointer; padding: 5px 10px; border-radius: 6px;
      font: 600 12.5px var(--font-admin); color: var(--ink-500);
    }
    .seg-btn:hover { background: var(--hover); color: var(--ink-900); }
    .seg-btn.active { background: var(--ink-900); color: #fff; }
    .range-select {
      font: 600 12.5px var(--font-admin); color: var(--ink-700);
      padding: 7px 10px; border: 1px solid var(--border-strong); border-radius: 9px;
      background: var(--surface); cursor: pointer;
    }

    .explain {
      padding: 12px 20px; border-bottom: 1px solid var(--border);
      font-size: 12.5px; line-height: 1.55; color: var(--ink-700); background: var(--canvas);
    }
    .explain strong { font-weight: 700; color: var(--ink-900); }
    .explain-keys { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 6px; color: var(--ink-500); font-size: 12px; }
    .explain-keys > span { display: inline-flex; align-items: center; gap: 6px; }
    .key-box { display: inline-block; width: 22px; height: 12px; border-radius: 3px; }
    .key-box.blank { background: repeating-linear-gradient(135deg, var(--border) 0 2px, transparent 2px 5px); }

    .grid-wrap { overflow-x: auto; }
    .grid { border-collapse: separate; border-spacing: 0; width: 100%; font-size: 12.5px; }
    .grid th {
      text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em;
      color: var(--ink-500); padding: 10px 6px; border-bottom: 1px solid var(--border); white-space: nowrap;
      background: var(--surface);
    }
    .grid td { padding: 3px; border-bottom: 1px solid var(--border); white-space: nowrap; background: var(--surface); }
    .grid tr:last-child td { border-bottom: none; }
    .grid .num { text-align: center; font-feature-settings: 'tnum'; }
    .grid .c1 { box-sizing: border-box; width: 150px; min-width: 150px; padding-left: 20px; font-weight: 500; color: var(--ink-900); }
    .grid .c2 { min-width: 56px; color: var(--ink-700); border-right: 1px solid var(--border); }
    .sticky { position: sticky; z-index: 1; }
    .sticky.c1 { left: 0; }
    .sticky.c2 { left: 150px; }
    .muted-head { color: var(--ink-300) !important; }

    .avg-row td { background: var(--canvas); font-weight: 700; }
    .avg-row .c1 { color: var(--ink-900); }
    .empty-row td { color: var(--ink-400); }

    .cell {
      display: flex; align-items: center; justify-content: center;
      min-width: 52px; height: 30px; border-radius: 5px;
      font-weight: 700; font-size: 12px; background: var(--hover); color: var(--ink-500);
    }
    .cell.blank { background: repeating-linear-gradient(135deg, var(--border) 0 2px, transparent 2px 5px); }
    .partial-mark { font-weight: 700; margin-left: 1px; }
  `],
})
export class CohortGridComponent implements OnInit {
  private api = inject(ApiService);

  group = signal<Group>('week');
  count = signal(DEFAULT_COUNT.week);
  data = signal<CohortsResponse | null>(null);
  loading = signal(false);
  error = signal(false);
  private request = 0;

  countOptions = computed(() => COUNT_OPTIONS[this.group()]);
  periodName = computed(() => (this.group() === 'week' ? 'Week' : 'Month'));
  periodShort = computed(() => (this.group() === 'week' ? 'Wk' : 'Mo'));
  periodDays = computed(() => (this.group() === 'week' ? 7 : 30));

  periodCols = computed(() => Array.from({ length: this.data()?.periods ?? 0 }, (_, i) => i + 1));
  totalUsers = computed(() => (this.data()?.cohorts ?? []).reduce((s, c) => s + c.size, 0));

  rows = computed(() => {
    const d = this.data();
    if (!d) return [];
    return d.cohorts.map((c) => ({
      label: this.cohortLabel(c.cohort_start, d.group),
      size: c.size,
      cells: c.cells.map((cell, i) => this.toCell(cell, c.size, i + 1, false)),
    }));
  });

  averageCells = computed(() => {
    const d = this.data();
    if (!d) return [];
    const total = this.totalUsers();
    return d.average.map((cell, i) => this.toCell(cell, total, i + 1, true));
  });

  ngOnInit() { this.load(); }

  setGroup(group: Group) {
    if (group === this.group()) return;
    this.group.set(group);
    this.count.set(DEFAULT_COUNT[group]);
    this.load();
  }

  setCount(count: number) {
    this.count.set(count);
    this.load();
  }

  load() {
    const request = ++this.request;
    this.loading.set(true);
    this.error.set(false);
    this.api.getCohorts(this.group(), this.count()).subscribe({
      next: (res) => {
        if (request !== this.request) return;
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => {
        if (request !== this.request) return;
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  private cohortLabel(start: string, group: Group): string {
    const [y, m, d] = start.split('-').map(Number);
    if (group === 'month') return `${MONTHS[m - 1]} ${y}`;
    const end = new Date(y, m - 1, d + 6);
    const endText = end.getMonth() === m - 1
      ? `${end.getDate()}`
      : `${MONTHS[end.getMonth()]} ${end.getDate()}`;
    return `${MONTHS[m - 1]} ${d} – ${endText}`;
  }

  private toCell(cell: CohortCell, size: number, period: number, isAverage: boolean): GridCell {
    const unit = `${this.group()} ${period}`;
    if (cell.eligible === 0) {
      return {
        text: '', pct: null, bg: null, ink: null, partial: false,
        tooltip: size === 0 ? 'No signups' : `Nobody in this ${isAverage ? 'table' : 'row'} has reached ${unit} yet`,
      };
    }
    const pct = (cell.retained / cell.eligible) * 100;
    const shade = SHADES.find((s) => pct >= s.min);
    const partial = cell.eligible < size;
    const base = `${cell.retained} of ${cell.eligible} users came back in ${unit} (${pct.toFixed(pct < 10 && pct > 0 ? 1 : 0)}%)`;
    return {
      text: `${Math.round(pct)}%`,
      pct,
      bg: shade?.bg ?? null,
      ink: shade?.ink ?? null,
      partial,
      tooltip: partial ? `${base}. The other ${size - cell.eligible} haven't reached ${unit} yet.` : base,
    };
  }
}
