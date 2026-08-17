const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.resolve(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const homeSection = html.match(/<section id="view-home"[\s\S]*?<section id="view-omikuji-mindset"/)?.[0] || '';

assert(homeSection, 'ホーム画面のセクションを抽出できません。');

function requireText(text, message) {
  assert(html.includes(text), message);
}

function requireHomeText(text, message) {
  assert(homeSection.includes(text), message);
}

[
  'class="home-v4-shell"',
  'class="home-v4-hero"',
  'data-ver4-hero-emblem',
  'class="home-v4-seal"',
  'id="home-anim-container"',
  'id="welcome-date"',
  'id="welcome-username"',
  'id="home-description-area"',
  'onclick="toggleHomeDescription()"',
  'onclick="startOmikuji()"',
  'onclick="openDiscordInvite()"',
  'id="worshipper-counter"',
  'id="live-counter"',
  'class="counter-update-time"',
  'id="today-anniv-card"',
  'id="today-anniv-date"',
  'id="today-anniv-body"',
  'id="home-tab-news-btn"',
  'id="home-tab-column-btn"',
  'id="home-tab-more-btn"',
  'id="home-news-list" class="home-v4-article-list"',
  'id="home-column-list" class="home-v4-article-list"',
  'onclick="openVerHistory()"',
].forEach((text) => requireHomeText(text, `ホームの既存操作またはVer.4.0構造が失われています: ${text}`));

[
  'window.renderHomeLists = function() {',
  'class="home-v4-article-entry"',
  "newsData.slice(0, 4)",
  "columnData.slice(0, 4)",
  "openArticle('${kind}', ${item.id})",
  'window.toggleHomeDescription = function() {',
  "toggle.setAttribute('aria-expanded', String(isHidden))",
  'window.switchHomeTab = function(tab) {',
  "newsBtn.setAttribute('aria-selected', String(isNews))",
  "colBtn.setAttribute('aria-selected', String(!isNews))",
  "moreBtn.setAttribute('onclick', isNews ? \"showView('news')\" : \"showView('column')\")",
].forEach((text) => requireText(text, `ホームの既存機能接続が失われています: ${text}`));

[
  '#view-home.view-section {',
  'width: min(100% - 32px, var(--ver4-content-width)) !important;',
  '#view-home .home-v4-hero {',
  'min-height: var(--ver4-hero-min-height);',
  '#view-home .home-v4-hero::before { position: absolute; inset: var(--ver4-hero-inner-inset);',
  '#view-home .home-v4-seal[data-ver4-hero-emblem] { display: grid; width: 128px;',
  '#view-home .home-v4-side { display: grid; grid-column: 2;',
  '#view-home .home-v4-counter,',
  '#view-home .home-v4-section-card {',
  'border-radius: var(--ver4-card-radius);',
  'html.dark #view-home.view-section {',
  '@media (max-width: 768px) {',
  '#view-home .home-v4-side { grid-column: 1;',
].forEach((text) => requireText(text, `ホームのVer.4.0意匠規則が失われています: ${text}`));

[
  '#view-news .news-bulletin-card,',
  '#view-column .column-library-card { min-height: 0 !important; padding: 0 !important; }',
  '#view-article-detail.news-chronicle-layout .news-chronicle-frame,',
  '#view-article-detail.column-reader-layout .column-reader-frame { width: 100%; }',
  '#view-article-detail.news-chronicle-layout .news-chronicle-document,',
  '#view-article-detail.column-reader-layout .column-reader-document { border: 1px solid var(--news-line, var(--column-line));',
  '#view-article-detail.news-chronicle-layout .news-chronicle-title,',
  '#view-article-detail.column-reader-layout .column-reader-title { max-width: 760px; font-size: clamp(1.5rem, 2.5vw, 2.25rem) !important;',
  '#view-article-detail.news-chronicle-layout .news-chronicle-body,',
  '#view-article-detail.column-reader-layout .column-reader-body { padding: clamp(1.35rem, 3.3vw, 2.5rem); }',
  '--article-max-width: 820px;',
  '--article-support-max-width: 820px;',
  "const widthMap = { standard: '820px', wide: '100%' };",
  "const supportWidthMap = { standard: '820px', wide: '100%' };",
  "root.style.setProperty('--article-support-max-width', supportWidthMap[settings.contentWidth] || supportWidthMap.standard);",
  "toc.style.maxWidth = 'var(--article-support-max-width, 820px)';",
  '.news-chronicle-body .article-content .article-toc-unified { width: 100% !important; max-width: var(--article-support-max-width, 820px) !important;',
  '.column-reader-body .article-content .article-toc-unified { width: 100% !important; max-width: var(--article-support-max-width, 820px) !important;',
  'html:not(.dark) #view-column .column-library-category {',
  'background: rgba(255, 255, 255, 0.62);',
  'html.dark #view-column .column-library-category {',
  'background: rgba(24, 21, 36, 0.78);',
  '.result-v4-action-group .action-card-btn {',
  'grid-template-rows: 30px auto auto;',
  '.result-v4-action-group .action-card-btn i,',
  '#view-zodiac .zodiac-large-calendar {',
  'box-sizing: border-box;',
  '#view-zodiac .zodiac-large-calendar h4 {',
].forEach((text) => requireText(text, `記事一覧・詳細の幅または文字階層の修正規則が失われています: ${text}`));

console.log('ホーム画面・記事表示のVer.4.0回帰テストに合格しました。');
console.log(JSON.stringify({
  homeHeroContract: true,
  homeActionsAndCountersPreserved: true,
  homeArticleTabsAndTransitionsPreserved: true,
  homeLightDarkResponsiveRulesPresent: true,
  articleCardPaddingConflictFixed: true,
  articleReaderFrameUnified: true,
  articleTitleScaleBounded: true,
  lightAndDarkColumnCategoryThemed: true,
  resultActionContentSeparated: true,
  zodiacCalendarWidthBounded: true,
  standardReadingSupportBalanced: true,
}, null, 2));
