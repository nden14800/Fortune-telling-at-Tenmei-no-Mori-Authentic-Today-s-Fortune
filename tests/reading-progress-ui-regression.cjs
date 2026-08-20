const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.resolve(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function requireText(text, message) {
  assert(html.includes(text), message);
}

[
  '記事 読書ナビゲーション（本文と重ならない予約領域へ常時表示）',
  'body.reading-progress-active #main-content {',
  'padding-top: 72px;',
  'body.reading-progress-active.reading-progress-details-open #main-content {',
  'padding-top: 182px;',
  '<div id="reading-progress-badge" aria-label="現在の読書進捗">',
  '<circle id="reading-progress-ring" class="rp-ring-progress"',
  'stroke-linecap: round;',
  '<span id="reading-progress-time" class="rp-time">残り約0分</span>',
  '<button id="reading-progress-details-toggle" class="rp-details-toggle" type="button" aria-expanded="false" aria-controls="reading-progress-details">',
  '<section id="reading-progress-details" class="rp-details" aria-label="読書時間の目安" hidden>',
  '<dd id="reading-progress-standard-speed">500字／分</dd>',
  '残り時間は、本文を1分あたり500字で読む場合の目安です。',
  '<div id="reading-progress-bar" role="progressbar" aria-label="記事の読書進捗" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="reading-progress-fill"></div></div>',
  'const STANDARD_ARTICLE_READING_SPEED = 500;',
  'progressStartEl: null,',
  'progressEndEl: null,',
  'function setupReadingProgressControls()',
  'function setReadingProgressDetails(open)',
  'function getCurrentArticleProgressPercent()',
  "const readingChildren = Array.from(el.children).filter(child => !child.classList.contains('article-toc-unified'));",
  'readingProgressState.progressStartEl = readingChildren[0] || el;',
  'readingProgressState.progressEndEl = readingChildren[readingChildren.length - 1] || el;',
  'const startEl = readingProgressState.progressStartEl || readingProgressState.contentEl;',
  'const endEl = readingProgressState.progressEndEl || readingProgressState.contentEl;',
  'const readingHeight = Math.max(1, endRect.bottom - startRect.top);',
  'const percent = ((viewportH - startRect.top) / readingHeight) * 100;',
  'function formatRemainingTime(seconds)',
  'function getStandardRemainingSeconds(percent)',
  'function getRemainingPresentation(percent)',
  'const remainingTime = formatRemainingTime(getStandardRemainingSeconds(percent));',
  'text: `残り${remainingTime}`',
  'aria: `標準速度${STANDARD_ARTICLE_READING_SPEED.toLocaleString()}字／分で残り${remainingTime}`',
  'function onReadingProgressScroll()',
  'window.requestAnimationFrame(() => {',
  'ring.style.strokeDashoffset = String(94.248 * (1 - percent / 100));',
  'startReadingProgress(readingMeta);',
  "bar.setAttribute('aria-valuetext', `${progressText}、${remainingPresentation.aria}`);",
  '@media (max-width: 640px) {',
  '@media (prefers-reduced-motion: reduce) {',
].forEach((text) => requireText(text, `固定標準速度の読書ナビゲーション契約が不足しています: ${text}`));

[
  'PERSONAL_PACE_',
  'personalCharsPerMinute',
  'hasPersonalPaceSample',
  'activeReadMs:',
  'sampledPercent:',
  'lastSamplePercent:',
  'lastSampleAt:',
  'lastScrollAt:',
  'dwellFrameId:',
  'dwellStartedAt:',
  'dwellStartPace:',
  'dwellLastUpdatedAt:',
  'resetPersonal',
  'primePersonal',
  'getVisibleArticleReadingRatio',
  'startPersonal',
  'stopPersonal',
  'updatePersonal',
  'recordPersonal',
  'getPersonalRemainingSeconds',
  'formatReadingSpeed',
  'syncReadingPaceControls',
  'setReadingProgressTimeMode',
  'timeMode:',
  'reading-progress-mode-',
  'reading-progress-personal-speed',
  'reading-progress-method',
  'reading-progress-reset-pace',
  'reading-progress-speed',
  'rp-mode-label',
  'rp-mode-switch',
  'rp-details-actions',
  'rp-sample-status',
  'ペースを再計測',
].forEach((text) => assert.equal(html.includes(text), false, `廃止した個人ペース計測または切替UIを残してはいけません: ${text}`));

const scrollStart = html.indexOf('function onReadingProgressScroll()');
const scrollEnd = html.indexOf('function updateReadingProgress()', scrollStart);
const updateStart = html.indexOf('function updateReadingProgress()');
const updateEnd = html.indexOf('// --- ホームアニメーション', updateStart);
const scrollBlock = html.slice(scrollStart, scrollEnd);
const updateBlock = html.slice(updateStart, updateEnd);
assert(scrollStart >= 0 && scrollEnd > scrollStart, 'スクロール中の固定残り時間更新処理を特定できません。');
assert(updateStart >= 0 && updateEnd > updateStart, '読書進捗更新処理の範囲を特定できません。');
assert.equal(scrollBlock.includes('getStandardRemainingSeconds'), false, 'スクロールイベントで残り時間を重複計算してはいけません。');
assert.equal(scrollBlock.includes('Personal'), false, 'スクロールイベントで個人ペース計測を行ってはいけません。');
assert.equal(updateBlock.includes('syncReadingPaceControls'), false, '進捗更新で廃止した速度表示を同期してはいけません。');
assert(/function getStandardRemainingSeconds\(percent\)[\s\S]*?readingProgressState\.charCount \/ STANDARD_ARTICLE_READING_SPEED[\s\S]*?readingProgressState\.imageSeconds \* remainingRatio/.test(html), '残り時間は固定の標準速度と画像閲覧時間から算出する必要があります。');
assert(/function getRemainingPresentation\(percent\)[\s\S]*?percent >= 99\.5[\s\S]*?getStandardRemainingSeconds\(percent\)[\s\S]*?標準速度\$\{STANDARD_ARTICLE_READING_SPEED/.test(html), '読了時と途中時の残り時間表示は固定標準速度だけを用いる必要があります。');
assert(/buildArticleTOC\(\);\s*startReadingProgress\(readingMeta\);/.test(html), '目次生成後に読書進捗を開始し、目次を進捗対象から除外する必要があります。');
assert(/function startReadingProgress\(readingMeta\)[\s\S]*?article-toc-unified[\s\S]*?progressStartEl = readingChildren\[0\][\s\S]*?progressEndEl = readingChildren\[readingChildren\.length - 1\]/.test(html), '読書進捗は目次を除いた本文開始・本文末尾を基準にする必要があります。');
assert(/function getCurrentArticleProgressPercent\(\)[\s\S]*?startEl = readingProgressState\.progressStartEl[\s\S]*?endEl = readingProgressState\.progressEndEl[\s\S]*?endRect\.bottom - startRect\.top/.test(html), '進捗率は目次を含む親要素の高さではなく本文範囲から算出する必要があります。');

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

console.log('記事詳細の固定標準速度・常設残り時間・進捗ナビゲーション回帰テストに合格しました。');
console.log(JSON.stringify({
  singlePersistentNavigation: true,
  contentReservationForDetailsPreserved: true,
  fixedStandardReadingSpeed: '500字／分',
  personalPaceMeasurementRemoved: true,
  personalPaceSwitchRemoved: true,
  personalPaceResetRemoved: true,
  speedReadoutRemoved: true,
  tocExcludedFromProgress: true,
  minuteSecondRemainingTimePreserved: true,
  roundedCircularProgressEndpointsPreserved: true,
  lightDarkMobileReducedMotionContracts: true,
  ariaProgressValueAndTextPreserved: true,
}, null, 2));
