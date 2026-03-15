import { Component, signal, computed, effect } from '@angular/core';
import { RouterLink } from '@angular/router';

type Lang = 'en' | 'ka';

interface Translations {
  heroBadge: string;
  heroTitle: string;
  heroSub: string;
  tags: string[];
  appStore: string;
  googlePlay: string;
  screensTitle: string;
  screensSub: string;
  screenshotLabels: string[];
  featuresTitle: string;
  featuresSub: string;
  features: { icon: string; title: string; desc: string }[];
  howTitle: string;
  howSub: string;
  steps: { title: string; desc: string }[];
  platformTitle: string;
  platformSub: string;
  platformCards: { icon: string; title: string; desc: string }[];
  footerCopy: string;
}

const TR: Record<Lang, Translations> = {
  en: {
    heroBadge: 'Recipe Social Platform',
    heroTitle: 'Cook. Share.<br/>Connect.',
    heroSub: 'Yummy is a mobile recipe-sharing community where home cooks discover recipes from around the world, share their own creations, and connect with people who love food as much as they do.',
    tags: ['🌍 English & Georgian', '📱 Android & iOS', '🌙 Dark mode'],
    appStore: 'App Store',
    googlePlay: 'Google Play',
    screensTitle: 'A beautiful experience on every screen',
    screensSub: 'Tap any screenshot to expand it.',
    screenshotLabels: ['Feed & Discovery', 'Immersive Mode', 'Cook with What You Have', 'Recipe Creation', 'Shopping List', 'Dark Theme'],
    featuresTitle: 'Everything a food lover needs',
    featuresSub: 'From your kitchen to the community — all in one app.',
    features: [
      { icon: '📱', title: 'Feed & Discovery',         desc: 'Browse a global recipe feed or filter to people you follow. Sort by popularity or trending. Switch between card view and full-screen immersive mode.' },
      { icon: '🧑‍🍳', title: 'Cook with What You Have', desc: 'Enter the ingredients you already have at home and get back recipes you can actually make. Results ranked by ingredient match.' },
      { icon: '📝', title: 'Recipe Creation',          desc: 'Write full recipes with ingredients, step-by-step instructions, cooking time, difficulty, and multiple photos.' },
      { icon: '🔍', title: 'Rich Search & Filters',    desc: 'Find recipes by keyword, cuisine, tags, cooking time, difficulty, or specific ingredients — all combinable.' },
      { icon: '👥', title: 'Social Graph',             desc: 'Follow cooks you love. See their profiles, follower counts, and recipe grids. Discover new creators.' },
      { icon: '📤', title: 'Private Recipe Sharing',   desc: 'Share specific recipes privately with individual followers. Recipients get a dedicated inbox, grouped by date.' },
      { icon: '🛒', title: 'Shopping List',            desc: 'Build a shopping list directly from recipe ingredients. Share it with others — shared lists arrive in a separate inbox.' },
      { icon: '💬', title: 'Threaded Comments',        desc: 'Every recipe has a comment section with likes, replies, and threads. Edit or delete your own comments anytime.' },
      { icon: '🔔', title: 'Real-time Notifications',  desc: 'Get notified about new followers, likes, comments, bookmarks, and shared content with badge counts.' },
    ],
    howTitle: 'Built for home cooks',
    howSub: 'Simple enough to use every day. Powerful enough for serious food enthusiasts.',
    steps: [
      { title: 'Create an account',  desc: 'Sign up with email or continue with Google. Email verification keeps the community authentic.' },
      { title: 'Explore & follow',   desc: 'Browse the global feed, search by ingredient or cuisine, and follow the cooks whose food inspires you.' },
      { title: 'Cook & share',       desc: 'Post your own recipes with photos. Save favourites, build shopping lists, and share with friends.' },
    ],
    platformTitle: 'Made for everyone',
    platformSub: 'Thoughtfully designed, widely accessible.',
    platformCards: [
      { icon: '🌍', title: 'Two languages, one community', desc: 'Fully available in <strong>English</strong> and <strong>Georgian (ქართული)</strong>. Switch anytime from settings.' },
      { icon: '🌙', title: 'Light, dark & system theme',   desc: 'Choose your preferred appearance or let the app follow your device setting automatically.' },
      { icon: '📲', title: 'Android & iOS',                desc: 'Built with Flutter for a native-quality experience on both platforms. One codebase, zero compromises.' },
    ],
    footerCopy: '© 2025 Yummy. All rights reserved.',
  },
  ka: {
    heroBadge: 'რეცეპტების სოციალური პლატფორმა',
    heroTitle: 'მოამზადე. გააზიარე.<br/>დაუკავშირდი.',
    heroSub: 'Yummy არის მობილური პლატფორმა რეცეპტების გასაზიარებლად, სადაც მზარეულები აღმოაჩენენ რეცეპტებს, შექმნიან საკუთარ კერძებს და დაუკავშირდებიან სხვა სამზარეულოს ენთუზიასტებს.',
    tags: ['🌍 ქართული და ინგლისური', '📱 Android და iOS', '🌙 მუქი თემა'],
    appStore: 'App Store',
    googlePlay: 'Google Play',
    screensTitle: 'ლამაზი გამოცდილება ყველა ეკრანზე',
    screensSub: 'დააჭირეთ ნებისმიერ სუყრათს გასადიდებლად.',
    screenshotLabels: ['ფიდი და აღმოჩენა', 'იმერსიული რეჟიმი', 'მოამზადე იმით, რაც გაქვს', 'რეცეპტის შექმნა', 'საყიდლების სია', 'მუქი თემა'],
    featuresTitle: 'ყველაფერი, რაც საჭიროა საკვების მოყვარულისთვის',
    featuresSub: 'სამზარეულოდან საზოგადოებამდე — ყველაფერი ერთ აპლიკაციაში.',
    features: [
      { icon: '📱', title: 'ფიდი და აღმოჩენა',          desc: 'დაათვალიერე გლობალური რეცეპტების ფიდი ან გაფილტრე შენს მიმდევრებზე. დაალაგე პოპულარობით ან ტრენდებით. გადართე ბარათებსა და იმერსიულ რეჟიმს შორის.' },
      { icon: '🧑‍🍳', title: 'მოამზადე იმით, რაც გაქვს', desc: 'შეიყვანე სახლში არსებული ინგრედიენტები და მიიღე რეცეპტები, რომელთა მომზადებაც შეგიძლია. შედეგები ინგრედიენტების შესაბამისობით.' },
      { icon: '📝', title: 'რეცეპტის შექმნა',            desc: 'შექმენი სრული რეცეპტი ინგრედიენტებით, ნაბიჯ-ნაბიჯ ინსტრუქციებით, მომზადების დროით, სირთულით და ფოტოებით.' },
      { icon: '🔍', title: 'ძიება და ფილტრები', desc: 'იპოვე რეცეპტები საკვანძო სიტყვის, სამზარეულოს, თეგების, მომზადების დროის, სირთულის ან ინგრედიენტების მიხედვით.' },
      { icon: '👥', title: 'სოციალური ქსელი',            desc: 'მიჰყევი მზარეულებს, ვინც მოგწონს. ნახე მათი პროფილები, მიმდევრების რაოდენობა და რეცეპტების გალერეა.' },
      { icon: '📤', title: 'პირადი გაზიარება',           desc: 'გააზიარე კონკრეტული რეცეპტები პირადად მიმდევრებთან.' },
      { icon: '🛒', title: 'საყიდლების სია',            desc: 'შექმენი საყიდლების სია პირდაპირ რეცეპტის ინგრედიენტებიდან. გააზიარე სხვებთან — იშოპინგეთ ერთად.' },
      { icon: '💬', title: 'კომენტარები',   desc: 'ყველა რეცეპტს აქვს კომენტარების განყოფილება ლაიქებით, პასუხებით და ნაკადებით. შეცვალე ან წაშალე საკუთარი კომენტარები.' },
      { icon: '🔔', title: 'შეტყობინებები', desc: 'მიიღე შეტყობინებები ახალი მიმდევრების, ლაიქების, კომენტარების, სანიშნეების და გაზიარებული კონტენტის შესახებ.' },
    ],
    howTitle: 'შექმნილია მზარეულებისთვის',
    howSub: 'საკმარისად მარტივი ყოველდღიური გამოყენებისთვის. საკმარისად მძლავრი სერიოზული გასტრონომებისთვის.',
    steps: [
      { title: 'შექმენი ანგარიში',     desc: 'დარეგისტრირდი ელ.ფოსტით ან გააგრძელე Google-ით.' },
      { title: 'გამოიკვლიე და მიჰყევი', desc: 'დაათვალიერე გლობალური ფიდი, მოძებნე ინგრედიენტის ან სამზარეულოს მიხედვით, მიჰყევი მზარეულებს, ვისი რეცეპტებიც მოგეწონება.' },
      { title: 'მოამზადე და გააზიარე',  desc: 'განათავსე საკუთარი რეცეპტები ფოტოებით. შეინახე საყვარელი, შექმენი საყიდლების სიები და გააზიარე მეგობრებთან.' },
    ],
    platformTitle: 'შექმნილია ყველასთვის',
    platformSub: 'გააზრებულად დაპროექტებული, ფართოდ ხელმისაწვდომი.',
    platformCards: [
      { icon: '🌍', title: 'ორი ენა, ერთი საზოგადოება', desc: 'სრულად ხელმისაწვდომია <strong>ქართულ</strong> და <strong>ინგლისურ</strong> ენებზე. შეცვალე ნებისმიერ დროს პარამეტრებიდან.' },
      { icon: '🌙', title: 'ღია და მუქი თემები', desc: 'აირჩიე სასურველი გარეგნობა ან მიეცი აპლიკაციას საშუალება ავტომატურად გამოიყენოს მოწყობილობის გლობალური თემა.' },
      { icon: '📲', title: 'Android და iOS',              desc: 'შექმნილია Flutter-ით ორივე პლატფორმაზე უმაღლესი ხარისხის გამოცდილების მისაღებად. ერთი კოდი, ნულოვანი კომპრომისი.' },
    ],
    footerCopy: '© 2025 Yummy. ყველა უფლება დაცულია.',
  },
};

