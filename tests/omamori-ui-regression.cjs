#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const sourcePath = path.join(__dirname, '..', 'index.html');
const source = fs.readFileSync(sourcePath, 'utf8');
const start = source.indexOf('<section id="view-omamori"');
const end = source.indexOf('<!-- ビュー: 参拝の記録', start);
assert(start >= 0 && end > start, 'デジタル御守授与所のビュー範囲を特定できません。');
const omamoriView = source.slice(start, end);

[
  'class="view-section omamori-sanctuary-layout"',
  'class="omamori-sanctuary-hero"',
  'class="omamori-sanctuary-mark" data-ver4-hero-emblem',
  'class="omamori-selection-panel"',
  'class="omamori-prayer-panel hidden"',
  'class="omamori-bestowal-panel hidden"',
  'id="omamori-step-1"',
  'id="omamori-step-2"',
  'id="omamori-step-3"',
  'id="omamori-capture-area"',
  'id="omamori-display"',
  'id="omamori-message-panel"',
  'class="omamori-save-action"',
  'class="omamori-reset-action"',
].forEach((needle) => {
  assert(omamoriView.includes(needle), `御守授与所のVer.4.0構造または既存識別子が不足しています: ${needle}`);
});

[
  ['safety', '交通安全'],
  ['health', '健康長寿'],
  ['love', '良縁成就'],
  ['money', '金運上昇'],
  ['study', '学業成就'],
  ['victory', '必勝祈願'],
  ['protect', '厄除け'],
  ['success', '大願成就'],
].forEach(([type, label]) => {
  assert(omamoriView.includes(`OmamoriSystem.startPrayer('${type}')`), `願意 ${label} の祈祷導線が維持されていません。`);
  assert(omamoriView.includes(`>${label}</span>`), `願意 ${label} の表示が維持されていません。`);
});

assert.strictEqual((omamoriView.match(/class="wish-card /g) || []).length, 8, '御守の願意カードは8枚である必要があります。');
assert.strictEqual((omamoriView.match(/type="button" class="wish-card /g) || []).length, 8, '願意カードはすべてキーボード操作可能なbutton要素である必要があります。');
assert(omamoriView.includes('role="list" aria-label="御守の願い事を選ぶ"'), '願意一覧のアクセシブルなリスト定義が不足しています。');
assert(omamoriView.includes('aria-live="polite"'), '祈祷・授与状態の通知にaria-liveが必要です。');

[
  '#view-omamori.omamori-sanctuary-layout',
  '.omamori-sanctuary-hero::before',
  '.omamori-sanctuary-mark[data-ver4-hero-emblem]',
  '#view-omamori .omamori-grid-container',
  '#view-omamori .wish-card',
  'border-radius: 24px !important',
  'width: 46px',
  'height: 46px',
  'border-radius: 50%',
  'min-height: 48px',
  'border-radius: 14px !important',
  'html.dark #view-omamori.omamori-sanctuary-layout',
  '.omamori-sanctuary-hero { grid-template-columns: 1fr; padding: 24px 20px !important; }',
  '#view-omamori .omamori-grid-container { grid-template-columns: 1fr; }',
  '@media (prefers-reduced-motion: reduce) { .omamori-prayer-seal .prayer-light { animation: none !important; } }',
].forEach((needle) => {
  assert(source.includes(needle), `御守授与所のVer.4.0意匠・テーマ・レスポンシブ規則が不足しています: ${needle}`);
});

[
  'const OmamoriSystem = {',
  'startPrayer: function(typeKey)',
  'renderOmamori: function(typeKey)',
  'saveImage: function()',
  '_doSaveImage: function(target, btn, originalText)',
  'ensureHtmlToImageLoaded()',
  'htmlToImage.toPng(target, {',
  'pixelRatio: 4',
  'escapeHtml(userName)',
  'OmamoriSystem.saveImage()',
  'OmamoriSystem.reset()',
].forEach((needle) => {
  assert(source.includes(needle), `御守生成・保存の既存契約が不足しています: ${needle}`);
});

console.log('デジタル御守授与所Ver.4.0回帰テストに合格しました。');
console.log(JSON.stringify({
  sanctuaryTemplate: true,
  sharedHeroEmblem: true,
  eightWishButtons: true,
  normalCardHierarchy: true,
  prayerBestowalSaveContractsPreserved: true,
  darkThemeRulesPresent: true,
  responsiveAndReducedMotionRulesPresent: true,
}, null, 2));
