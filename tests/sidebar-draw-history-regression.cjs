const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.resolve(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const finalStyle = html.match(/<style id="ver4-sidebar-final-overrides">([\s\S]*?)<\/style>/)?.[1] || '';

function requireText(text, message) {
  assert(html.includes(text), message);
}

function requireStyle(text, message) {
  assert(finalStyle.includes(text), message);
}

assert(finalStyle, 'サイドバー・追加札導線・更新の軌跡の最終スタイルを抽出できません。');

assert.equal(
  html.includes('body.sidebar-collapsed:not(.sidebar-pinned) #sidebar:hover .nav-group-title'),
  false,
  '閉じたPCサイドバーでホバー時にカテゴリ見出しを再表示する旧規則が残っています。'
);
assert.equal(
  finalStyle.includes('body:not(.sidebar-button-mode) #sidebar.sidebar-v4:hover'),
  false,
  '閉じたPCサイドバーをホバーだけで展開するVer.4.0規則が残っています。'
);

[
  '<a class="sidebar-v4-skip-link" href="#main-content">本文へ移動</a>',
  '<nav id="sidebar" class="sidebar-v4" aria-label="天命乃杜の主要メニュー">',
  'id="sidebar-toggle" type="button" class="nav-btn nav-toggle-btn"',
  'aria-controls="sidebar-navigation-list" aria-expanded="false" aria-label="メニューを開く"',
  '<div id="sidebar-navigation-list" class="sidebar-v4-scroll-area">',
  'id="nav-home" aria-current="page"',
  '<main id="main-content" tabindex="-1">',
  'function updateSidebarA11y()',
  'function closeSidebarFromKeyboard()',
  "if (event.key === 'Escape') closeSidebarFromKeyboard();",
  "toggle.setAttribute('aria-expanded', String(expanded));",
  "btn.removeAttribute('aria-current');",
  "activeBtn.setAttribute('aria-current', 'page');",
].forEach((text) => requireText(text, `サイドバーのVer.4.0構造または操作契約が不足しています: ${text}`));

[
  '.sidebar-v4-skip-link {',
  '#main-content:focus { outline: none; }',
  '#main-content:focus-visible {',
  'outline: 3px solid color-mix(in srgb, var(--accent-gold) 84%, #fff);',
  'html.dark #main-content:focus-visible {',
  '#sidebar.sidebar-v4 {',
  'border-radius: 24px;',
  '#sidebar.sidebar-v4 .sidebar-v4-scroll-area {',
  '#sidebar.sidebar-v4 .nav-btn:focus-visible {',
  '#sidebar.sidebar-v4 .nav-btn.active .nav-icon-box::before {',
  '@media (min-width: 1367px) and (hover: hover) {',
  'body:not(.sidebar-button-mode):not(.sidebar-collapsed) #sidebar.sidebar-v4 { width: 264px;',
  '@media (max-width: 1366px) {',
  'body.sidebar-pinned #sidebar.sidebar-v4 { width: min(264px, calc(100vw - 32px)) !important; }',
  'body.sidebar-pinned #main-content { margin-left: 84px !important; width: calc(100% - 84px) !important; }',
  '@media (prefers-reduced-motion: reduce) {',
].forEach((text) => requireStyle(text, `サイドバーのテーマ・フォーカス・レスポンシブ規則が不足しています: ${text}`));

[
  '.omikuji-draw-v4 #further-explore-btn {',
  'grid-template-columns: minmax(0, 1fr) auto;',
  'padding: clamp(24px, 3.5vw, 34px) !important;',
  '.omikuji-draw-v4 #further-explore-btn > div { min-width: 0; }',
  '@media (max-width: 1180px) {',
  '.omikuji-draw-v4 .omikuji-v4-more-btn { width: 100%; }',
].forEach((text) => requireStyle(text, `追加札導線の中間幅・モバイル表示規則が不足しています: ${text}`));

[
  'html.dark .ver-source-tooltip {',
  '--vh-paper: #191414;',
  '--vh-ink: #f5e8df;',
  'border-color: var(--vh-line) !important;',
  'html.dark .ver-source-tooltip-title { color: var(--vh-muted) !important;',
  'html.dark .ver-source-link-title { color: var(--vh-ink) !important;',
].forEach((text) => requireStyle(text, `更新の軌跡のダークテーマ参照ツールチップ規則が不足しています: ${text}`));

console.log('サイドバー、追加札導線、更新の軌跡参照表示の回帰テストに合格しました。');
console.log(JSON.stringify({
  sidebarSemanticNavigation: true,
  sidebarKeyboardAndFocusSupport: true,
  sidebarThemeAndResponsiveRules: true,
  closedDesktopSidebarDoesNotRevealCategoriesOnHover: true,
  mainFocusOutlineControlled: true,
  drawExploreResponsiveLayout: true,
  historySourceTooltipDarkTheme: true,
}, null, 2));
