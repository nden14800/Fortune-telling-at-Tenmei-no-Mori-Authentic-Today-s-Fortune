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
  '<span id="reading-progress-mode-label" class="rp-mode-label">自分</span>',
  '<span id="reading-progress-time" class="rp-time">自分：残り約0分</span>',
  '<span id="reading-progress-speed" class="rp-speed" aria-label="現在の読書速度">500字／分</span>',
  '#reading-progress-badge .rp-readout {',
  '#reading-progress-badge .rp-speed {',
  '.dark #reading-progress-badge .rp-speed { color: #f0d68e; }',
  '<button id="reading-progress-details-toggle" class="rp-details-toggle" type="button" aria-expanded="false" aria-controls="reading-progress-details">',
  '<section id="reading-progress-details" class="rp-details" aria-label="読書ペースと残り時間の設定" hidden>',
  '<span id="reading-progress-details-state" class="rp-details-state">計測中</span>',
  '<button id="reading-progress-mode-standard" type="button" aria-pressed="false">',
  '<button id="reading-progress-mode-personal" type="button" class="is-selected" aria-pressed="true">',
  '<dd id="reading-progress-standard-speed">500字／分</dd>',
  '<dd id="reading-progress-personal-speed">表示本文量・滞在時間でリアルタイム推定</dd>',
  '<dd id="reading-progress-method">標準速度で補助表示</dd>',
  '本文の表示時間・進行に合わせてリアルタイム推定',
  '自分のペースは、この記事内の進行量・表示中の本文量・滞在時間を連続的に平滑化して算出する参考値です。',
  '視線や理解度を測定するものではありません。',
  '<button id="reading-progress-reset-pace" type="button">',
  '<div id="reading-progress-bar" role="progressbar" aria-label="記事の読書進捗" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="reading-progress-fill"></div></div>',
  'const STANDARD_ARTICLE_READING_SPEED = 500;',
  'const PERSONAL_PACE_IDLE_LIMIT_MS = 120000;',
  'const PERSONAL_PACE_MIN_ACTIVE_MS = 0;',
  'const PERSONAL_PACE_MIN_CHARS = 1;',
  'const PERSONAL_PACE_MIN_CPM = 150;',
  'const PERSONAL_PACE_MAX_CPM = 2400;',
  'const PERSONAL_PACE_INITIAL_WEIGHT = 0.12;',
  'const PERSONAL_PACE_SMOOTHING = 0.18;',
  'const PERSONAL_PACE_DWELL_SMOOTHING = 0.08;',
  'const PERSONAL_PACE_DWELL_INITIAL_WEIGHT = 0.03;',
  'const PERSONAL_PACE_DWELL_VISIBLE_READ_FRACTION = 0.25;',
  'const PERSONAL_PACE_DWELL_MAX_CPM = 1200;',
  'const PERSONAL_PACE_DWELL_INTERVAL_MS = 1000;',
  'const PERSONAL_PACE_PROGRESS_EPSILON = 0.005;',
  "timeMode: 'personal',",
  "readingProgressState.timeMode = 'personal';",
  'progressStartEl: null,',
  'progressEndEl: null,',
  'personalCharsPerMinute: STANDARD_ARTICLE_READING_SPEED,',
  'hasPersonalPaceSample: false,',
  'activeReadMs: 0,',
  'sampledPercent: 0,',
  'lastSamplePercent: null,',
  'lastSampleAt: 0,',
  'lastScrollAt: 0,',
  'dwellTimerId: null,',
  'dwellStartedAt: 0,',
  'dwellLastUpdatedAt: 0',
  'function setupReadingProgressControls()',
  'function setReadingProgressDetails(open)',
  'function setReadingProgressTimeMode(mode)',
  'function getCurrentArticleProgressPercent()',
  "const readingChildren = Array.from(el.children).filter(child => !child.classList.contains('article-toc-unified'));",
  'readingProgressState.progressStartEl = readingChildren[0] || el;',
  'readingProgressState.progressEndEl = readingChildren[readingChildren.length - 1] || el;',
  'const startEl = readingProgressState.progressStartEl || readingProgressState.contentEl;',
  'const endEl = readingProgressState.progressEndEl || readingProgressState.contentEl;',
  'const readingHeight = Math.max(1, endRect.bottom - startRect.top);',
  'const percent = ((viewportH - startRect.top) / readingHeight) * 100;',
  'function resetPersonalReadingBaseline()',
  'function resetPersonalReadingPace()',
  'function primePersonalReadingPace(percent)',
  'function recordPersonalReadingPace(percent)',
  'function getVisibleArticleReadingRatio()',
  'function startPersonalDwellSession()',
  'function updatePersonalPaceFromDwell()',
  'function startPersonalDwellTimer()',
  'function stopPersonalDwellTimer()',
  'const boundedInstantaneous = Math.max(PERSONAL_PACE_MIN_CPM, Math.min(PERSONAL_PACE_MAX_CPM, instantaneous));',
  'const weight = readingProgressState.hasPersonalPaceSample ? PERSONAL_PACE_SMOOTHING : PERSONAL_PACE_INITIAL_WEIGHT;',
  'readingProgressState.hasPersonalPaceSample = true;',
  '本文の表示時間または最初の進行からリアルタイム更新',
  '現在の自分の読書速度 ${Math.round(displayedSpeed).toLocaleString()}字／分${hasSample ? \'。リアルタイム更新中\' : \'。基準速度から開始\'}',
  'function formatRemainingTime(seconds)',
  'function getStandardRemainingSeconds(percent)',
  'function getPersonalRemainingSeconds(percent)',
  "String(remainderSeconds).padStart(2, '0')",
  'function getRemainingPresentation(percent)',
  '自分：残り${personalTime}',
  'ring.style.strokeDashoffset = String(94.248 * (1 - percent / 100));',
  'startReadingProgress(readingMeta);',
  "bar.setAttribute('aria-valuetext', `${progressText}、${remainingPresentation.aria}`);",
  '@media (max-width: 640px) {',
  '@media (prefers-reduced-motion: reduce) {',
].forEach((text) => requireText(text, `読書ペース機能の即時推定・常設速度表示・秒表示契約が不足しています: ${text}`));