interface ScreenShot {
  thumb: string;
  full: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- NAV -->
    <nav class="nav">
      <div class="nav-inner">
        <div class="nav-logo">
          <img src="/app_icon_web.png" class="nav-icon" alt="Yummy" />
          <span class="logo-text">Yummy</span>
        </div>
        <div class="nav-right">
          <div class="nav-badges">
            <span class="platform-badge">Android</span>
            <span class="platform-badge">iOS</span>
          </div>
          <div class="lang-switcher">
            <button class="lang-btn" [class.lang-active]="lang() === 'ka'" (click)="lang.set('ka')">ქართ</button>
            <button class="lang-btn" [class.lang-active]="lang() === 'en'" (click)="lang.set('en')">EN</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-badge">{{ t().heroBadge }}</div>
        <h1 class="hero-title" [innerHTML]="t().heroTitle"></h1>
        <p class="hero-sub">{{ t().heroSub }}</p>
        <div class="hero-tags">
          @for (tag of t().tags; track tag) {
            <span class="tag">{{ tag }}</span>
          }
        </div>
        <div class="hero-actions">
          <a class="btn-primary" routerLink="/download">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.4.07 2.38.74 3.2.8 1.23-.24 2.4-.93 3.65-.84 1.55.13 2.72.74 3.47 1.9-3.14 1.93-2.4 6.13.68 7.34-.55 1.32-1.25 2.6-3 3.66zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            {{ t().appStore }}
          </a>
          <a class="btn-primary btn-android" href="https://play.google.com/store/apps/details?id=com.tomakatcheishvili.yummy" target="_blank" rel="noopener">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5S11 23.33 11 22.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0 0 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31A5.983 5.983 0 0 0 6 7h12a5.98 5.98 0 0 0-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/></svg>
            {{ t().googlePlay }}
          </a>
        </div>
      </div>

