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

const markup = between(
  html,
  '<!-- AI案内（QuikChat 1.2.8 / BSD-2-Clause）: 既製会話UIをローカル同梱して利用 -->',
  '<!-- プロフィール編集モーダル (修正版) -->'
);
const script = between(
  html,
  '//  AI案内（QuikChat 1.2.8）',
  '// --- XSS対策用エスケープ関数 ---'
);
const style = between(
  html,
  'AI案内（QuikChat 1.2.8）',
  '</style>'
);

expect(markup.length > 0, 'AI案内の共通HTMLを検出できません。');
expect(script.length > 0, 'AI案内の初期化・送信スクリプトを検出できません。');
expect(style.length > 0, 'AI案内のテーマ・端末対応スタイルを検出できません。');

[
  'href="assets/vendor/quikchat/quikchat.min.css"',
  'src="assets/vendor/quikchat/quikchat.umd.min.js"',
  'id="ai-guide-launcher" type="button"',
  'aria-expanded="false"',
  'aria-controls="ai-guide-panel"',
  '<aside id="ai-guide-panel"',
  'aria-labelledby="ai-guide-title"',
  'aria-hidden="true"',
  'inert',
  'id="ai-guide-close"',
  'id="ai-guide-notice"',
  '運営者への転送・個別返信はありません。',
  'id="ai-guide-turnstile-wrap"',
  'id="ai-guide-turnstile"',
  'id="ai-guide-chat"',
  'role="log"',
  'aria-live="polite"',
].forEach((text) => expect((text.includes('assets/vendor/quikchat') ? html : markup).includes(text), `AI案内の構造またはARIA属性が不足しています: ${text}`));

expect(!markup.includes('id="ai-help-trigger"'), '撤去対象の独自おたすけ札が残っています。');
expect(!markup.includes('id="ai-help-panel"'), '撤去対象の独自おたすけパネルが残っています。');
expect(!markup.includes('ai-help-tabs'), '撤去対象の独自3タブUIが残っています。');
expect(!/chatbase\.co|chatbase\.com/i.test(markup), '外部Chatbaseウィジェットへの依存が残っています。');

[
  'new window.quikchat(elements.chatHost, sendAiGuideMessage',
  "theme: 'quikchat-theme-minimal'",
  'sanitize: true',
  "const AI_GUIDE_LIMITS = Object.freeze({ question: 800, contextMessages: 12, timeoutMs: 30000 });",
  'const aiGuidePiiPatterns = Object.freeze([',
  'function hasAiGuideSensitiveInput(value)',
  'function requestAiGuideTurnstile()',
  'const priorQuestions = getAiGuideContext(chat).filter((entry) => entry.role === \'user\').length;',
  'if (priorQuestions >= 3 && !aiGuideState.turnstileToken)',
  'body: JSON.stringify({ question, context: getAiGuideContext(chat), cf_turnstile_token: aiGuideState.turnstileToken || undefined })',
  "fetch(`${API_BASE}/api/ai-help`",
  "if (response.status === 403 && data.code === 'turnstile_required')",
  'chat.messageReplaceContent(typingId, data.answer.slice(0, 700));',
  "event.key !== 'Escape' || !isAiGuideOpen()",
  "elements.launcher.setAttribute('aria-expanded', 'true');",
  "elements.launcher.setAttribute('aria-expanded', 'false');",
  "elements.panel.removeAttribute('inert');",
  "elements.panel.setAttribute('inert', '');",
  'focusTarget.focus({ preventScroll: true })',
  'chatInput.placeholder = \'天命乃杜について質問してください\';',
  "chatSendButton.textContent = '送信';",
].forEach((text) => expect(script.includes(text), `AI案内の送信・安全・操作契約が不足しています: ${text}`));

expect(!/\blocalStorage\s*\./.test(script), 'AI案内の会話履歴をlocalStorageへ保存しています。');
expect(!/\bsessionStorage\s*\./.test(script), 'AI案内の会話履歴をsessionStorageへ保存しています。');
expect(!/authFetch\s*\(/.test(script), 'AI案内が認証付きAPIを利用しています。');
expect(!/innerHTML\s*=/.test(script), 'AI案内の制御コードにinnerHTML代入が含まれています。');
expect(!/https?:\/\//.test(script), 'AI案内の制御コードが外部Webを直接参照しています。');
expect(!/mailto:|discord\.gg|zendesk|intercom/i.test(script), 'AI案内が運営者・外部窓口へ転送する導線を含んでいます。');

[
  '#ai-guide-launcher {',
  '#ai-guide-panel {',
  '#ai-guide-panel.is-open {',
  '.ai-guide-turnstile-wrap {',
  '#ai-guide-chat {',
  'html.dark #ai-guide-launcher {',
  'html.dark .ai-guide-frame {',
  'html.dark .ai-guide-turnstile-wrap {',
  '@media (max-width: 720px) {',
  'transform: translateY(calc(100% + 26px));',
  '@media (prefers-reduced-motion: reduce) {',
  '#ai-guide-launcher, #ai-guide-panel',
].forEach((text) => expect(style.includes(text), `AI案内のテーマ・配置・モーション規則が不足しています: ${text}`));

const vendorFiles = [
  path.join(root, 'assets', 'vendor', 'quikchat', 'LICENSE.txt'),
  path.join(root, 'assets', 'vendor', 'quikchat', 'quikchat.min.css'),
  path.join(root, 'assets', 'vendor', 'quikchat', 'quikchat.umd.min.js'),
];
vendorFiles.forEach((file) => expect(fs.existsSync(file), `既製QuikChat資産が同梱されていません: ${path.relative(root, file)}`));

if (failures.length > 0) {
  console.error('AI案内・既製会話UIの回帰テストに失敗しました。');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('AI案内・既製会話UIの回帰テストに合格しました。');
console.log(JSON.stringify({
  vendoredChatUi: true,
  noExternalChatProvider: true,
  aiOnlyNoOperatorHandoff: true,
  noPersistentConversationStorage: true,
  piiClientGuard: true,
  turnstileStepUp: true,
  keyboardAndFocusSupport: true,
  lightAndDarkThemeSupport: true,
}, null, 2));
