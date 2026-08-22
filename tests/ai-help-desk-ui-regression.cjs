const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const headersPath = path.join(root, '_headers');
const headers = fs.existsSync(headersPath) ? fs.readFileSync(headersPath, 'utf8') : '';
const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function between(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start === -1 || end === -1) return '';
  return source.slice(start, end);
}

const intercomScript = between(
  html,
  '//  Intercom Messenger / Fin AI Agent',
  '// --- XSS対策用エスケープ関数 ---'
);

expect(intercomScript.length > 0, 'Intercom Messenger / Fin AI Agentの初期化スクリプトを検出できません。');

[
  "const INTERCOM_APP_ID = window.TENMEI_INTERCOM_APP_ID || 'TENMEI_INTERCOM_APP_ID';",
  'window.intercomSettings = getIntercomMemberSettings();',
  "s.id = 'intercom-messenger-loader';",
  "s.src = 'https://widget.intercom.io/widget/' + INTERCOM_APP_ID;",
  "window.Intercom = i;",
  "document.addEventListener('DOMContentLoaded', bootIntercomMessenger, { once: true });",
  'intercom_user_jwt',
].forEach((text) => expect(intercomScript.includes(text), `Intercom Messengerの標準起動実装が不足しています: ${text}`));

[
  'https://widget.intercom.io',
  'https://js.intercomcdn.com',
  'https://api-iam.intercom.io',
  'wss://nexus-websocket-a.intercom.io',
].forEach((text) => expect(headers.includes(text), `Intercom Messengerに必要なCSP許可が不足しています: ${text}`));

expect(!headers.includes("'wasm-unsafe-eval'"), 'Pagefind撤去後もCSPにwasm-unsafe-evalが残っています。');
expect(!headers.includes("'unsafe-eval'"), 'CSPが不要に一般的なunsafe-evalを許可しています。');

[
  'id="guide-center-trigger"',
  'id="guide-center"',
  'id="guide-screen-home"',
  'id="guide-screen-help"',
  'id="guide-screen-ai"',
  '<pagefind-config',
  '<pagefind-searchbox',
  '<pagefind-results',
  'bundle-path="/assets/vendor/pagefind/"',
  'assets/vendor/pagefind/pagefind-component-ui.css',
  'assets/vendor/pagefind/pagefind-component-ui.js',
  "const AI_GUIDE_ENDPOINT = '/api/v1/prediction/tenmei-ai-guide';",
  'fetch(API_BASE + AI_GUIDE_ENDPOINT',
  'guideCenterState',
  'guideCenterContainsSensitiveText',
  'new window.quikchat',
  'chatbase.co',
  'chatbase.com',
  'flowise-embed',
  'FLOWISE_AI_GUIDE_ID',
].forEach((text) => expect(!html.includes(text), `旧案内センターまたは置換前の検索・AI依存が残っています: ${text}`));

const buildScriptPath = path.join(root, 'scripts', 'build-guide-search-index.cjs');
expect(!fs.existsSync(buildScriptPath), '社務所だより・神籤草子をヘルプ検索へ混ぜるPagefind索引生成スクリプトが残っています。');

const vendorPath = path.join(root, 'assets', 'vendor', 'pagefind');
expect(!fs.existsSync(vendorPath), '案内センター用Pagefind同梱資産が残っています。');

const helpDraftPath = path.join(root, 'docs', 'intercom-fin-help-articles.md');
const helpDraft = fs.existsSync(helpDraftPath) ? fs.readFileSync(helpDraftPath, 'utf8') : '';
[
  'Intercom Fin AI Agent向けヘルプ記事ドラフト',
  '社務所だよりは更新告知のため、通常のサポート回答ソースには含めない。',
  '神籤草子は読み物コラムのため、通常のサポート回答ソースには含めない。',
  '天命乃杜ヘルプ',
].forEach((text) => expect(helpDraft.includes(text), `Fin用ヘルプ記事運用ドキュメントが不足しています: ${text}`));

if (failures.length > 0) {
  console.error('Intercom Fin AI Agent型サポートメッセンジャーの回帰テストに失敗しました。');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Intercom Fin AI Agent型サポートメッセンジャーの回帰テストに合格しました。');
console.log(JSON.stringify({
  intercomMessenger: true,
  finAiAgentReady: true,
  defaultLauncher: true,
  customGuideCenterRemoved: true,
  pagefindGuideSearchRemoved: true,
  helpArticlesSeparatedFromNewsAndColumns: true,
}, null, 2));