      <div class="hero-visual">
        <div class="phone-stack">
          <div class="phone phone-back">
            <img src="/screenshots/thumbs/feed_dark_theme_thumb.png" alt="Yummy dark theme" class="phone-img" />
          </div>
          <div class="phone phone-front">
            <img src="/screenshots/thumbs/feed_light_theme_thumb.png" alt="Yummy light theme" class="phone-img" />
          </div>
        </div>
      </div>
    </section>

    <!-- SCREENSHOTS STRIP -->
    <section class="screens-section">
      <div class="section-inner">
        <h2 class="section-title">{{ t().screensTitle }}</h2>
        <p class="section-sub">{{ t().screensSub }}</p>
      </div>
      <div class="screens-scroll">
        @for (shot of screenshots; track shot.thumb; let i = $index) {
          <div class="screen-item" (click)="open(i)">
            <div class="phone-frame">
              <img [src]="shot.thumb" [alt]="t().screenshotLabels[i]" class="phone-img" />
              <div class="expand-hint">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M15 3h6v6h-2V5h-4V3zM9 3H3v6h2V5h4V3zM15 21h4v-4h2v6h-6v-2zM3 21h6v-2H5v-4H3v6z"/></svg>
              </div>
            </div>
            <p class="screen-label">{{ t().screenshotLabels[i] }}</p>
          </div>
        }
      </div>
    </section>

