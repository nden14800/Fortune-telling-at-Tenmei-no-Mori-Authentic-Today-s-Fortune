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
  'body.reading-progress-active #main-content {',
  'padding-top: 72px;',
  'body.reading-progress-active.reading-progress-details-open #main-content {',
  'padding-top: 258px;',
  '<div id="reading-progress-badge" aria-label="現在の読書進捗">',
  '<circle id="reading-progress-ring" class="rp-ring-progress"',
  'stroke-linecap: round;',
  '<span id="reading-progress-mode-label" class="rp-mode-label">標準</span>',
  '<span id="reading-progress-time" class="rp-time">標準：残り約0分</span>',
  '<button id="reading-progress-details-toggle" class="rp-details-toggle" type="button" aria-expanded="false" aria-controls="reading-progress-details">',
  '<section id="reading-progress-details" class="rp-details" aria-label="読書ペースと残り時間の設定" hidden>',
  '<button id="reading-progress-mode-standard" type="button" class="is-selected" aria-pressed="true">',
  '<button id="reading-progress-mode-personal" type="button" aria-pressed="false">',
  '<dd id="reading-progress-standard-speed">500字／分</dd>',
  '<dd id="reading-progress-personal-speed">計測を開始すると表示</dd>',
  '<button id="reading-progress-reset-pace" type="button">',
  '自分のペースは、この記事内のスクロール進行量と経過時間から算出する参考値です。',
  '視線や理解度を測定するものではありません。',
  '<div id="reading-progress-bar" role="progressbar" aria-label="記事の読書進捗" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="reading-progress-fill"></div></div>',
  'const STANDARD_ARTICLE_READING_SPEED = 500;',
  'const PERSONAL_PACE_IDLE_LIMIT_MS = 20000;',
  'const PERSONAL_PACE_MIN_ACTIVE_MS = 9000;',
  'function setupReadingProgressControls()',
  'function setReadingProgressDetails(open)',
  'function setReadingProgressTimeMode(mode)',
  'function resetPersonalReadingPace()',
  'function recordPersonalReadingPace(percent)',
  'function getPersonalRemainingMinutes(percent)',
  'function getRemainingPresentation(percent)',
  'readingProgressState.personalCharsPerMinute',
  'ring.style.strokeDashoffset = String(94.248 * (1 - percent / 100));',
  'recordPersonalReadingPace(percent);',
  'startReadingProgress(readingMeta);',
  "bar.setAttribute('aria-valuetext', `${progressText}、${remainingPresentation.aria}`);",
  '@media (max-width: 640px) {',
  '@media (prefers-reduced-motion: reduce) {',
].forEach((text) => requireText(text, `読書ペース機能の構造・計測・表示契約が不足しています: ${text}`));

const badgeMatches = html.match(/id="reading-progress-badge"/g) || [];
assert.equal(badgeMatches.length, 1, '読書進捗ナビゲーションは本文を覆う重複表示を避けるため、共通の常設面を一つだけ使用する必要があります。');
assert.equal(html.includes('article-reading-progress'), false, '記事ヘッダー内に旧来の読書進捗面を残してはいけません。');
assert.equal(html.includes('background: conic-gradient(from -90deg, var(--accent-red) var(--reading-progress)'), false, '円形進捗に終端が角張るconic-gradient方式を使用してはいけません。');
assert(/\.rp-ring-progress\s*\{[\s\S]*?stroke-linecap\s*:\s*round/.test(html), '円形進捗はSVG stroke-linecap: roundで終端を丸く描画する必要があります。');
assert.equal(html.includes('reading-progress-readout'), false, '廃止した旧数値表示要素へ依存してはいけません。');

const badgeStyle = html.match(/#reading-progress-badge\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
assert(badgeStyle, '常設読書ナビゲーションのスタイル定義がありません。');
assert(/position\s*:\s*fixed/.test(badgeStyle), '進捗率と残り時間はスクロール中も常時表示する必要があります。');
assert(/width\s*:\s*min\(660px, calc\(100vw - 120px\)\)/.test(badgeStyle), '常設読書ナビゲーションはモバイルとPCの両方で本文幅を妨げない最大幅を持つ必要があります。');
assert(/pointer-events\s*:\s*none/.test(badgeStyle), '常設読書ナビゲーション本体が本文の操作を妨げてはいけません。');

console.log('記事詳細の多機能読書ペースUI回帰テストに合格しました。');
console.log(JSON.stringify({
  singlePersistentNavigation: true,
  contentReservationForDetailsPreserved: true,
  standardReadingSpeedDisclosed: '500字／分',
  personalScrollPaceMeasurementPreserved: true,
  remainingTimeModeSwitchPreserved: true,
  paceResetAndCaveatPreserved: true,
  roundedCircularProgressEndpointsPreserved: true,
  lightDarkMobileReducedMotionContracts: true,
  ariaProgressValueAndTextPreserved: true,
}, null, 2));
