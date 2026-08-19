const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.resolve(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function requireText(text, message) {
  assert(html.includes(text), message);
}

[
  '記事 読書ナビゲーション（社務所だより／神籤草子 共通）',
  '本文領域を押し下げて上部に常設し、進捗率と残り時間を',
  '常時見せながら、本文へ一切重ならないようにする。',
  'body.reading-progress-active #main-content {',
  'padding-top: 64px;',
  '<div id="reading-progress-badge" aria-label="現在の読書進捗">',
  '<span class="rp-orbit" aria-hidden="true"><svg class="rp-ring" viewBox="0 0 36 36" focusable="false"><circle class="rp-ring-track" cx="18" cy="18" r="15"></circle><circle id="reading-progress-ring" class="rp-ring-progress" cx="18" cy="18" r="15"></circle></svg><span id="reading-progress-percent" class="rp-percent">0%</span></span>',
  'READING NAVIGATION',
  '<span id="reading-progress-time" class="rp-time">残り約0分</span>',
  '<span id="reading-progress-readout">0%</span>',
  '<div id="reading-progress-bar" role="progressbar" aria-label="記事の読書進捗" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="reading-progress-fill"></div></div>',
  'position: fixed;',
  'stroke-linecap: round;',
  'stroke-dasharray: 94.248;',
  'stroke-dashoffset: 94.248;',
  'document.body.classList.add(\'reading-progress-active\');',
  'document.body.classList.remove(\'reading-progress-active\');',
  "ring.style.strokeDashoffset = String(94.248 * (1 - percent / 100));",
  "readoutEl.textContent = progressText;",
  "badge.style.setProperty('--reading-progress', progressText);",
  "bar.setAttribute('aria-valuetext', `${progressText}、${remainingText}`);",
  '@media (max-width: 640px) {',
  '@media (prefers-reduced-motion: reduce) {',
].forEach((text) => requireText(text, `常設読書ナビゲーションの構造・更新・テーマ契約が不足しています: ${text}`));

const badgeMatches = html.match(/id="reading-progress-badge"/g) || [];
assert.equal(badgeMatches.length, 1, '読書進捗ナビゲーションは本文を覆う重複表示を避けるため、共通の常設面を一つだけ使用する必要があります。');
assert.equal(html.includes('article-reading-progress'), false, '記事ヘッダー内に旧来の読書進捗面を残してはいけません。');
assert.equal(html.includes('background: conic-gradient(from -90deg, var(--accent-red) var(--reading-progress)'), false, '円形進捗に終端が角張るconic-gradient方式を使用してはいけません。');
assert(/\.rp-ring-progress\s*\{[\s\S]*?stroke-linecap\s*:\s*round/.test(html), '円形進捗はSVG stroke-linecap: roundで終端を丸く描画する必要があります。');

const badgeStyle = html.match(/#reading-progress-badge\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
assert(badgeStyle, '常設読書ナビゲーションのスタイル定義がありません。');
assert(/position\s*:\s*fixed/.test(badgeStyle), '進捗率と残り時間はスクロール中も常時表示する必要があります。');
assert(/width\s*:\s*min\(660px, calc\(100vw - 120px\)\)/.test(badgeStyle), '常設読書ナビゲーションはモバイルとPCの両方で本文幅を妨げない最大幅を持つ必要があります。');
assert(/pointer-events\s*:\s*none/.test(badgeStyle), '常設読書ナビゲーションが本文の操作を妨げてはいけません。');

console.log('記事詳細の常設読書ナビゲーション回帰テストに合格しました。');
console.log(JSON.stringify({
  singlePersistentNavigation: true,
  contentReservationPreserved: true,
  realtimePercentAndRemainingTimePreserved: true,
  circularProgressIndicatorPreserved: true,
  roundedCircularProgressEndpointsPreserved: true,
  lightDarkMobileReducedMotionContracts: true,
  ariaProgressValueAndTextPreserved: true,
}, null, 2));
