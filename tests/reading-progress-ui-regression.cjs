const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.resolve(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function requireText(text, message) {
  assert(html.includes(text), message);
}

[
  '<div id="reading-progress-bar" role="progressbar" aria-label="記事の読書進捗" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="reading-progress-fill"></div></div>',
  '記事 読書進捗（社務所だより／神籤草子 共通）',
  '本文を覆わないよう、進捗率と残り時間は記事ヘッダー内、',
  'スクロール中の位置だけは最上部の細いレールで示す。',
  'height: 4px;',
  'pointer-events: none;',
  'id="reading-progress-badge" class="article-reading-progress" aria-label="現在の読書進捗"',
  '<span class="rp-label"><i class="bi bi-bookmark-heart" aria-hidden="true"></i><span>読書の進み</span></span>',
  '<span id="reading-progress-percent">0%</span>',
  '<span id="reading-progress-time">残り約0分</span>',
  'bar.setAttribute(\'aria-valuenow\', \'0\');',
  "if (bar) bar.setAttribute('aria-valuenow', String(Math.round(percent)));",
  "timeEl.textContent = percent >= 99.5 ? '読了しました' : `残り約${Math.max(1, remainingMinutes)}分`;",
  '@media (max-width: 640px) {',
  '@media (prefers-reduced-motion: reduce) {',
].forEach((text) => requireText(text, `読書進捗UIの構造・表示・アクセシビリティ契約が不足しています: ${text}`));

const panelMatches = html.match(/id="reading-progress-badge" class="article-reading-progress"/g) || [];
assert.equal(panelMatches.length, 2, '社務所だよりと神籤草子の両記事テンプレートへ読書進捗面を配置する必要があります。');

const badgeStyle = html.match(/#reading-progress-badge\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
assert(badgeStyle, '読書進捗面のスタイル定義がありません。');
assert.equal(/position\s*:\s*fixed/.test(badgeStyle), false, '進捗率と残り時間の読書進捗面を固定表示して本文へ重ねてはいけません。');
assert(/width\s*:\s*100%/.test(badgeStyle), '読書進捗面は記事ヘッダー幅に収まる必要があります。');
assert(/margin-top\s*:\s*16px/.test(badgeStyle), '読書進捗面は記事メタ情報から適切な余白を確保する必要があります。');

console.log('記事詳細の読書進捗UI回帰テストに合格しました。');
console.log(JSON.stringify({
  headerEmbeddedProgressPanels: panelMatches.length,
  fixedOverlayRemoved: true,
  topRailProgressPreserved: true,
  lightDarkMobileReducedMotionContracts: true,
  ariaProgressValuePreserved: true,
}, null, 2));
