import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  signal,
  viewChildren,
} from '@angular/core';
import { CMS } from './landing.component.cms';
import { DeviceFrameComponent } from './device-frame.component';

@Component({
  selector: 'app-landing',
  imports: [DeviceFrameComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  protected readonly cms = CMS;
  protected readonly screens = CMS.tabs.items;

  /** Selected feature tab; the centre phone shows it, the side phones its neighbours. */
  protected readonly tab = signal(0);
  protected readonly prevTab = computed(
    () => (this.tab() + this.screens.length - 1) % this.screens.length,
  );
  protected readonly nextTab = computed(() => (this.tab() + 1) % this.screens.length);

  /** Open FAQ row, or -1 when all are closed. */
  protected readonly openFaq = signal(0);

  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabBtn');

  protected selectTab(i: number) {
    this.tab.set(i);
  }

  /** Arrow/Home/End keys move between tabs (WAI-ARIA tabs pattern, automatic activation). */
  protected onTabKey(event: KeyboardEvent) {
    const n = this.screens.length;
    const moves: Record<string, number> = {
      ArrowRight: (this.tab() + 1) % n,
      ArrowLeft: (this.tab() + n - 1) % n,
      Home: 0,
      End: n - 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    this.tab.set(next);
    const btn = this.tabButtons()[next]?.nativeElement;
    btn?.focus();
    btn?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  protected toggleFaq(i: number) {
    this.openFaq.update((open) => (open === i ? -1 : i));
  }

  /** Smooth-scrolls to in-page anchors instead of jumping. */
  protected scrollTo(id: string, event: Event) {
    event.preventDefault();
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
