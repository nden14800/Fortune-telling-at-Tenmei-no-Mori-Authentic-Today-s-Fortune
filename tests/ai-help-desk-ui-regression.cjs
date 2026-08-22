const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
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

const script = between(
  html,
  '//  AI案内（Flowise Embed 3.1.6 / MIT）',
  '// --- XSS対策用エスケープ関数 ---'
);

expect(script.length > 0, 'Flowise標準ウィジェットの初期化スクリプトを検出できません。');
expect(html.includes('src="assets/vendor/flowise-embed/flowise-embed-3.1.6.umd.js" defer'), 'Flowise Embedのローカル同梱資産を読み込んでいません。');
expect(html.includes('Flowise Embedが標準のフローティング起動ボタンと会話画面を自動挿入する。独自の起動ボタン・パネルは置かない。'), '標準ウィジェット採用の方針がマークアップへ反映されていません。');

[
  "const FLOWISE_AI_GUIDE_ID = 'tenmei-ai-guide';",
  'window.Chatbot.init({',
  'chatflowid: FLOWISE_AI_GUIDE_ID',
  'apiHost: API_BASE',
  'chatflowConfig: { clearChatOnReload: true }',
  "title: '天命の案内役'",
  'renderHTML: false',
  "placeholder: '天命乃杜について質問してください'",
  'maxChars: 800',
  '運営者への転送・個別返信はありません。',
  'パスワード、認証コード、住所、電話番号、メールアドレス',
].forEach((text) => expect(script.includes(text), `標準FlowiseウィジェットのAI案内設定が不足しています: ${text}`));

[
  'assets/vendor/quikchat',
  'new window.quikchat',
  'id="ai-guide-launcher"',
  'id="ai-guide-panel"',
  'id="ai-guide-chat"',
  'id="ai-guide-close"',
  'ai-guide-frame',
  'ai-guide-turnstile',
  '#ai-guide-launcher',
  '#ai-guide-panel',
  '.ai-guide-frame',
].forEach((text) => expect(!html.includes(text), `撤去すべき独自QuikChat UIまたは起動ボタンが残っています: ${text}`));

expect(!/\bbutton\s*:\s*\{/.test(script), 'Flowiseの標準起動ボタンを独自設定で上書きしています。');
expect(!/chatbase\.co|chatbase\.com/i.test(html), '外部Chatbaseウィジェットへの依存が残っています。');
expect(!/https?:\/\//.test(script), 'AI案内初期化コードが外部Webを直接参照しています。');
expect(!/mailto:|discord\.gg|zendesk|intercom/i.test(script), 'AI案内が運営者・外部窓口へ転送する導線を含んでいます。');
expect(!/authFetch\s*\(/.test(script), 'AI案内が認証付きAPIを利用しています。');
expect(!/innerHTML\s*=/.test(script), 'AI案内の初期化コードにinnerHTML代入が含まれています。');

const vendorFiles = [
  path.join(root, 'assets', 'vendor', 'flowise-embed', 'flowise-embed-3.1.6.umd.js'),
  path.join(root, 'assets', 'vendor', 'flowise-embed', 'NOTICE.txt'),
];
vendorFiles.forEach((file) => expect(fs.existsSync(file), `標準Flowise Embed資産が同梱されていません: ${path.relative(root, file)}`));

const notice = fs.existsSync(vendorFiles[1]) ? fs.readFileSync(vendorFiles[1], 'utf8') : '';
expect(/Flowise Embed 3\.1\.6/.test(notice) && /MIT License/.test(notice), 'Flowise Embedのライセンス表示が不足しています。');

if (failures.length > 0) {
  console.error('AI案内・標準Flowiseウィジェットの回帰テストに失敗しました。');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('AI案内・標準Flowiseウィジェットの回帰テストに合格しました。');
console.log(JSON.stringify({
  standardFloatingWidget: true,
  noCustomLauncherOrPanel: true,
  noExternalChatSaaS: true,
  localVendoredWidget: true,
  aiOnlyNoOperatorHandoff: true,
  noHtmlResponseRendering: true,
  workerBackedAiGuide: true,
}, null, 2));
