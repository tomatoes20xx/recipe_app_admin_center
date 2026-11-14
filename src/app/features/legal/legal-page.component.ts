import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LegalSection, PRIVACY_EN, TERMS } from './legal.content';

type Lang = 'ka' | 'en';
type Doc = 'privacy' | 'terms' | 'delete';

interface LegalDoc {
  title: string;
  updated?: string;
  intro?: string;
  sections: LegalSection[];
}

const EMAIL = '<a href="mailto:yummyhelper@gmail.com">yummyhelper@gmail.com</a>';

// Play Console links here as the account-deletion URL, so it names the app and
// developer, gives the steps, and says what is deleted and what is kept.
const DELETE: Record<Lang, LegalDoc> = {
  ka: {
    title: 'ანგარიშის წაშლა',
    intro:
      '<p>Yummy-ს (დეველოპერი: Tamaz Katcheishvili) ანგარიშის და მასთან დაკავშირებული მონაცემების წაშლა ნებისმიერ დროს შეგიძლიათ.</p>',
    sections: [
      {
        title: 'აპლიკაციიდან',
        html:
          '<ol><li>გახსენით Yummy და შედით თქვენს ანგარიშზე.</li>' +
          '<li>გახსენით მენიუ და გადადით „პარამეტრებში“.</li>' +
          '<li>ჩადით გვერდის ბოლოში და დააჭირეთ „ანგარიშის წაშლა“-ს.</li>' +
          '<li>დაადასტურეთ და ველში ჩაწერეთ DELETE.</li>' +
          '<li>კიდევ ერთხელ დააჭირეთ „ანგარიშის წაშლა“-ს.</li></ol>' +
          '<p>ანგარიში მაშინვე და სამუდამოდ წაიშლება.</p>',
      },
      {
        title: 'ელფოსტით',
        html: `<p>თუ აპლიკაციიდან წაშლა ვერ ხერხდება, მოგვწერეთ ${EMAIL} იმ ელფოსტიდან, რომლითაც დარეგისტრირდით. მოთხოვნას 30 დღის განმავლობაში დავამუშავებთ.</p>`,
      },
      {
        title: 'რა იშლება',
        html: '<p>პროფილი, რეცეპტები და ფოტოები, კომენტარები, მოწონებები, შენახული რეცეპტები, კოლექციები, საყიდლების სიები და გამოწერები.</p>',
      },
      {
        title: 'რა რჩება',
        html:
          '<ul><li>ანონიმური, აგრეგირებული სტატისტიკა: არაუმეტეს 24 თვისა.</li>' +
          '<li>სერვერის ჟურნალები: არაუმეტეს 90 დღისა, უსაფრთხოების მიზნით.</li>' +
          '<li>მონაცემები, რომელთა შენახვასაც კანონი მოითხოვს.</li></ul>',
      },
    ],
  },
  en: {
    title: 'Delete your account',
    intro:
      '<p>You can delete your Yummy account (developer: Tamaz Katcheishvili) and its data at any time.</p>',
    sections: [
      {
        title: 'In the app',
        html:
          '<ol><li>Open Yummy and sign in.</li>' +
          '<li>Open the menu and go to Settings.</li>' +
          '<li>Scroll to the bottom and tap Delete account.</li>' +
          '<li>Confirm, then type DELETE in the field.</li>' +
          '<li>Tap Delete account again.</li></ol>' +
          '<p>Your account is deleted immediately and permanently.</p>',
      },
      {
        title: 'By email',
        html: `<p>If you can't delete it in the app, email ${EMAIL} from the address you signed up with. We process requests within 30 days.</p>`,
      },
      {
        title: 'What is deleted',
        html: '<p>Your profile, recipes and photos, comments, likes, saved recipes, collections, shopping lists and follows.</p>',
      },
      {
        title: 'What is kept',
        html:
          '<ul><li>Anonymous, aggregated analytics: up to 24 months.</li>' +
          '<li>Server logs: up to 90 days, for security.</li>' +
          '<li>Data we are legally required to keep.</li></ul>',
      },
    ],
  },
};

const BACK: Record<Lang, string> = { ka: '← yummy.ge', en: '← yummy.ge' };
const UPDATED: Record<Lang, string> = { ka: 'განახლდა', en: 'Last updated' };

