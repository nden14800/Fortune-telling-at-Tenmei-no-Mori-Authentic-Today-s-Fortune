const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.resolve(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function between(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  if (start === -1 || end === -1) return '';
  return source.slice(start, end);
}

const helpMarkup = between(
  html,
  '<!-- AIおたすけ窓口（第I段階：AI APIには接続しない自己解決ヘルプ） -->',
  '<!-- プロフィール編集モーダル (修正版) -->'
);
const helpScript = between(
  html,
  '//  AIおたすけ窓口 第I段階',
  '// --- XSS対策用エスケープ関数 ---'
);
const helpStyle = between(
  html,
  'AIおたすけ窓口（第I段階：自己解決ヘルプ基盤）',
  '</style>'
);

expect(helpMarkup.length > 0, 'AIおたすけ窓口の共通HTMLを検出できません。');
expect(helpScript.length > 0, 'AIおたすけ窓口の第I段階スクリプトを検出できません。');
expect(helpStyle.length > 0, 'AIおたすけ窓口の第I段階スタイルを検出できません。');

[
  'id="ai-help-trigger" type="button" aria-expanded="false" aria-controls="ai-help-panel" aria-label="おたすけ窓口を開く"',
  '<aside id="ai-help-panel" aria-labelledby="ai-help-title" aria-hidden="true" inert>',
  'id="ai-help-close" type="button" class="ai-help-icon-button" aria-label="おたすけ窓口を閉じる"',
  'class="ai-help-tabs" role="tablist" aria-label="おたすけ窓口の表示を切り替える"',
  'role="tab" aria-selected="true" aria-controls="ai-help-guide"',
  'role="tab" aria-selected="false" aria-controls="ai-help-message"',
  'role="tabpanel" tabindex="0" aria-labelledby="ai-help-tab-guide"',
  'id="ai-help-search" type="search" autocomplete="off"',
  'id="ai-help-search-status" class="ai-help-search-status" role="status" aria-live="polite"',
  'id="ai-help-faq-list" class="ai-help-faq-list"',
  'data-ai-help-category="安全・データ"',
].forEach((text) => expect(helpMarkup.includes(text), `おたすけ窓口の構造またはARIA属性が不足しています: ${text}`));

[
  'const helpArticles = Object.freeze([',
  "category: 'はじめる'",
  "category: 'アカウント'",
  "category: '機能別'",
  "category: '読む・探す'",
  "category: '困ったとき'",
  "category: '安全・データ'",
  'const aiHelpFaqs = Object.freeze([',
  'function renderAiHelpArticles()',
  'function renderAiHelpFaqs()',
  'function setAiHelpDeskTab(tabName, moveFocus = false)',
  'function openAiHelpDesk(tabName = \'guide\', focusPanel = true)',
  'function closeAiHelpDesk(restoreFocus = true)',
  'function handleAiHelpTabKeyboard(event)',
  "if (event.key !== 'Escape' || !isAiHelpDeskOpen()) return;",
  "event.stopImmediatePropagation();",
  "elements.trigger.setAttribute('aria-expanded', 'true');",
  "elements.trigger.setAttribute('aria-expanded', 'false');",
  "elements.panel.removeAttribute('inert');",
  "elements.panel.setAttribute('inert', '');",
  "target?.focus({ preventScroll: true });",
  "focusTarget?.focus({ preventScroll: true })",
  "button.setAttribute('aria-expanded', String(!expanded));",
  'answer.hidden = expanded;',
].forEach((text) => expect(helpScript.includes(text), `おたすけ窓口の検索・FAQ・キーボード操作が不足しています: ${text}`));

expect(helpScript.includes('element.textContent = text;'), '動的ヘルプ本文をtextContentで描画していません。');
expect(helpScript.includes('elements.articleList.replaceChildren();'), '動的ヘルプ記事の描画で既存DOMを安全に置換していません。');
expect(!/\.innerHTML\s*=/.test(helpScript), 'おたすけ窓口の動的描画にinnerHTML代入が含まれています。');
expect(!/\bfetch\s*\(/.test(helpScript), '第I段階でAIまたは外部APIを呼び出しています。');
expect(!/\bauthFetch\s*\(/.test(helpScript), '第I段階で認証付きAPIを呼び出しています。');
expect(!/\/api\/ai-help/.test(helpScript), '第I段階にAI Help APIの呼び出しまたは参照が含まれています。');
expect(!/\blocalStorage\s*\./.test(helpScript), '第I段階で会話履歴などをlocalStorageへ保存しています。');
expect(!/準備中/.test(helpMarkup), 'メッセージタブに「準備中」という表記が残っています。');

[
  '#ai-help-trigger {',
  '#ai-help-panel {',
  '#ai-help-panel.is-open {',
  'z-index: 950;',
  'body.ai-help-open #back-to-top-btn',
  'body.reading-progress-active #ai-help-panel',
  'html.dark #ai-help-trigger {',
  'html.dark .ai-help-panel-frame {',
  '@media (max-width: 720px) {',
  'transform: translateY(calc(100% + 26px));',
  '@media (prefers-reduced-motion: reduce) {',
  '#ai-help-trigger, #ai-help-panel, #ai-help-panel *',
].forEach((text) => expect(helpStyle.includes(text), `おたすけ窓口のテーマ・配置・モーション規則が不足しています: ${text}`));

if (failures.length > 0) {
  console.error('AIおたすけ窓口・第I段階の回帰テストに失敗しました。');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('AIおたすけ窓口・第I段階の回帰テストに合格しました。');
console.log(JSON.stringify({
  globalTriggerAndPanel: true,
  guideMessageHelpTabs: true,
  clientSideHelpSearch: true,
  disclosureFaq: true,
  keyboardAndFocusSupport: true,
  lightAndDarkThemeSupport: true,
  noAiApiCallsInPhaseOne: true,
  safeDynamicRendering: true,
}, null, 2));
