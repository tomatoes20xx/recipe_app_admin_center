import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type DeviceKind = 'iphone' | 'pixel';

export interface DeviceScreen {
  key: string;
  alt: string;
  android: string;
  ios: string;
}

/**
 * A phone screenshot inside a real device frame: Apple's iPhone 17 Pro bezel
 * (Apple Design Resources) or Google's Pixel 9 Pro emulator skin (Android SDK).
 *
 * All screens are stacked and cross-faded, so switching `active` never flashes.
 * Each frame draws its own status bar (iOS or Android) over the matching screen
 * variant, whose emulator status bar tools/landing-shots.py has blanked out.
 * Size it by setting `width` on the host; the height follows the frame.
 */
@Component({
  selector: 'app-device-frame',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"device device--" + kind()' },
  template: `
    <div class="screen">
      @for (s of screens(); track s.key; let i = $index) {
        <img
          [src]="kind() === 'iphone' ? s.ios : s.android"
          [alt]="i === active() ? s.alt : ''"
          [attr.aria-hidden]="i === active() ? null : 'true'"
          [class.on]="i === active()"
          [attr.loading]="i === active() ? 'eager' : 'lazy'"
          [attr.fetchpriority]="eager() && i === active() ? 'high' : null"
          decoding="async"
          draggable="false"
        />
      }
      @if (kind() === 'iphone') {
        <div class="ios-bar" aria-hidden="true">
          <span class="ios-time">9:41</span>
          <span class="ios-icons">
            <svg class="ios-signal" viewBox="0 0 18 12">
              <rect x="0" y="7.5" width="3.2" height="4.5" rx="1" />
              <rect x="4.9" y="5.2" width="3.2" height="6.8" rx="1" />
              <rect x="9.8" y="2.7" width="3.2" height="9.3" rx="1" />
              <rect x="14.7" y="0" width="3.2" height="12" rx="1" />
            </svg>
            <svg class="ios-wifi" viewBox="0 0 16 12">
              <path
                d="M8 2.4c2.4 0 4.6.9 6.3 2.4l1.2-1.3A11 11 0 0 0 8 .6 11 11 0 0 0 .5 3.5l1.2 1.3A9.2 9.2 0 0 1 8 2.4Z"
              />
              <path
                d="M8 5.9c1.5 0 2.8.5 3.9 1.4l1.2-1.3A7.6 7.6 0 0 0 8 4.1 7.6 7.6 0 0 0 2.9 6l1.2 1.3A6 6 0 0 1 8 5.9Z"
              />
              <path d="M8 9.3c.6 0 1.2.2 1.6.6L8 11.6 6.4 9.9c.4-.4 1-.6 1.6-.6Z" />
            </svg>
            <svg class="ios-battery" viewBox="0 0 27 13">
              <rect
                x=".5"
                y=".5"
                width="23"
                height="12"
                rx="3.8"
                fill="none"
                stroke="currentColor"
                stroke-opacity=".4"
              />
              <rect x="2.2" y="2.2" width="19.6" height="8.6" rx="2.3" />
              <path d="M25 4.4v4.2a2.3 2.3 0 0 0 0-4.2Z" fill-opacity=".45" />
            </svg>
          </span>
        </div>
      } @else {
        <div class="and-bar" aria-hidden="true">
          <span class="and-time">9:41</span>
          <span class="and-icons">
            <svg class="and-wifi" viewBox="0 1 24 20">
              <path d="M12 20.5 1 8.8a16 16 0 0 1 22 0Z" />
            </svg>
            <svg class="and-signal" viewBox="0 0 20 20"><path d="M0 20h20V0Z" /></svg>
            <svg class="and-battery" viewBox="0 0 24 12">
              <rect x="0" y="0" width="21" height="12" rx="3.2" />
              <rect x="21.8" y="3.6" width="2" height="4.8" rx="1" />
            </svg>
          </span>
        </div>
      }
    </div>
    <img class="frame" [src]="frameSrc()" alt="" aria-hidden="true" draggable="false" />
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      flex-shrink: 0;
      filter: var(--device-shadow, drop-shadow(0 28px 36px rgba(28, 31, 26, 0.22)));
    }

    /* Frame PNG geometry, measured from the source art (screen rect + corner radius). */
    :host(.device--iphone) {
      aspect-ratio: 1350 / 2760;
      --sx: 5.3333%;
      --sy: 2.5%;
      --sw: 89.3333%;
      --sh: 95%;
      --sr: 12.44% / 5.72%;
    }
    :host(.device--pixel) {
      aspect-ratio: 1408 / 2974;
      --sx: 4.2614%;
      --sy: 2.0511%;
      --sw: 90.9091%;
      --sh: 96.0323%;
      --sr: 10.94% / 4.9%;
    }

    .screen {
      position: absolute;
      left: var(--sx);
      top: var(--sy);
      width: var(--sw);
      height: var(--sh);
      border-radius: var(--sr);
      overflow: hidden;
      background: #f6f7f5;
      container-type: inline-size;
    }

    .screen img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      opacity: 0;
      transition: opacity 0.45s ease;
      user-select: none;
    }
    .screen img.on {
      opacity: 1;
    }

    .frame {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      user-select: none;
    }

    /* iOS status bar, laid out around the Dynamic Island (x 34.6–65.3%, centre y 7.96cqw). */
    .ios-bar {
      position: absolute;
      inset: 0 0 auto 0;
      height: 15.9cqw;
      color: #1c1f1a;
      pointer-events: none;
    }
    .ios-time,
    .ios-icons {
      position: absolute;
      top: 7.96cqw;
      width: 34.6%;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translateY(-50%);
    }
    .ios-time {
      left: 0;
      padding-left: 2cqw;
      font-family: -apple-system, 'SF Pro Text', system-ui, 'Segoe UI', sans-serif;
      font-size: 4.25cqw;
      font-weight: 600;
      letter-spacing: -0.01em;
      line-height: 1;
    }
    .ios-icons {
      right: 0;
      padding-right: 2cqw;
      gap: 1.5cqw;
    }
    .ios-icons svg {
      display: block;
      fill: currentColor;
      height: auto;
    }
    .ios-signal {
      width: 4.5cqw;
    }
    .ios-wifi {
      width: 4.1cqw;
    }
    .ios-battery {
      width: 6.7cqw;
    }

    /* Android status bar, centred on the punch-hole camera (centre y 7.89cqw). */
    .and-bar {
      position: absolute;
      inset: 0 0 auto 0;
      height: 11.9cqw;
      color: #1c1f1a;
      pointer-events: none;
    }
    .and-time,
    .and-icons {
      position: absolute;
      top: 7.89cqw;
      display: flex;
      align-items: center;
      transform: translateY(-50%);
    }
    .and-time {
      left: 8.5cqw;
      font-family: 'Google Sans', Roboto, system-ui, sans-serif;
      font-size: 3.9cqw;
      font-weight: 500;
      line-height: 1;
    }
    .and-icons {
      right: 8cqw;
      gap: 1.3cqw;
    }
    .and-icons svg {
      display: block;
      fill: currentColor;
      height: auto;
    }
    .and-wifi {
      width: 3.7cqw;
    }
    .and-signal {
      width: 3.1cqw;
    }
    .and-battery {
      width: 5.6cqw;
    }

    @media (prefers-reduced-motion: reduce) {
      .screen img {
        transition: none;
      }
    }
  `,
})
export class DeviceFrameComponent {
  readonly kind = input<DeviceKind>('iphone');
  readonly screens = input.required<readonly DeviceScreen[]>();
  readonly active = input(0);
  /** Load the visible screen eagerly at high priority (above-the-fold hero phone). */
  readonly eager = input(false);

  protected readonly frameSrc = computed(() =>
    this.kind() === 'iphone'
      ? '/landing/devices/iphone-17-pro-silver.webp'
      : '/landing/devices/pixel-9-pro-obsidian.webp',
  );
}
