import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [],
  template: `
    <!-- NAV -->
    <nav class="nav">
      <div class="nav-inner">
        <div class="nav-logo">
          <span class="logo-icon">🍅</span>
          <span class="logo-text">Yummy</span>
        </div>
        <div class="nav-badges">
          <span class="platform-badge">Android</span>
          <span class="platform-badge">iOS</span>
        </div>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-badge">Recipe Social Platform</div>
        <h1 class="hero-title">Cook. Share.<br/>Connect.</h1>
        <p class="hero-sub">
          Yummy is a mobile recipe-sharing community where home cooks discover recipes
          from around the world, share their own creations, and connect with people
          who love food as much as they do.
        </p>
        <div class="hero-tags">
          <span class="tag">🌍 English &amp; Georgian</span>
          <span class="tag">📱 Android &amp; iOS</span>
          <span class="tag">🌙 Dark mode</span>
        </div>
        <div class="hero-actions">
          <a class="btn-primary" href="#">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.4.07 2.38.74 3.2.8 1.23-.24 2.4-.93 3.65-.84 1.55.13 2.72.74 3.47 1.9-3.14 1.93-2.4 6.13.68 7.34-.55 1.32-1.25 2.6-3 3.66zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            App Store
          </a>
          <a class="btn-primary btn-android" href="#">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5S11 23.33 11 22.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0 0 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31A5.983 5.983 0 0 0 6 7h12a5.98 5.98 0 0 0-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/></svg>
            Google Play
          </a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="phone-stack">
          <div class="phone phone-back">
            <div class="phone-screen screen-back">
              <div class="screen-header">
                <span class="screen-tab active-tab">Global</span>
                <span class="screen-tab">Following</span>
                <span class="screen-tab">Trending</span>
              </div>
              <div class="recipe-card-mockup">
                <div class="recipe-img" style="background: linear-gradient(135deg,#f6d365,#fda085)"></div>
                <div class="recipe-body">
                  <div class="recipe-name">Georgian Khachapuri</div>
                  <div class="recipe-meta">⏱ 45 min &nbsp;·&nbsp; ⭐ 4.9</div>
                  <div class="recipe-actions-row">
                    <span class="action-chip">❤️ 248</span>
                    <span class="action-chip">💬 31</span>
                    <span class="action-chip">🔖</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="phone phone-front">
            <div class="phone-screen screen-front">
              <div class="detail-img" style="background: linear-gradient(160deg,#53B175 0%,#3d9459 100%)">
                <div class="detail-overlay">
                  <div class="detail-title">Adjaruli Khachapuri</div>
                  <div class="detail-author">by @nino.k</div>
                </div>
              </div>
              <div class="detail-content">
                <div class="detail-chips">
                  <span class="d-chip">Georgian</span>
                  <span class="d-chip">Bread</span>
                  <span class="d-chip">Easy</span>
                </div>
                <div class="detail-row">
                  <div class="detail-stat"><div class="stat-val">35</div><div class="stat-lbl">min</div></div>
                  <div class="detail-stat"><div class="stat-val">4</div><div class="stat-lbl">servings</div></div>
                  <div class="detail-stat"><div class="stat-val">Easy</div><div class="stat-lbl">level</div></div>
                </div>
                <div class="detail-section-title">Ingredients</div>
                <div class="ing-line"></div>
                <div class="ing-line short"></div>
                <div class="ing-line medium"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES GRID -->
    <section class="features">
      <div class="section-inner">
        <h2 class="section-title">Everything a food lover needs</h2>
        <p class="section-sub">From your kitchen to the community — all in one app.</p>
        <div class="features-grid">

          <div class="feature-card feature-large">
            <div class="feature-icon">📱</div>
            <h3>Feed &amp; Discovery</h3>
            <p>Browse a global recipe feed or filter to people you follow. Sort by popularity or what's trending. Switch between a scrollable card view and a full-screen immersive mode — similar to short-video apps.</p>
          </div>

          <div class="feature-card feature-large">
            <div class="feature-icon">🧑‍🍳</div>
            <h3>Cook with What You Have</h3>
            <p>Enter the ingredients you already have at home and get back recipes you can actually make. Results are ranked by ingredient match — see perfect matches and near-matches that only need one or two extras.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📝</div>
            <h3>Recipe Creation</h3>
            <p>Write full recipes with ingredients, step-by-step instructions, cooking time, difficulty, and multiple photos.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>Rich Search &amp; Filters</h3>
            <p>Find recipes by keyword, cuisine, tags, cooking time, difficulty level, or specific ingredients — filters can be combined.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Social Graph</h3>
            <p>Follow cooks you love. See their profiles, follower counts, and recipe grids. Discover new creators through the community.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📤</div>
            <h3>Private Recipe Sharing</h3>
            <p>Share specific recipes privately with individual followers. Recipients get a dedicated inbox, grouped by date.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🛒</div>
            <h3>Shopping List</h3>
            <p>Build a shopping list directly from recipe ingredients. Share it with others — shared lists arrive in a separate inbox.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>Threaded Comments</h3>
            <p>Every recipe has a comment section with likes, replies, and threads. Edit or delete your own comments anytime.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔔</div>
            <h3>Real-time Notifications</h3>
            <p>Get notified about new followers, likes, comments, bookmarks, and shared content — with badge counts on the nav bar.</p>
          </div>

        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="how">
      <div class="section-inner">
        <h2 class="section-title">Built for home cooks</h2>
        <p class="section-sub">Simple enough to use every day. Powerful enough for serious food enthusiasts.</p>
        <div class="steps-row">
          <div class="step">
            <div class="step-num">1</div>
            <h3>Create an account</h3>
            <p>Sign up with email or continue with Google. Email verification keeps the community authentic.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">2</div>
            <h3>Explore &amp; follow</h3>
            <p>Browse the global feed, search by ingredient or cuisine, and follow the cooks whose food inspires you.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">3</div>
            <h3>Cook &amp; share</h3>
            <p>Post your own recipes with photos and instructions. Save favourites, build shopping lists, and share with friends.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- PLATFORM & LANGUAGE -->
    <section class="platform">
      <div class="section-inner platform-inner">
        <div class="platform-card">
          <div class="platform-icon">🌍</div>
          <h3>Two languages, one community</h3>
          <p>Yummy is fully available in <strong>English</strong> and <strong>Georgian (ქართული)</strong>. Switch languages anytime from settings — every screen, every label, fully translated.</p>
        </div>
        <div class="platform-card">
          <div class="platform-icon">🌙</div>
          <h3>Light, dark, and system theme</h3>
          <p>Choose your preferred appearance or let the app follow your device setting automatically. Designed to look great in any mode.</p>
        </div>
        <div class="platform-card">
          <div class="platform-icon">📲</div>
          <h3>Android &amp; iOS</h3>
          <p>Built with Flutter for a native-quality experience on both platforms. One codebase, zero compromises on performance or feel.</p>
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
    .nav-logo { display: flex; align-items: center; gap: 8px; }
    .logo-icon { font-size: 26px; }
    .logo-text { font-size: 20px; font-weight: 700; color: #53B175; letter-spacing: -0.3px; }
    .nav-badges { display: flex; gap: 8px; }
    .platform-badge {
      font-size: 12px; font-weight: 600; color: #53B175;
      background: #e8f5ee; padding: 3px 10px; border-radius: 20px;
    }

    /* ─── HERO ────────────────────────────── */
    .hero {
      min-height: calc(100vh - 64px);
      display: flex; align-items: center;
      max-width: 1100px; margin: 0 auto;
      padding: 60px 24px; gap: 60px;
    }
    .hero-inner { flex: 1; }
    .hero-badge {
      display: inline-block; background: #e8f5ee; color: #53B175;
      font-size: 12px; font-weight: 700; padding: 4px 12px;
      border-radius: 20px; margin-bottom: 20px;
      letter-spacing: 0.8px; text-transform: uppercase;
    }
    .hero-title {
      font-size: clamp(42px, 6vw, 68px); font-weight: 900;
      line-height: 1.05; letter-spacing: -2px; color: #111; margin-bottom: 20px;
    }
    .hero-sub {
      font-size: 17px; line-height: 1.75; color: #555;
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

    /* ─── PHONE STACK ─────────────────────── */
    .hero-visual { flex: 0 0 auto; }
    .phone-stack { position: relative; width: 280px; height: 520px; }

    .phone {
      position: absolute;
      background: #111;
      border-radius: 36px;
      padding: 14px;
      box-shadow: 0 30px 70px rgba(0,0,0,0.22);
    }
    .phone-back {
      width: 240px; height: 460px;
      top: 0; left: 0;
      transform: rotate(-6deg);
      box-shadow: 0 20px 50px rgba(0,0,0,0.15);
      z-index: 1;
    }
    .phone-front {
      width: 250px; height: 490px;
      bottom: 0; right: 0;
      z-index: 2;
    }
    .phone-screen {
      background: #fafafa; border-radius: 24px;
      height: 100%; overflow: hidden;
    }

    /* Back phone — feed */
    .screen-back { padding: 12px; }
    .screen-header { display: flex; gap: 8px; margin-bottom: 14px; }
    .screen-tab { font-size: 11px; font-weight: 600; color: #aaa; }
    .active-tab { color: #53B175; border-bottom: 2px solid #53B175; padding-bottom: 2px; }
    .recipe-card-mockup { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .recipe-img { height: 100px; }
    .recipe-body { padding: 10px; }
    .recipe-name { font-size: 12px; font-weight: 700; color: #111; margin-bottom: 4px; }
    .recipe-meta { font-size: 10px; color: #888; margin-bottom: 8px; }
    .recipe-actions-row { display: flex; gap: 6px; }
    .action-chip { font-size: 10px; background: #f5f5f5; padding: 3px 7px; border-radius: 8px; color: #555; }

    /* Front phone — recipe detail */
    .screen-front { background: #fff; }
    .detail-img { height: 160px; position: relative; }
    .detail-overlay {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 12px; background: linear-gradient(transparent, rgba(0,0,0,0.6));
    }
    .detail-title { font-size: 13px; font-weight: 700; color: #fff; }
    .detail-author { font-size: 10px; color: rgba(255,255,255,0.8); }
    .detail-content { padding: 12px; }
    .detail-chips { display: flex; gap: 6px; margin-bottom: 12px; }
    .d-chip { font-size: 10px; background: #e8f5ee; color: #53B175; padding: 3px 8px; border-radius: 8px; font-weight: 600; }
    .detail-row { display: flex; gap: 8px; margin-bottom: 14px; }
    .detail-stat {
      flex: 1; background: #f9f9f9; border-radius: 10px;
      padding: 8px 4px; text-align: center;
    }
    .stat-val { font-size: 13px; font-weight: 700; color: #111; }
    .stat-lbl { font-size: 9px; color: #888; }
    .detail-section-title { font-size: 11px; font-weight: 700; color: #111; margin-bottom: 8px; }
    .ing-line { height: 7px; background: #eee; border-radius: 4px; margin-bottom: 6px; width: 90%; }
    .ing-line.short { width: 55%; }
    .ing-line.medium { width: 72%; }

    /* ─── FEATURES ────────────────────────── */
    .features { background: #f9fbf9; padding: 90px 24px; }
    .section-inner { max-width: 1100px; margin: 0 auto; }
    .section-title {
      font-size: clamp(26px, 4vw, 38px); font-weight: 800;
      text-align: center; letter-spacing: -0.5px; color: #111; margin-bottom: 12px;
    }
    .section-sub { text-align: center; color: #666; font-size: 17px; margin-bottom: 52px; }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: auto;
      gap: 20px;
    }
    .feature-card {
      background: #fff; border-radius: 16px; padding: 28px;
      border: 1px solid #eee;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .feature-card:hover { box-shadow: 0 8px 32px rgba(83,177,117,0.12); transform: translateY(-2px); }
    .feature-large { grid-column: span 1; }
    .feature-icon { font-size: 30px; margin-bottom: 14px; }
    .feature-card h3 { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 8px; }
    .feature-card p { font-size: 14px; line-height: 1.65; color: #666; }

    /* ─── HOW IT WORKS ────────────────────── */
    .how { padding: 90px 24px; background: #fff; }
    .steps-row {
      display: flex; align-items: flex-start;
      justify-content: center; gap: 8px; flex-wrap: wrap;
    }
    .step {
      flex: 1; min-width: 200px; max-width: 280px;
      text-align: center; padding: 8px;
    }
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
    .platform-inner {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
      margin-top: 52px !important;
    }
    .platform-card {
      background: #1a1a1a; border-radius: 16px; padding: 28px;
      border: 1px solid #2a2a2a;
    }
    .platform-icon { font-size: 32px; margin-bottom: 16px; }
    .platform-card h3 { font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 10px; }
    .platform-card p { font-size: 14px; line-height: 1.65; color: #888; }
    .platform-card strong { color: #53B175; }

    /* ─── FOOTER ──────────────────────────── */
    .footer { background: #0a0a0a; padding: 36px 24px; }
    .footer-inner {
      max-width: 1100px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 16px;
    }
    .footer-logo { display: flex; align-items: center; gap: 8px; }
    .footer-logo .logo-text { color: #53B175; }
    .footer-copy { font-size: 13px; color: #555; }

    /* ─── RESPONSIVE ──────────────────────── */
    @media (max-width: 860px) {
      .hero { flex-direction: column; text-align: center; padding: 48px 24px; gap: 48px; }
      .hero-sub { margin: 0 auto 24px; }
      .hero-tags { justify-content: center; }
      .hero-actions { justify-content: center; }
      .hero-visual { order: -1; }
      .phone-stack { width: 220px; height: 400px; }
      .phone-back { width: 190px; height: 360px; }
      .phone-front { width: 200px; height: 390px; }
      .features-grid { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 560px) {
      .features-grid { grid-template-columns: 1fr; }
      .steps-row { flex-direction: column; align-items: center; }
      .step-arrow { transform: rotate(90deg); }
    }
  `],
})
export class LandingComponent {}
