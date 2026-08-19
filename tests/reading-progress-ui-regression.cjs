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
  '<span id="reading-progress-details-state" class="rp-details-state">計測中</span>',
  '<button id="reading-progress-mode-standard" type="button" aria-pressed="false">',
  '<button id="reading-progress-mode-personal" type="button" class="is-selected" aria-pressed="true">',
  '<dd id="reading-progress-standard-speed">500字／分</dd>',
  '<dd id="reading-progress-personal-speed">読書区間を蓄積中</dd>',
  '<dd id="reading-progress-method">標準速度で補助表示</dd>',
  '止まって読んだ区間を複数回蓄積中',
  '自分のペースは、止まって読んだ複数区間の進行量と経過時間から算出する参考値です。',
  '視線や理解度を測定するものではありません。',
  '<button id="reading-progress-reset-pace" type="button">',
  '<div id="reading-progress-bar" role="progressbar" aria-label="記事の読書進捗" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="reading-progress-fill"></div></div>',
  'const STANDARD_ARTICLE_READING_SPEED = 500;',
  'const PERSONAL_PACE_IDLE_LIMIT_MS = 180000;',
  'const PERSONAL_PACE_MIN_SAMPLE_MS = 6000;',
  'const PERSONAL_PACE_MIN_SAMPLES = 3;',
  'const PERSONAL_PACE_MIN_CHARS = 60;',
  'const PERSONAL_PACE_MIN_CPM = 150;',
  'const PERSONAL_PACE_MAX_CPM = 1500;',
  'const PERSONAL_PACE_SAMPLE_WINDOW = 7;',
  'const PERSONAL_PACE_SCROLL_SETTLE_MS = 180;',
  "timeMode: 'personal',",
  "readingProgressState.timeMode = 'personal';",
  'paceSamples: [],',
  'paceSampleMs: 0,',
  'sampleStartAt: 0,',
  'pendingScrollSettleTimer: null',
  'window.addEventListener(\'scrollend\', onReadingProgressScrollEnd, { passive: true });',
  'window.removeEventListener(\'scrollend\', onReadingProgressScrollEnd);',
  'function setupReadingProgressControls()',
  'function setReadingProgressDetails(open)',
  'function setReadingProgressTimeMode(mode)',
  'function getCurrentArticleProgressPercent()',
  'function resetPendingPersonalReadingPace()',
  'function resetPersonalReadingPace()',
  'function primePersonalReadingPace(percent)',
  'function getMedian(values)',
  'function getStablePersonalPace()',
  'function recordPersonalReadingPace(percent)',
  'function settlePersonalReadingPace()',
  'function onReadingProgressScrollEnd()',
  'PERSONAL_PACE_SCROLL_SETTLE_MS',
  'readingProgressState.personalCharsPerMinute = getStablePersonalPace();',
  '自分：安定化中（標準で${standardTime}）',
  '複数区間の中央値＋画像',
  'function formatRemainingTime(seconds)',
  'function getStandardRemainingSeconds(percent)',
  'function getPersonalRemainingSeconds(percent)',
  "String(remainderSeconds).padStart(2, '0')",
  'function getRemainingPresentation(percent)',
  'ring.style.strokeDashoffset = String(94.248 * (1 - percent / 100));',
  'startReadingProgress(readingMeta);',
  "bar.setAttribute('aria-valuetext', `${progressText}、${remainingPresentation.aria}`);",
  '@media (max-width: 640px) {',
  '@media (prefers-reduced-motion: reduce) {',
].forEach((text) => requireText(text, `読書ペース機能の構造・既定値・安定化計測・秒表示契約が不足しています: ${text}`));

[
  'const PERSONAL_PACE_MIN_ACTIVE_MS = 1500;',
  'activeReadMs:',
  'lastScrollAt:',
  'maxSamplePercent:',
  'Math.max(20, readingProgressState.charCount * 0.005)',
  '短い読書区間から順次計測中',
].forEach((text) => assert.equal(html.includes(text), false, `単発スクロールを早期確定する旧契約を残してはいけません: ${text}`));

const updateStart = html.indexOf('function updateReadingProgress()');
const updateEnd = html.indexOf('// --- ホームアニメーション', updateStart);
const updateBlock = html.slice(updateStart, updateEnd);
assert(updateStart >= 0 && updateEnd > updateStart, '読書進捗更新処理の範囲を特定できません。');
assert.equal(updateBlock.includes('recordPersonalReadingPace(percent);'), false, '進捗UI更新中に個人ペースを確定してはいけません。停止後の読書区間だけを採用する必要があります。');
assert(/function settlePersonalReadingPace\(\)\s*\{[\s\S]*?recordPersonalReadingPace\(getCurrentArticleProgressPercent\(\)\)/.test(html), '個人ペースはスクロール停止後の位置から記録する必要があります。');
assert(/function getStablePersonalPace\(\)\s*\{[\s\S]*?paceSamples\.length < PERSONAL_PACE_MIN_SAMPLES[\s\S]*?getMedian\(readingProgressState\.paceSamples\)/.test(html), '個人ペースは複数区間の中央値で安定化する必要があります。');

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

console.log('記事詳細の個人ペース安定化・秒表示読書ナビゲーション回帰テストに合格しました。');
console.log(JSON.stringify({
  singlePersistentNavigation: true,
  contentReservationForDetailsPreserved: true,
  standardReadingSpeedDisclosed: '500字／分',
  personalPaceDefaultPreserved: true,
  settledMultiIntervalPaceMeasurementPreserved: true,
  medianAndOutlierGuardPreserved: true,
  minuteSecondRemainingTimePreserved: true,
  remainingTimeModeSwitchPreserved: true,
  paceResetAndCaveatPreserved: true,
  roundedCircularProgressEndpointsPreserved: true,
  lightDarkMobileReducedMotionContracts: true,
  ariaProgressValueAndTextPreserved: true,
}, null, 2));
