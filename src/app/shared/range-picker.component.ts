import { Component, input, output } from '@angular/core';
import { StatsRange } from '../core/models';

export const RANGE_LABELS: Record<StatsRange, string> = {
  today: 'Today',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  all: 'All time',
};

const OPTIONS: { value: StatsRange; short: string }[] = [
  { value: 'today', short: 'Today' },
  { value: '7d', short: '7 days' },
  { value: '30d', short: '30 days' },
  { value: '90d', short: '90 days' },
  { value: 'all', short: 'All time' },
];

/** Segmented control for the analytics time range. */
@Component({
  selector: 'app-range-picker',
  standalone: true,
  template: `
    <div class="seg" role="radiogroup" aria-label="Time range">
      @for (o of options; track o.value) {
        <button type="button" role="radio" class="seg-btn"
                [class.active]="value() === o.value"
                [attr.aria-checked]="value() === o.value"
                [attr.title]="labels[o.value]"
                (click)="valueChange.emit(o.value)">
          {{ o.short }}
        </button>
      }
    </div>
  `,
  styles: [`
    .seg {
      display: inline-flex; padding: 3px; gap: 2px;
      background: var(--surface); border: 1px solid var(--border-strong);
      border-radius: 10px; max-width: 100%; overflow-x: auto;
    }
    .seg-btn {
      border: none; background: none; cursor: pointer;
      padding: 6px 11px; border-radius: 7px;
      font: 600 12.5px var(--font-admin); color: var(--ink-500);
      white-space: nowrap; transition: background .12s, color .12s;
    }
    .seg-btn:hover { background: var(--hover); color: var(--ink-900); }
    .seg-btn.active { background: var(--ink-900); color: #fff; }
  `],
})
export class RangePickerComponent {
  value = input.required<StatsRange>();
  valueChange = output<StatsRange>();

  options = OPTIONS;
  labels = RANGE_LABELS;
}
