const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.resolve(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function requireText(text, message) {
  assert(html.includes(text), message);
}

function requireCount(pattern, minimum, message) {
  const count = (html.match(pattern) || []).length;
  assert(count >= minimum, `${message}（検出数: ${count}）`);
}

const statsSection = html.match(
  /<section id="view-stats"[\s\S]*?<\/section>\s*<!-- ビュー: 参拝証の発行/
)?.[0] || '';
assert(statsSection, '参拝の記録画面のセクションを抽出できません。');

[
  '<section id="view-stats" class="view-section stats-record-layout relative" aria-labelledby="stats-record-title">',
  'class="stats-record-hero"',
  'data-ver4-hero-emblem',
  'class="stats-record-mark"',
  'id="stats-content-wrapper" class="stats-record-stack"',
  'class="stats-record-stat-grid"',
  'class="stats-record-stat-card hero-total stats-card-interactive"',
  'class="stats-record-stat-card hero-daikichi stats-card-interactive"',
  'id="stats-insight-area" class="stats-record-insight stats-card-interactive"',
  'id="grid-total"',
  'id="graph-total-body"',
  'id="grid-spectrum"',
  'id="stats-spectrum-list"',
  'id="stats-lock"',
  'openGuestNameModal(() => { showView(\'stats\'); loadMyStats(); })',
].forEach((text) => requireText(text, `参拝の記録のVer.4.0構造または既存機能IDが失われています: ${text}`));

assert.equal(
  statsSection.includes('stats-header-hero-card'),
  false,
  '参拝の記録に置換前のstats-header-hero-cardが残っています。'
);

[
  '.stats-record-layout {',
  '#view-stats .stats-record-hero::before {',
  'inset: 12px;',
  'width: 128px;',
  'height: 128px;',
  'box-shadow: inset 0 0 0 7px',
  '.dark #view-stats .stats-record-hero {',
  '@media (max-width: 768px) {',
].forEach((text) => requireText(text, `参拝の記録の共通意匠・テーマ・レスポンシブ規則が不足しています: ${text}`));

[
  '<footer id="site-footer" class="footer-v4">',
  'class="footer-v4-line"',
  'id="footer-main-grid" class="footer-v4-main"',
  'class="footer-v4-brand"',
  'class="footer-v4-social"',
  'id="footer-nav-grid" class="footer-v4-nav" aria-label="フッターの主要ナビゲーション"',
  'class="footer-v4-bottom"',
  '.footer-v4 {',
  '.footer-v4-social-link {',
  '.footer-v4-nav {',
].forEach((text) => requireText(text, `フッターのVer.4.0構造またはテーマ規則が不足しています: ${text}`));

requireCount(/class="footer-v4-social-link"/g, 3, 'フッターの外部SNS導線が3件保持されていません。');
requireCount(/showView\('/g, 15, '既存の内部画面遷移導線が不足しています。');

[
  '<nav id="news-pagination" class="news-bulletin-pagination" aria-label="社務所だよりのページ送り"></nav>',
  '<nav id="column-pagination" class="column-library-pagination" aria-label="神籤草子のページ送り"></nav>',
  'let html = `<div class="modern-pagination ver4-pagination"',
  'aria-label="最初のページへ"',
  'aria-label="前のページへ"',
  'aria-label="次のページへ"',
  'aria-label="最後のページへ"',
  'aria-label="移動するページ番号"',
  '.modern-pagination.ver4-pagination {',
].forEach((text) => requireText(text, `記事一覧ページネーションのVer.4.0操作契約が不足しています: ${text}`));

[
  '<select id="user-sign" class="modern-select custom-select-native" aria-label="星座を選ぶ">',
  '<select id="user-blood" class="modern-select custom-select-native" aria-label="血液型を選ぶ">',
  '<select id="search-type" class="modern-filter-select custom-select-native" aria-label="運勢で絞り込む">',
  '.custom-select-shell {',
  '.custom-select-native,',
  'appearance: none !important;',
  '.custom-select-native option {',
].forEach((text) => requireText(text, `カスタム選択欄のネイティブ互換・アクセシビリティ契約が不足しています: ${text}`));

requireCount(/class="custom-select-shell/g, 3, 'カスタム選択欄のシェルが3件保持されていません。');
requireCount(/custom-select-chevron/g, 3, 'カスタム選択欄の開閉表示が3件保持されていません。');

console.log('参拝の記録・フッター・ページネーション・カスタム選択欄の回帰テストに合格しました。');
console.log(JSON.stringify({
  statsVer4Structure: true,
  footerVer4Structure: true,
  articlePaginationAccessible: true,
  nativeSelectSemanticsPreserved: true,
  lightDarkResponsiveRulesPresent: true,
}, null, 2));
