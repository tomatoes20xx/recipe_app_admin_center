import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

type Lang = 'en' | 'ka';

const TR: Record<Lang, { title: string; body: string; sub: string; back: string }> = {
  en: {
    title: 'Coming Soon',
    body: 'Yummy will be available on the <strong>App Store</strong> very soon.',
    sub: 'Stay tuned — we\'re putting the final touches on the iOS version!',
    back: '← Back to Yummy',
  },
  ka: {
    title: 'მალე დაემატება',
    body: 'Yummy მალე ხელმისაწვდომი იქნება <strong>App Store</strong>-ზე.',
    sub: 'თვალი ადევნეთ — iOS ვერსიას ბოლო შტრიხებს ვამატებთ!',
    back: '← უკან Yummy-ზე',
  },
};

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="card">
        <img src="/app_icon_web.png" class="icon" alt="Yummy" />
        <h1>{{ t().title }}</h1>
        <p [innerHTML]="t().body"></p>
        <p class="sub">{{ t().sub }}</p>
        <a routerLink="/" class="back-link">{{ t().back }}</a>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    }
    .page {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: #f9fbf9; padding: 24px;
    }
    .card {
      text-align: center; max-width: 420px;
      background: #fff; border-radius: 20px; padding: 48px 36px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.08);
    }
    .icon { width: 80px; height: 80px; border-radius: 18px; margin-bottom: 24px; }
    h1 { font-size: 28px; font-weight: 800; color: #111; margin-bottom: 16px; }
    p { font-size: 15px; line-height: 1.7; color: #555; }
    :host ::ng-deep p strong { color: #111; }
    .sub { margin-top: 8px; color: #999; font-size: 14px; }
    .back-link {
      display: inline-block; margin-top: 28px;
      font-size: 14px; font-weight: 600; color: #53B175;
      text-decoration: none;
    }
    .back-link:hover { text-decoration: underline; }
  `],
})
export class ComingSoonComponent {
  lang = signal<Lang>((localStorage.getItem('yummy-lang') as Lang) || 'ka');
  t = computed(() => TR[this.lang()]);
}