    <!-- LIGHTBOX -->
    @if (selectedShot()) {
      <div class="lightbox-overlay" (click)="close()">
        <div class="lightbox-content" (click)="$event.stopPropagation()">
          <button class="lightbox-close" (click)="close()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
          <div class="lightbox-phone">
            <img [src]="selectedShot()!.full" [alt]="selectedLabel()" class="lightbox-img" />
          </div>
          <p class="lightbox-label">{{ selectedLabel() }}</p>
        </div>
      </div>
    }

    <!-- FEATURES GRID -->
    <section class="features">
      <div class="section-inner">
        <h2 class="section-title">{{ t().featuresTitle }}</h2>
        <p class="section-sub">{{ t().featuresSub }}</p>
        <div class="features-grid">
          @for (f of t().features; track f.title) {
            <div class="feature-card">
              <div class="feature-icon">{{ f.icon }}</div>
              <h3>{{ f.title }}</h3>
              <p>{{ f.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="how">
      <div class="section-inner">
        <h2 class="section-title">{{ t().howTitle }}</h2>
        <p class="section-sub">{{ t().howSub }}</p>
        <div class="steps-row">
          @for (step of t().steps; track step.title; let i = $index) {
            @if (i > 0) { <div class="step-arrow">→</div> }
            <div class="step">
              <div class="step-num">{{ i + 1 }}</div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- PLATFORM -->
    <section class="platform">
      <div class="section-inner">
        <h2 class="section-title">{{ t().platformTitle }}</h2>
        <p class="section-sub">{{ t().platformSub }}</p>
        <div class="platform-inner">
          @for (card of t().platformCards; track card.title) {
            <div class="platform-card">
              <div class="platform-icon">{{ card.icon }}</div>
              <h3>{{ card.title }}</h3>
              <p [innerHTML]="card.desc"></p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-logo">
          <img src="/app_icon_web.png" class="footer-icon" alt="Yummy" />
          <span class="logo-text">Yummy</span>
        </div>
        <p class="footer-copy">{{ t().footerCopy }}</p>
      </div>
    </footer>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }

    :host {
      display: block;
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      color: #1a1a2e;
      background: #fff;
    }

    /* ─── NAV ─────────────────────────────── */
    .nav {
      position: sticky; top: 0; z-index: 100;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #f0f0f0;
    }
    .nav-inner {
      max-width: 1100px; margin: 0 auto;
      padding: 0 24px; height: 64px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .nav-logo { display: flex; align-items: center; gap: 10px; }
    .nav-icon { width: 52px; height: 52px; border-radius: 12px; object-fit: cover; }
    .logo-text { font-size: 20px; font-weight: 700; color: #53B175; letter-spacing: -0.3px; }
    .nav-right { display: flex; align-items: center; gap: 16px; }
    .nav-badges { display: flex; gap: 8px; }
    .platform-badge {
      font-size: 12px; font-weight: 600; color: #53B175;
      background: #e8f5ee; padding: 3px 10px; border-radius: 20px;
    }

    /* Language switcher */
    .lang-switcher { display: flex; gap: 2px; background: #f0f0f0; border-radius: 8px; padding: 3px; }
    .lang-btn {
      border: none; background: transparent; cursor: pointer;
      font-size: 13px; font-weight: 600; color: #888;
      padding: 4px 10px; border-radius: 6px;
      transition: background 0.15s, color 0.15s;
      font-family: inherit;
    }
    .lang-btn:hover { color: #333; }
    .lang-active { background: #fff !important; color: #53B175 !important; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }

    /* ─── HERO ────────────────────────────── */
    .hero {
      min-height: calc(100vh - 64px);
      display: flex; align-items: center;
      max-width: 1100px; margin: 0 auto;
      padding: 60px 24px; gap: 40px;
    }
    .hero-inner { flex: 1; }
    .hero-badge {
      display: inline-block; background: #e8f5ee; color: #53B175;
      font-size: 12px; font-weight: 700; padding: 4px 12px;
      border-radius: 20px; margin-bottom: 20px;
      letter-spacing: 0.8px; text-transform: uppercase;
    }
    .hero-title {
      font-size: clamp(38px, 5vw, 62px); font-weight: 900;
      line-height: 1.05; letter-spacing: -2px; color: #111; margin-bottom: 20px;
    }
    .hero-sub {
      font-size: 16px; line-height: 1.75; color: #555;
      max-width: 460px; margin-bottom: 24px;
    }
    .hero-tags { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 32px; }
    .tag {
      font-size: 13px; color: #444; background: #f5f5f5;
      padding: 5px 12px; border-radius: 20px;
    }
    .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-primary {
      display: flex; align-items: center; gap: 8px;
      background: #111; color: #fff;
      padding: 13px 22px; border-radius: 12px;
      font-size: 14px; font-weight: 600; text-decoration: none;
      transition: background 0.2s, transform 0.15s;
    }
    .btn-primary:hover { background: #333; transform: translateY(-1px); }
    .btn-android { background: #53B175; }
    .btn-android:hover { background: #3d9459; }

    /* ─── PHONE STACK (HERO) ──────────────── */
    .hero-visual { flex: 0 0 auto; }
    .phone-stack { position: relative; width: 540px; height: 700px; }
    .phone {
      position: absolute;
      background: #111;
      border-radius: 48px;
      padding: 12px;
      overflow: hidden;
    }
    .phone-back {
      width: 300px; height: 620px;
      top: 20px; left: 0;
      transform: rotate(-6deg);
      box-shadow: 0 20px 50px rgba(0,0,0,0.18);
      z-index: 1;
    }
    .phone-front {
      width: 310px; height: 640px;
      bottom: 0; right: 0;
      box-shadow: 0 30px 70px rgba(0,0,0,0.28);
      z-index: 2;
    }
    .phone-img {
      width: 100%; height: 100%;
      object-fit: cover; border-radius: 38px; display: block;
    }

    /* ─── SCREENSHOTS STRIP ───────────────── */
    .screens-section { padding: 90px 0; background: #f9fbf9; overflow: hidden; }
    .screens-section .section-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    .screens-scroll {
      display: flex; gap: 28px;
      padding: 40px 48px 32px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      justify-content: center;
      flex-wrap: wrap;
    }
    .screens-scroll::-webkit-scrollbar { display: none; }
    .screen-item { flex: 0 0 auto; text-align: center; scroll-snap-align: center; cursor: pointer; }
    .phone-frame {
      position: relative; width: 350px;
      background: #111; border-radius: 44px; padding: 12px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.22); overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .screen-item:hover .phone-frame { transform: translateY(-6px); box-shadow: 0 28px 60px rgba(0,0,0,0.28); }
    .phone-frame .phone-img { border-radius: 34px; aspect-ratio: 9/19.5; object-fit: cover; display: block; width: 100%; }
    .expand-hint {
      position: absolute; bottom: 18px; right: 18px;
      width: 30px; height: 30px; border-radius: 50%;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.2s;
    }
    .screen-item:hover .expand-hint { opacity: 1; }
    .screen-label { margin-top: 16px; font-size: 14px; font-weight: 500; color: #555; }

    /* ─── LIGHTBOX ────────────────────────── */
    .lightbox-overlay {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(0,0,0,0.85);
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .lightbox-content {
      position: relative;
      display: flex; flex-direction: column; align-items: center; gap: 16px;
      animation: scaleIn 0.2s ease;
    }
    @keyframes scaleIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .lightbox-close {
      position: absolute; top: -16px; right: -16px;
      width: 36px; height: 36px; border-radius: 50%;
      background: #fff; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10;
      transition: background 0.15s;
    }
    .lightbox-close:hover { background: #f0f0f0; }
    .lightbox-phone {
      background: #111; border-radius: 44px; padding: 12px;
      box-shadow: 0 40px 80px rgba(0,0,0,0.5);
      overflow: hidden; max-height: 85vh;
    }
    .lightbox-img {
      display: block; border-radius: 34px;
      max-height: calc(85vh - 24px); width: auto;
      max-width: min(360px, 80vw); object-fit: contain;
    }
    .lightbox-label { color: #fff; font-size: 15px; font-weight: 500; text-align: center; opacity: 0.85; }

    /* ─── FEATURES ────────────────────────── */
    .features { padding: 90px 24px; background: #fff; }
    .section-inner { max-width: 1100px; margin: 0 auto; }
    .section-title {
      font-size: clamp(24px, 4vw, 36px); font-weight: 800;
      text-align: center; letter-spacing: -0.5px; color: #111; margin-bottom: 12px;
    }
    .section-sub { text-align: center; color: #666; font-size: 16px; margin-bottom: 52px; }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .feature-card {
      background: #f9fbf9; border-radius: 16px; padding: 28px;
      border: 1px solid #eee; transition: box-shadow 0.2s, transform 0.2s;
    }
    .feature-card:hover { box-shadow: 0 8px 32px rgba(83,177,117,0.12); transform: translateY(-2px); }
    .feature-icon { font-size: 30px; margin-bottom: 14px; }
    .feature-card h3 { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 8px; }
    .feature-card p { font-size: 14px; line-height: 1.65; color: #666; }

    /* ─── HOW IT WORKS ────────────────────── */
    .how { padding: 90px 24px; background: #f9fbf9; }
    .steps-row { display: flex; align-items: flex-start; justify-content: center; gap: 8px; flex-wrap: wrap; }
    .step { flex: 1; min-width: 200px; max-width: 280px; text-align: center; padding: 8px; }
    .step-num {
      width: 48px; height: 48px; border-radius: 50%;
      background: #53B175; color: #fff;
      font-size: 20px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    .step h3 { font-size: 17px; font-weight: 700; color: #111; margin-bottom: 8px; }
    .step p { font-size: 14px; line-height: 1.65; color: #666; }
    .step-arrow { font-size: 28px; color: #ccc; padding-top: 20px; flex-shrink: 0; }

    /* ─── PLATFORM ────────────────────────── */
    .platform { background: #111; padding: 90px 24px; }
    .platform .section-title { color: #fff; }
    .platform .section-sub { color: #888; }
    .platform-inner { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; margin-top: 52px; }
    .platform-card { background: #1a1a1a; border-radius: 16px; padding: 28px; border: 1px solid #2a2a2a; }
    .platform-icon { font-size: 32px; margin-bottom: 16px; }
    .platform-card h3 { font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 10px; }
    .platform-card p { font-size: 14px; line-height: 1.65; color: #888; }
    .platform-card strong { color: #53B175; }

    /* ─── FOOTER ──────────────────────────── */
    .footer { background: #0a0a0a; padding: 36px 24px; }
    .footer-inner {
      max-width: 1100px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
    }
    .footer-logo { display: flex; align-items: center; gap: 10px; }
    .footer-icon { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; }
    .footer-logo .logo-text { color: #53B175; }
    .footer-copy { font-size: 13px; color: #555; }

    /* ─── RESPONSIVE ──────────────────────── */
    @media (max-width: 960px) {
      .hero { flex-direction: column; text-align: center; padding: 48px 24px; gap: 48px; }
      .hero-sub { margin: 0 auto 24px; }
      .hero-tags { justify-content: center; }
      .hero-actions { justify-content: center; }
      .hero-visual { order: -1; }
      .phone-stack { width: 380px; height: 520px; }
      .phone-back { width: 220px; height: 450px; top: 10px; left: 0; }
      .phone-front { width: 230px; height: 470px; }
      .features-grid { grid-template-columns: 1fr 1fr; }
      .screens-scroll { flex-wrap: nowrap; justify-content: flex-start; }
    }

    @media (max-width: 660px) {
      .nav-badges { display: none; }
      .phone-frame { width: 280px; }
      .features-grid { grid-template-columns: 1fr; }
      .steps-row { flex-direction: column; align-items: center; }
      .step-arrow { transform: rotate(90deg); }
    }
  `],
})
export class LandingComponent {
  lang = signal<Lang>((localStorage.getItem('yummy-lang') as Lang) || 'ka');
  t = computed(() => TR[this.lang()]);

  constructor() {
    effect(() => localStorage.setItem('yummy-lang', this.lang()));
  }

  readonly screenshots: ScreenShot[] = [
    { thumb: '/screenshots/thumbs/feed_light_theme_thumb.png',               full: '/screenshots/feed_light_theme.png' },
    { thumb: '/screenshots/thumbs/full_screen_feed_thumb.png',               full: '/screenshots/full_screen_feed.png' },
    { thumb: '/screenshots/thumbs/recipe_search_with_what_i_have_thumb.png', full: '/screenshots/recipe_search_with_what_i_have.png' },
    { thumb: '/screenshots/thumbs/create_recipe_thumb.png',                  full: '/screenshots/create_recipe.png' },
    { thumb: '/screenshots/thumbs/shopping_list_thumb.png',                  full: '/screenshots/shopping_list.png' },
    { thumb: '/screenshots/thumbs/feed_dark_theme_thumb.png',                full: '/screenshots/feed_dark_theme.png' },
  ];

  private selectedIndex = signal<number | null>(null);
  selectedShot  = computed(() => this.selectedIndex() !== null ? this.screenshots[this.selectedIndex()!] : null);
  selectedLabel = computed(() => this.selectedIndex() !== null ? this.t().screenshotLabels[this.selectedIndex()!] : '');

  open(i: number) { this.selectedIndex.set(i); }
  close()         { this.selectedIndex.set(null); }
}
