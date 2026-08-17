const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.resolve(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const maintenanceScript = html.match(
  /const maintenanceConfig = \{[\s\S]*?checkMaintenance\(\);/
)?.[0] || '';
const secretScript = html.match(
  /\/\/ 隠しコマンド（イースターエッグ）集[\s\S]*?\}\)\(\);\n<\/script>/
)?.[0] || '';

assert(maintenanceScript, 'メンテナンスの設定・表示制御スクリプトを抽出できません。');
assert(secretScript, '隠しコマンドの制御スクリプトを抽出できません。');

[
  'class="maintenance-screen" aria-labelledby="maintenance-title"',
  'class="maintenance-panel" aria-describedby="maintenance-lead"',
  'class="maintenance-status" role="status" aria-live="polite"',
  'class="maintenance-eyebrow">${maintenanceEyebrow}</p>',
  'id="maintenance-title" class="maintenance-title">${maintenanceTitle}</h1>',
  'id="maintenance-lead" class="maintenance-lead">${maintenanceLead}</p>',
  'class="maintenance-details"',
  '実施時間',
  '影響範囲',
  'class="maintenance-reload" data-maintenance-primary onclick="location.reload()"',
  'class="maintenance-community" href="https://discord.gg/Ys6hpbNdcV"',
  'テスト表示です。再読み込みすると、直前の画面へ戻ります。',
].forEach((text) => {
  assert(maintenanceScript.includes(text), `メンテナンス画面の情報・操作構造が不足しています: ${text}`);
});

[
  '.maintenance-screen {',
  '.maintenance-panel {',
  'border-radius: 28px;',
  '.maintenance-status {',
  '.maintenance-details {',
  'html.dark .maintenance-screen {',
  '@media (max-width: 560px) { .maintenance-screen {',
  '@media (prefers-reduced-motion: reduce) { .maintenance-reload, .maintenance-community {',
  '.maintenance-reload:focus-visible, .maintenance-community:focus-visible {',
].forEach((text) => {
  assert(html.includes(text), `メンテナンス画面のVer.4.0テーマ・レスポンシブ・フォーカス規則が不足しています: ${text}`);
});

[
  'async function checkMaintenance(force = false) {',
  'const statusResponse = await fetch(`${API_BASE}/api/system/maintenance`, {',
  "cache: 'no-store',",
  "credentials: 'omit'",
  'if (!serverMaintenance || serverMaintenance.active !== true) return;',
  'if (force || (serverMaintenance && serverMaintenance.active === true)) {',
  "const maintenanceState = force ? '表示確認モード' : '整備中';",
  "const maintenanceEyebrow = force ? 'MAINTENANCE PREVIEW' : 'MAINTENANCE NOTICE';",
  'const maintenanceTitle = force',
  'serverMaintenance.scheduleLabel',
  "window.requestAnimationFrame(() => document.querySelector('[data-maintenance-primary]')?.focus());",
  'if(!force) {',
  'throw new Error("Maintenance Mode Active");',
].forEach((text) => {
  assert(maintenanceScript.includes(text), `Worker連携済みメンテナンス制御またはアクセシビリティ契約が不足しています: ${text}`);
});

[
  "font-family: 'Shippori Mincho', 'Zen Old Mincho', serif;",
  "font-family: 'Zen Old Mincho', 'Shippori Mincho', serif;",
  "font-family: 'Zen Kaku Gothic New', sans-serif;",
].forEach((text) => {
  assert(html.includes(text), `メンテナンス画面がサイト共通のフォントを使用していません: ${text}`);
});
const maintenanceStyleStart = html.indexOf('.maintenance-screen {');
const maintenanceStyleEnd = html.indexOf('</style>', maintenanceStyleStart);
const maintenanceStyleBlock = maintenanceStyleStart >= 0 && maintenanceStyleEnd > maintenanceStyleStart
  ? html.slice(maintenanceStyleStart, maintenanceStyleEnd)
  : '';
assert(maintenanceStyleBlock, 'メンテナンス画面のスタイルブロックを抽出できません。');
const maintenanceFontRules = (maintenanceStyleBlock.match(/(?:html\.dark\s+)?\.maintenance[^}]*\}/g) || []).join('\n');
assert(maintenanceFontRules, 'メンテナンス画面のフォント規則を抽出できません。');
assert(!maintenanceFontRules.includes("'Noto Serif JP'"), 'メンテナンス画面に旧Noto Serif JP指定が残っています。');
assert(!maintenanceFontRules.includes("'Noto Sans JP'"), 'メンテナンス画面に旧Noto Sans JP指定が残っています。');

[
  "onclick=\"if(LabAuth.isVerified()) { checkMaintenance(true); } else { showToast('会員限定機能です', 'warning'); }\"",
  "var MAINTENANCE_TEST_WORD = 'maintenance';",
  "// ---------- ③-2 合言葉「maintenance」でメンテナンス画面のテスト表示 ----------",
  'function handleMaintenanceTestWord(e)',
  "if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;",
  "if (maintenanceBuffer === MAINTENANCE_TEST_WORD) {",
  "if (typeof checkMaintenance === 'function') checkMaintenance(true);",
  "} else if (w.toLowerCase() === MAINTENANCE_TEST_WORD) {",
].forEach((text) => {
  assert(html.includes(text), `Labsまたは隠しコマンドによるメンテナンス訓練の契約が不足しています: ${text}`);
});

console.log('サーバーメンテナンス画面とテスト用隠しコマンドの回帰テストに合格しました。');
console.log(JSON.stringify({
  ver4MaintenanceInformationHierarchy: true,
  workerBackedMaintenanceControl: true,
  siteFontSystemApplied: true,
  labsMemberOnlyTrainingPreserved: true,
  hiddenCommandPreviewAvailable: true,
  lightDarkResponsiveAccessible: true,
}, null, 2));