[
  'const PERSONAL_PACE_MIN_SAMPLE_MS = 6000;',
  'const PERSONAL_PACE_MIN_SAMPLES = 3;',
  'const PERSONAL_PACE_SAMPLE_WINDOW = 7;',
  'const PERSONAL_PACE_SCROLL_SETTLE_MS = 180;',
  'paceSamples:',
  'paceSampleMs:',
  'sampleStartPercent:',
  'sampleStartAt:',
  'pendingScrollSettleTimer:',
  'window.addEventListener(\'scrollend\'',
  'function getMedian(values)',
  'function getStablePersonalPace()',
  'function settlePersonalReadingPace()',
  'function onReadingProgressScrollEnd()',
  '自分：安定化中（標準で${standardTime}）',
  '自分：推定中（標準で${standardTime}）',
  '複数区間の中央値＋画像',
].forEach((text) => assert.equal(html.includes(text), false, `停止後または待機中の推定契約を残してはいけません: ${text}`));

const scrollStart = html.indexOf('function onReadingProgressScroll()');
const scrollEnd = html.indexOf('function updateReadingProgress()', scrollStart);
const scrollBlock = html.slice(scrollStart, scrollEnd);
const updateStart = html.indexOf('function updateReadingProgress()');
const updateEnd = html.indexOf('// --- ホームアニメーション', updateStart);
const updateBlock = html.slice(updateStart, updateEnd);
assert(scrollStart >= 0 && scrollEnd > scrollStart, 'スクロール中の個人ペース更新処理を特定できません。');
assert(updateStart >= 0 && updateEnd > updateStart, '読書進捗更新処理の範囲を特定できません。');
assert(scrollBlock.includes('recordPersonalReadingPace(percent);'), '連続スクロール中の個人ペースは進行量からリアルタイム更新する必要があります。');
assert(scrollBlock.includes('updatePersonalPaceFromDwell();') && scrollBlock.includes('startPersonalDwellSession();'), 'スクロールを止めた後の本文滞在も個人ペース計測へ引き継ぐ必要があります。');
assert.equal(updateBlock.includes('recordPersonalReadingPace(percent);'), false, '表示更新だけで個人ペースを二重計算してはいけません。');
assert(/function resetPersonalReadingPace\(\)\s*\{[\s\S]*?personalCharsPerMinute = STANDARD_ARTICLE_READING_SPEED[\s\S]*?hasPersonalPaceSample = false/.test(html), '記事を開いた直後から基準速度を常設表示する必要があります。');
assert(/recordPersonalReadingPace\(percent\)[\s\S]*?elapsed < PERSONAL_PACE_MIN_ACTIVE_MS[\s\S]*?boundedInstantaneous[\s\S]*?PERSONAL_PACE_SMOOTHING[\s\S]*?hasPersonalPaceSample = true/.test(html), '最初の進行を待機なく採用し、範囲外の瞬間値も安全に収めて連続的に平滑化する必要があります。');
assert(/function updatePersonalPaceFromDwell\(\)[\s\S]*?elapsed > PERSONAL_PACE_IDLE_LIMIT_MS[\s\S]*?getVisibleArticleReadingRatio\(\)[\s\S]*?PERSONAL_PACE_DWELL_VISIBLE_READ_FRACTION[\s\S]*?PERSONAL_PACE_DWELL_MAX_CPM[\s\S]*?PERSONAL_PACE_DWELL_SMOOTHING[\s\S]*?hasPersonalPaceSample = true/.test(html), 'スクロール停止中は、表示本文量と滞在時間を用い、離席時間を除外しつつ過大評価を抑えて個人ペースを更新する必要があります。');
assert(/function startPersonalDwellTimer\(\)[\s\S]*?window\.setInterval\([\s\S]*?updatePersonalPaceFromDwell\(\)[\s\S]*?updateReadingProgress\(\)[\s\S]*?PERSONAL_PACE_DWELL_INTERVAL_MS/.test(html), 'スクロールイベントを待たず、滞在中の個人ペースと残り時間を連続更新するタイマーが必要です。');
assert(/speedReadout\.textContent = `\$\{Math\.round\(displayedSpeed\)\.toLocaleString\(\)\}字／分`/.test(html), '詳細パネルを開かず常設ナビゲーションで速度を確認できる必要があります。');
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

console.log('記事詳細の即時リアルタイム個人ペース・常設速度・秒表示読書ナビゲーション回帰テストに合格しました。');
console.log(JSON.stringify({
  singlePersistentNavigation: true,
  contentReservationForDetailsPreserved: true,
  standardReadingSpeedDisclosed: '500字／分',
  personalPaceDefaultPreserved: true,
  immediatePaceBaselinePreserved: true,
  tocExcludedFromProgressAndPaceMeasurement: true,
  firstProgressRealtimePaceMeasurementPreserved: true,
  dwellTimeRealtimePaceMeasurementPreserved: true,
  persistentSpeedReadoutPreserved: true,
  smoothingAndOutlierGuardPreserved: true,
  minuteSecondRemainingTimePreserved: true,
  remainingTimeModeSwitchPreserved: true,
  paceResetAndCaveatPreserved: true,
  roundedCircularProgressEndpointsPreserved: true,
  lightDarkMobileReducedMotionContracts: true,
  ariaProgressValueAndTextPreserved: true,
}, null, 2));
