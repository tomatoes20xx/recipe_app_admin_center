import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CMS } from '../landing/landing.component.cms';

/** The store link for this device, or null on desktop. iPadOS reports itself as a Mac. */
function storeForThisDevice(): string | null {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (ios) return CMS.stores.appStore.href;
  if (/Android/i.test(ua)) return CMS.stores.googlePlay.href;
  return null;
}

/**
 * yummy.ge/download — one link for bios, posts and print. Phones go straight to
 * their store; everyone else gets both badges and QR codes.
 */
@Component({
  selector: 'app-download',
  imports: [RouterLink],
  template: `
    <main class="page">
      <div class="card">
        <img class="icon" src="/landing/app-icon.png" alt="Yummy" width="80" height="80" />
        <h1>{{ copy.title }}</h1>
        <p class="sub">{{ copy.sub }}</p>

        <div class="badges">
          @for (store of stores; track store.label) {
            <a [href]="store.href" rel="noopener">
              <img [src]="store.badge" [alt]="store.badgeAlt" [class.badge-gp]="store === stores[1]" />
            </a>
          }
        </div>

        <p class="qr-note">{{ copy.qrNote }}</p>
        <div class="qr-pair">
          @for (store of stores; track store.label) {
            <a class="qr-card" [href]="store.href" rel="noopener">
              <img [src]="store.qr" [alt]="store.qrAlt" width="120" height="120" />
              <span>{{ store.label }}</span>
            </a>
          }
        </div>

        <a class="back" routerLink="/">{{ copy.back }}</a>
      </div>
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
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      background:
        radial-gradient(55% 65% at 12% 8%, #fce9e2 0%, rgba(252, 233, 226, 0) 70%),
        radial-gradient(50% 60% at 92% 28%, #ddefe3 0%, rgba(221, 239, 227, 0) 70%),
        #fbf7f0;
    }
    .card {
      width: 100%;
      max-width: 440px;
      text-align: center;
      background: #fffdf9;
      border: 1px solid #ece8df;
      border-radius: 28px;
      padding: 40px 24px 32px;
    }
    .icon {
      border-radius: 20px;
    }
    h1 {
      margin: 20px 0 0;
      font-family: 'Noto Serif Georgian', Georgia, serif;
      font-size: 28px;
      font-weight: 600;
    }
    .sub {
      margin: 8px 0 0;
      color: #62675e;
      font-size: 15px;
    }
    .badges {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      margin-top: 28px;
      a {
        display: block;
        border-radius: 10px;
      }
      img {
        display: block;
        height: 48px;
        width: auto;
      }
      /* This SVG has no width/height and preserveAspectRatio="none". */
      .badge-gp {
        aspect-ratio: 238.96 / 70.87;
      }
    }
    .qr-note {
      margin: 32px 0 0;
      font-size: 13.5px;
      color: #62675e;
    }
    .qr-pair {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 14px;
    }
    .qr-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 14px 14px 12px;
      background: #fff;
      border: 1px solid #ece8df;
      border-radius: 18px;
      color: inherit;
      text-decoration: none;
      img {
        display: block;
        width: 120px;
        height: 120px;
      }
      span {
        font-size: 13px;
        font-weight: 500;
      }
    }
    .back {
      display: inline-block;
      margin-top: 28px;
      font-size: 14px;
      font-weight: 600;
      color: #2f8a52;
      text-decoration: none;
    }
    .back:hover {
      text-decoration: underline;
    }
    @media (max-width: 400px) {
      .qr-card img {
        width: 104px;
        height: 104px;
      }
    }
  `,
})
export class DownloadComponent {
  protected readonly copy = CMS.downloadPage;
  protected readonly stores = [CMS.stores.appStore, CMS.stores.googlePlay];

  constructor() {
    const store = storeForThisDevice();
    if (store) location.replace(store);
  }
}