/** yummy.ge/privacy, /terms and /delete-account. Which one comes from route data. */
@Component({
  selector: 'app-legal-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="page">
      <article class="card" [attr.lang]="lang()">
        <header>
          <a class="brand" routerLink="/">
            <img src="/app_icon_web.png" alt="" width="28" height="28" />
            <span>Yummy</span>
          </a>
          @if (bilingual) {
            <div class="lang" role="group" aria-label="Language">
              <button type="button" [class.on]="lang() === 'ka'" (click)="lang.set('ka')">
                KA
              </button>
              <button type="button" [class.on]="lang() === 'en'" (click)="lang.set('en')">
                EN
              </button>
            </div>
          }
        </header>

        <h1>{{ content().title }}</h1>
        @if (content().updated; as updated) {
          <p class="updated">{{ updatedLabel() }}: {{ updated }}</p>
        }
        @if (content().intro; as intro) {
          <div class="body" [innerHTML]="intro"></div>
        }
        @for (section of content().sections; track section.title) {
          <section>
            <h2>{{ section.title }}</h2>
            <div class="body" [innerHTML]="section.html"></div>
          </section>
        }

        <a class="back" routerLink="/">{{ back() }}</a>
      </article>
    </main>
  `,
  styles: `
    :host {
      display: block;
      font-family: 'Noto Sans Georgian', system-ui, sans-serif;
      color: #1c1f1a;
    }
    .page {
      min-height: 100vh;
      padding: 32px 16px 48px;
      background: #fbf7f0;
    }
    .card {
      max-width: 760px;
      margin: 0 auto;
      background: #fffdf9;
      border: 1px solid #ece8df;
      border-radius: 24px;
      padding: 28px 32px 36px;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      color: inherit;
      text-decoration: none;
      font-weight: 600;
      font-size: 17px;
      img {
        border-radius: 8px;
      }
    }
    .lang {
      display: flex;
      border: 1px solid #ece8df;
      border-radius: 999px;
      padding: 3px;
      button {
        border: 0;
        background: none;
        padding: 6px 12px;
        border-radius: 999px;
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        color: #62675e;
        cursor: pointer;
      }
      button.on {
        background: #2f8a52;
        color: #fff;
      }
    }
    h1 {
      margin: 28px 0 0;
      font-family: 'Noto Serif Georgian', Georgia, serif;
      font-size: 30px;
      font-weight: 600;
      line-height: 1.25;
    }
    .updated {
      margin: 8px 0 0;
      font-size: 13.5px;
      color: #62675e;
    }
    h2 {
      margin: 28px 0 0;
      font-size: 18px;
      font-weight: 600;
    }
    .body {
      font-size: 15px;
      line-height: 1.65;
      color: #353a32;
    }
    .body ::ng-deep {
      h3 {
        margin: 16px 0 0;
        font-size: 15.5px;
        font-weight: 600;
      }
      p {
        margin: 10px 0 0;
      }
      ul,
      ol {
        margin: 10px 0 0;
        padding-left: 22px;
      }
      li + li {
        margin-top: 6px;
      }
      a {
        color: #2f8a52;
        overflow-wrap: anywhere;
      }
    }
    .back {
      display: inline-block;
      margin-top: 32px;
      font-size: 14px;
      font-weight: 600;
      color: #2f8a52;
      text-decoration: none;
    }
    .back:hover {
      text-decoration: underline;
    }
    @media (max-width: 600px) {
      .page {
        padding: 16px 12px 32px;
      }
      .card {
        padding: 20px 18px 28px;
        border-radius: 20px;
      }
      h1 {
        font-size: 25px;
      }
    }
  `,
})
export class LegalPageComponent {
  private readonly doc = inject(ActivatedRoute).snapshot.data['doc'] as Doc;
  private readonly document = inject(DOCUMENT);

  /** The privacy policy exists only in English; Terms and deletion have both. */
  protected readonly bilingual = this.doc !== 'privacy';
  protected readonly lang = signal<Lang>(this.doc === 'privacy' ? 'en' : 'ka');

  protected readonly content = computed<LegalDoc>(() => {
    const lang = this.lang();
    if (this.doc === 'privacy') return PRIVACY_EN;
    if (this.doc === 'terms') return TERMS[lang];
    return DELETE[lang];
  });
  protected readonly back = computed(() => BACK[this.lang()]);
  protected readonly updatedLabel = computed(() => UPDATED[this.lang()]);

  constructor() {
    const html = this.document.documentElement;
    effect(() => (html.lang = this.lang()));
    // index.html is lang="ka"; put it back when leaving an English page.
    inject(DestroyRef).onDestroy(() => (html.lang = 'ka'));
  }
}
