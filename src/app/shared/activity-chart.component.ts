import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AnalyticsSeriesPoint, StatsBucket } from '../core/models';
import { eventColor, eventLabel, eventOrder } from '../core/events';

interface Segment {
  type: string;
  count: number;
  px: number;
  color: string;
  ink: string;
}

interface Column {
  label: string;
  longLabel: string;
  total: number;
  segments: Segment[];
  showTick: boolean;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Parses the backend's local `YYYY-MM-DDTHH:mm` bucket start without timezone shifts. */
function parseLocal(start: string) {
  const [d, t = '00:00'] = start.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [h] = t.split(':').map(Number);
  return { y, m, day, h };
}

function bucketLabels(start: string, bucket: StatsBucket): { short: string; long: string } {
  const { y, m, day, h } = parseLocal(start);
  const mon = MONTHS[m - 1];
  switch (bucket) {
    case 'hour': {
      const hh = String(h).padStart(2, '0');
      return { short: `${hh}:00`, long: `${mon} ${day}, ${hh}:00–${String((h + 1) % 24).padStart(2, '0')}:00` };
    }
    case 'week':
      return { short: `${mon} ${day}`, long: `Week of ${mon} ${day}, ${y}` };
    case 'month':
      return { short: `${mon} ${String(y).slice(2)}`, long: `${mon} ${y}` };
    default:
      return { short: `${mon} ${day}`, long: `${mon} ${day}, ${y}` };
  }
}

/** Round axis step (1, 2, 2.5, 5 × 10ⁿ) giving about `target` gridlines above zero. */
function niceStep(max: number, target = 4): number {
  if (max <= 0) return 1;
  const raw = max / target;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow;
  return Math.max(1, Math.round(step));
}

/** White or near-black text, whichever reads better on the fill. */
function inkFor(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.28 ? '#15181D' : '#FFFFFF';
}

/** Minimum segment height (px) that fits its count inside. */
const LABEL_MIN_PX = 15;

/**
 * Stacked column chart of event counts per time bucket, one color per event type.
 * Gridlines carry the y-axis values; each segment shows its count when it is tall and
 * wide enough, the column total sits on top, and hovering a column lists every type.
 */
@Component({
  selector: 'app-activity-chart',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    @if (!hasData()) {
      <div class="sbc-empty" [style.height.px]="height()">No activity in this period</div>
    } @else {
      <div class="sbc" (mouseleave)="hoverIndex.set(null)">
        <div class="sbc-plot" [style.height.px]="height()">
          <div class="sbc-yaxis" aria-hidden="true">
            @for (t of ticks(); track t) {
              <span class="sbc-ytick" [style.bottom.%]="(t / axisMax()) * 100">{{ t | number }}</span>
            }
          </div>

          <div class="sbc-area">
            @for (t of ticks(); track t) {
              <div class="sbc-grid" [class.base]="t === 0" [style.bottom.%]="(t / axisMax()) * 100"></div>
            }

            <div class="sbc-cols" [style.gap.px]="columns().length > 40 ? 1 : 3">
              @for (col of columns(); track $index; let i = $index) {
                <div class="sbc-col"
                     [class.dim]="hoverIndex() !== null && hoverIndex() !== i"
                     (mouseenter)="hoverIndex.set(i)"
                     [attr.aria-label]="col.longLabel + ': ' + col.total + ' events'">
                  <div class="sbc-stack">
                    @if (col.total > 0) {
                      <span class="sbc-total">{{ col.total | number }}</span>
                    }
                    @for (s of col.segments; track s.type) {
                      <div class="sbc-seg"
                           [class.faded]="hoverType() !== null && hoverType() !== s.type"
                           [style.height.px]="s.px"
                           [style.background]="s.color">
                        @if (s.px >= labelMinPx) {
                          <span class="sbc-seg-label" [style.color]="s.ink">{{ s.count }}</span>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            @if (hovered(); as h) {
              <div class="sbc-tip" [class.flip]="h.flip" [style.left.%]="h.leftPct">
                <div class="sbc-tip-head">
                  <span>{{ h.col.longLabel }}</span>
                  <strong>{{ h.col.total | number }}</strong>
                </div>
                @for (s of h.rows; track s.type) {
                  <div class="sbc-tip-row">
                    <span class="sbc-swatch" [style.background]="s.color"></span>
                    <span class="sbc-tip-name">{{ label(s.type) }}</span>
                    <span class="sbc-tip-val">{{ s.count | number }}</span>
                  </div>
                } @empty {
                  <div class="sbc-tip-row sbc-muted">No events</div>
                }
              </div>
            }
          </div>
        </div>

        <div class="sbc-xaxis" [style.gap.px]="columns().length > 40 ? 1 : 3">
          @for (col of columns(); track $index) {
            <div class="sbc-xcell">
              @if (col.showTick) { <span class="sbc-xlabel">{{ col.label }}</span> }
            </div>
          }
        </div>

        <div class="sbc-legend">
          @for (l of legend(); track l.type) {
            <button type="button" class="sbc-legend-item"
                    [class.faded]="hoverType() !== null && hoverType() !== l.type"
                    (mouseenter)="hoverType.set(l.type)" (mouseleave)="hoverType.set(null)"
                    (focus)="hoverType.set(l.type)" (blur)="hoverType.set(null)">
              <span class="sbc-swatch" [style.background]="l.color"></span>
              {{ label(l.type) }}
              <span class="sbc-legend-val">{{ l.total | number }}</span>
            </button>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; font-family: var(--font-admin); }

    .sbc-empty {
      display: flex; align-items: center; justify-content: center;
      color: var(--ink-400); font-size: 13px;
    }

    .sbc-plot { display: flex; position: relative; padding-top: 18px; box-sizing: content-box; }
    .sbc-yaxis { position: relative; width: 36px; flex-shrink: 0; }
    .sbc-ytick {
      position: absolute; right: 8px; transform: translateY(50%);
      font-size: 10.5px; color: var(--ink-400); font-feature-settings: 'tnum';
      white-space: nowrap;
    }

    .sbc-area { position: relative; flex: 1; min-width: 0; }
    .sbc-grid {
      position: absolute; left: 0; right: 0; height: 0;
      border-top: 1px dashed var(--border);
    }
    .sbc-grid.base { border-top: 1px solid var(--border-strong, #D5D9E0); }

    .sbc-cols { position: absolute; inset: 0; display: flex; align-items: flex-end; }
    .sbc-col {
      flex: 1 1 0; min-width: 0; height: 100%;
      display: flex; align-items: flex-end; justify-content: center;
      container-type: inline-size;
      cursor: default;
      transition: opacity .12s;
    }
    .sbc-col.dim { opacity: .45; }

    .sbc-stack {
      position: relative; width: 100%; max-width: 56px;
      display: flex; flex-direction: column-reverse;
    }
    .sbc-seg {
      position: relative; flex-shrink: 0; box-sizing: border-box;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
      transition: opacity .12s;
    }
    /* 2px surface gap between stacked segments */
    .sbc-seg + .sbc-seg { border-bottom: 2px solid var(--surface); }
    .sbc-seg:last-child { border-radius: 4px 4px 0 0; }
    .sbc-seg.faded { opacity: .2; }
    .sbc-seg-label {
      font-size: 10.5px; font-weight: 700; line-height: 1;
      font-feature-settings: 'tnum'; pointer-events: none;
    }
    .sbc-total {
      position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
      margin-bottom: 3px;
      font-size: 10.5px; font-weight: 700; color: var(--ink-700);
      font-feature-settings: 'tnum'; white-space: nowrap; pointer-events: none;
    }
    @container (max-width: 17px) {
      .sbc-seg-label, .sbc-total { display: none; }
    }

    .sbc-xaxis { display: flex; margin-left: 36px; margin-top: 6px; }
    .sbc-xcell { flex: 1 1 0; min-width: 0; position: relative; height: 14px; }
    .sbc-xlabel {
      position: absolute; left: 50%; transform: translateX(-50%);
      font-size: 10.5px; color: var(--ink-400); white-space: nowrap;
    }

    .sbc-legend { display: flex; flex-wrap: wrap; gap: 4px 6px; margin-top: 14px; }
    .sbc-legend-item {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 3px 8px; border-radius: 6px; border: none; background: none;
      font: inherit; font-size: 12px; color: var(--ink-700); cursor: default;
      transition: opacity .12s, background .12s;
    }
    .sbc-legend-item:hover, .sbc-legend-item:focus-visible { background: var(--hover); outline: none; }
    .sbc-legend-item.faded { opacity: .45; }
    .sbc-legend-val { color: var(--ink-400); font-feature-settings: 'tnum'; }
    .sbc-swatch { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }

    .sbc-tip {
      position: absolute; top: 0; z-index: 5;
      transform: translateX(12px);
      min-width: 190px; max-width: 240px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; box-shadow: var(--shadow-md);
      padding: 10px 12px; pointer-events: none;
    }
    .sbc-tip.flip { transform: translateX(calc(-100% - 12px)); }
    .sbc-tip-head {
      display: flex; justify-content: space-between; gap: 12px;
      font-size: 12px; color: var(--ink-500); margin-bottom: 6px;
    }
    .sbc-tip-head strong { color: var(--ink-900); font-feature-settings: 'tnum'; }
    .sbc-tip-row {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; color: var(--ink-700); padding: 2px 0;
    }
    .sbc-tip-name { flex: 1; }
    .sbc-tip-val { font-weight: 700; color: var(--ink-900); font-feature-settings: 'tnum'; }
    .sbc-muted { color: var(--ink-400); }
  `],
})
export class ActivityChartComponent {
  points = input.required<AnalyticsSeriesPoint[]>();
  bucket = input<StatsBucket>('day');
  height = input(220);

  readonly labelMinPx = LABEL_MIN_PX;
  hoverIndex = signal<number | null>(null);
  hoverType = signal<string | null>(null);

  label = eventLabel;

  /** Event types present in the range, in stacking order. */
  types = computed(() => {
    const seen = new Set<string>();
    for (const p of this.points()) {
      for (const [t, n] of Object.entries(p.counts)) if (n > 0) seen.add(t);
    }
    return [...seen].sort((a, b) => eventOrder(a) - eventOrder(b) || a.localeCompare(b));
  });

  totals = computed(() => this.points().map((p) => Object.values(p.counts).reduce((s, n) => s + n, 0)));
  hasData = computed(() => this.totals().some((t) => t > 0));

  private step = computed(() => niceStep(Math.max(...this.totals(), 0)));
  axisMax = computed(() => {
    const max = Math.max(...this.totals(), 0);
    const step = this.step();
    return Math.max(step, Math.ceil(max / step) * step);
  });
  ticks = computed(() => {
    const out: number[] = [];
    for (let t = 0; t <= this.axisMax() + 1e-9; t += this.step()) out.push(Math.round(t * 100) / 100);
    return out;
  });

  columns = computed<Column[]>(() => {
    const pts = this.points();
    const types = this.types();
    const axisMax = this.axisMax();
    const plotH = this.height();
    const labelEvery = Math.max(1, Math.ceil(pts.length / 10));
    return pts.map((p, i) => {
      const total = this.totals()[i];
      const { short, long } = bucketLabels(p.start, this.bucket());
      const segments = types
        .filter((t) => (p.counts[t] ?? 0) > 0)
        .map((t) => {
          const count = p.counts[t];
          const color = eventColor(t);
          return { type: t, count, color, ink: inkFor(color), px: Math.max(2, (count / axisMax) * plotH) };
        });
      return {
        label: short,
        longLabel: long,
        total,
        segments,
        showTick: (pts.length - 1 - i) % labelEvery === 0,
      };
    });
  });

  legend = computed(() => {
    const totals = new Map<string, number>();
    for (const p of this.points()) {
      for (const [t, n] of Object.entries(p.counts)) totals.set(t, (totals.get(t) ?? 0) + n);
    }
    return this.types().map((t) => ({ type: t, color: eventColor(t), total: totals.get(t) ?? 0 }));
  });

  hovered = computed(() => {
    const i = this.hoverIndex();
    if (i === null) return null;
    const col = this.columns()[i];
    if (!col) return null;
    const n = this.columns().length;
    const leftPct = ((i + 0.5) / n) * 100;
    return {
      col,
      leftPct,
      flip: leftPct > 60,
      rows: [...col.segments].sort((a, b) => b.count - a.count),
    };
  });
}
