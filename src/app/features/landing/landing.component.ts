import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- NAV -->
    <nav class="nav">
      <div class="nav-inner">
        <div class="nav-logo">
          <span class="logo-icon">🍅</span>
          <span class="logo-text">Yummy</span>
        </div>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-badge">Recipe Community</div>
        <h1 class="hero-title">Discover, Share &amp; Savor</h1>
        <p class="hero-sub">
          A home for passionate cooks. Browse thousands of recipes, share your
          own creations, and connect with a community that loves food as much as
          you do.
        </p>
        <div class="hero-actions">
          <a class="btn-primary" href="#">Get the App</a>
          <a class="btn-secondary" href="#">Browse Recipes</a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="phone-mockup">
          <div class="phone-screen">
            <div class="mockup-header">
              <span class="mockup-title">Trending Recipes</span>
            </div>
            <div class="mockup-card">
              <div class="mockup-img img-1"></div>
              <div class="mockup-info">
                <span class="mockup-recipe-title">Creamy Pasta Carbonara</span>
                <span class="mockup-meta">⭐ 4.9 · 25 min</span>
              </div>
            </div>
            <div class="mockup-card">
              <div class="mockup-img img-2"></div>
              <div class="mockup-info">
                <span class="mockup-recipe-title">Avocado Toast Deluxe</span>
                <span class="mockup-meta">⭐ 4.7 · 10 min</span>
              </div>
            </div>
            <div class="mockup-card">
              <div class="mockup-img img-3"></div>
              <div class="mockup-info">
                <span class="mockup-recipe-title">Mango Smoothie Bowl</span>
                <span class="mockup-meta">⭐ 4.8 · 15 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="features">
      <div class="section-inner">
        <h2 class="section-title">Everything you need for great cooking</h2>
        <p class="section-sub">From discovery to the dinner table — Yummy has you covered.</p>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🍳</div>
            <h3>Recipe Discovery</h3>
            <p>Browse thousands of recipes across every cuisine and dietary preference, curated by real home cooks.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Vibrant Community</h3>
            <p>Share your own creations, follow your favourite cooks, and get inspired by what others are making.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔖</div>
            <h3>Save &amp; Organise</h3>
            <p>Bookmark favourites and build your personal digital cookbook so great recipes are always at hand.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>Reviews &amp; Tips</h3>
            <p>Rate recipes, leave comments, and share pro tips that help the whole community cook better.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>Smart Search</h3>
            <p>Find recipes by ingredient, cuisine, cooking time, or dietary need in seconds.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Cook-along Mode</h3>
            <p>Step-by-step instructions optimised for the kitchen — screen stays on, text stays big.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SCREENSHOTS -->
    <section class="screenshots">
      <div class="section-inner">
        <h2 class="section-title">A beautiful experience on every screen</h2>
        <p class="section-sub">Designed with simplicity in mind so the food always takes centre stage.</p>
        <div class="screens-row">
          <div class="screen-card">
            <div class="screen-preview preview-feed">
              <div class="preview-bar"></div>
              <div class="preview-item tall"></div>
              <div class="preview-row">
                <div class="preview-item half"></div>
                <div class="preview-item half"></div>
              </div>
            </div>
            <p class="screen-label">Feed &amp; Discovery</p>
          </div>
          <div class="screen-card featured-screen">
            <div class="screen-preview preview-detail">
              <div class="preview-hero-img"></div>
              <div class="preview-content">
                <div class="preview-line long"></div>
                <div class="preview-line short"></div>
                <div class="preview-chips">
                  <div class="chip"></div>
                  <div class="chip"></div>
                  <div class="chip"></div>
                </div>
                <div class="preview-line medium"></div>
                <div class="preview-line medium"></div>
                <div class="preview-line short"></div>
              </div>
            </div>
            <p class="screen-label">Recipe Detail</p>
          </div>
          <div class="screen-card">
            <div class="screen-preview preview-profile">
              <div class="preview-avatar"></div>
              <div class="preview-line medium" style="margin: 0 auto 4px; width: 60%;"></div>
              <div class="preview-line short" style="margin: 0 auto 16px; width: 40%;"></div>
              <div class="preview-grid">
                <div class="preview-item grid-item"></div>
                <div class="preview-item grid-item"></div>
                <div class="preview-item grid-item"></div>
                <div class="preview-item grid-item"></div>
              </div>
            </div>
            <p class="screen-label">User Profile</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-logo">
          <span class="logo-icon">🍅</span>
          <span class="logo-text">Yummy</span>
        </div>
        <p class="footer-copy">&copy; 2025 Yummy. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }

    :host {
      display: block;
      font-family: 'Inter', 'Segoe UI', sans-serif;
      color: #1a1a2e;
      background: #fff;
    }

    /* NAV */
    .nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #f0f0f0;
    }
    .nav-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-logo { display: flex; align-items: center; gap: 8px; }
    .logo-icon { font-size: 26px; }
    .logo-text { font-size: 20px; font-weight: 700; color: #53B175; letter-spacing: -0.3px; }

    /* HERO */
    .hero {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      max-width: 1100px;
      margin: 0 auto;
      padding: 60px 24px;
      gap: 60px;
    }
    .hero-inner { flex: 1; }
    .hero-badge {
      display: inline-block;
      background: #e8f5ee;
      color: #53B175;
      font-size: 13px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 20px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .hero-title {
      font-size: clamp(36px, 5vw, 56px);
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -1px;
      color: #111;
      margin-bottom: 20px;
    }
    .hero-sub {
      font-size: 18px;
      line-height: 1.7;
      color: #555;
      max-width: 480px;
      margin-bottom: 36px;
    }
    .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
    .btn-primary {
      background: #53B175;
      color: #fff;
      padding: 14px 28px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #3d9459; }
    .btn-secondary {
      background: #f5f5f5;
      color: #333;
      padding: 14px 28px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn-secondary:hover { background: #e8e8e8; }

    /* PHONE MOCKUP */
    .hero-visual { flex: 0 0 auto; }
    .phone-mockup {
      width: 280px;
      height: 520px;
      background: #111;
      border-radius: 40px;
      padding: 16px;
      box-shadow: 0 40px 80px rgba(0,0,0,0.18), 0 0 0 2px #333;
    }
    .phone-screen {
      background: #fafafa;
      border-radius: 28px;
      height: 100%;
      overflow: hidden;
      padding: 16px;
    }
    .mockup-header { margin-bottom: 16px; }
    .mockup-title { font-size: 15px; font-weight: 700; color: #111; }
    .mockup-card {
      display: flex;
      gap: 10px;
      align-items: center;
      background: #fff;
      border-radius: 12px;
      padding: 8px;
      margin-bottom: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .mockup-img {
      width: 52px;
      height: 52px;
      border-radius: 8px;
      flex-shrink: 0;
    }
    .img-1 { background: linear-gradient(135deg, #f6d365, #fda085); }
    .img-2 { background: linear-gradient(135deg, #a8edea, #fed6e3); }
    .img-3 { background: linear-gradient(135deg, #f093fb, #f5576c); }
    .mockup-info { display: flex; flex-direction: column; gap: 4px; }
    .mockup-recipe-title { font-size: 12px; font-weight: 600; color: #111; }
    .mockup-meta { font-size: 11px; color: #888; }

    /* FEATURES */
    .features { background: #f9fbf9; padding: 80px 24px; }
    .section-inner { max-width: 1100px; margin: 0 auto; }
    .section-title {
      font-size: clamp(26px, 4vw, 36px);
      font-weight: 800;
      text-align: center;
      letter-spacing: -0.5px;
      color: #111;
      margin-bottom: 12px;
    }
    .section-sub {
      text-align: center;
      color: #666;
      font-size: 17px;
      margin-bottom: 52px;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }
    .feature-card {
      background: #fff;
      border-radius: 16px;
      padding: 28px;
      border: 1px solid #eee;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .feature-card:hover { box-shadow: 0 8px 32px rgba(83,177,117,0.12); transform: translateY(-2px); }
    .feature-icon { font-size: 32px; margin-bottom: 14px; }
    .feature-card h3 { font-size: 17px; font-weight: 700; color: #111; margin-bottom: 8px; }
    .feature-card p { font-size: 14px; line-height: 1.65; color: #666; }

    /* SCREENSHOTS */
    .screenshots { padding: 80px 24px; background: #fff; }
    .screens-row {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    .screen-card { text-align: center; }
    .screen-preview {
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e8e8e8;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      background: #fafafa;
    }
    .featured-screen .screen-preview {
      box-shadow: 0 20px 60px rgba(83,177,117,0.18);
      border-color: #c8e6d4;
      transform: scale(1.05);
    }
    .screen-label { margin-top: 16px; font-size: 13px; color: #888; font-weight: 500; }

    /* Feed preview */
    .preview-feed { width: 180px; padding: 12px; }
    .preview-bar { height: 8px; background: #eee; border-radius: 4px; margin-bottom: 12px; }
    .preview-item { background: #e8e8e8; border-radius: 8px; }
    .preview-item.tall { height: 100px; margin-bottom: 10px; }
    .preview-row { display: flex; gap: 8px; }
    .preview-item.half { flex: 1; height: 80px; }

    /* Detail preview */
    .preview-detail { width: 200px; }
    .preview-hero-img { height: 120px; background: linear-gradient(135deg, #53B175, #3d9459); }
    .preview-content { padding: 12px; }
    .preview-line { height: 8px; background: #e8e8e8; border-radius: 4px; margin-bottom: 8px; }
    .preview-line.long { width: 90%; }
    .preview-line.medium { width: 70%; }
    .preview-line.short { width: 45%; }
    .preview-chips { display: flex; gap: 6px; margin-bottom: 10px; }
    .chip { height: 20px; width: 48px; background: #e8f5ee; border-radius: 10px; }

    /* Profile preview */
    .preview-profile { width: 180px; padding: 16px; }
    .preview-avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #53B175, #3d9459); margin: 0 auto 10px; }
    .preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 4px; }
    .preview-item.grid-item { height: 60px; }

    /* FOOTER */
    .footer { background: #111; padding: 40px 24px; }
    .footer-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }
    .footer-logo { display: flex; align-items: center; gap: 8px; }
    .footer-logo .logo-text { color: #53B175; }
    .footer-copy { font-size: 13px; color: #666; }

    @media (max-width: 768px) {
      .hero { flex-direction: column; text-align: center; padding: 48px 24px; }
      .hero-sub { margin-left: auto; margin-right: auto; }
      .hero-actions { justify-content: center; }
      .hero-visual { order: -1; }
      .phone-mockup { width: 220px; height: 400px; }
    }
  `],
})
export class LandingComponent {}
