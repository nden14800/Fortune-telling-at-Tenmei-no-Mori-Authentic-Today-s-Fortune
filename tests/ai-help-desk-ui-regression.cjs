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

const guideMarkup = between(
  html,
  '<!-- ================================================================\n         案内センター',
  '<!-- プロフィール編集モーダル'
);
const script = between(
  html,
  '//  天命乃杜 案内センター',
  '// --- XSS対策用エスケープ関数 ---'
);

expect(guideMarkup.length > 0, '案内センターのマークアップを検出できません。');
expect(script.length > 0, '案内センターの初期化スクリプトを検出できません。');
expect(html.includes('assets/vendor/pagefind/pagefind-component-ui.css'), 'PagefindのローカルCSSを読み込んでいません。');
expect(html.includes('assets/vendor/pagefind/pagefind-component-ui.js'), 'PagefindのローカルWeb Componentを読み込んでいません。');

[
  'id="guide-center-trigger"',
  'id="guide-center"',
  'id="guide-screen-home"',
  'id="guide-screen-help"',
  'id="guide-screen-ai"',
  '<pagefind-searchbox',
  '<pagefind-results',
  'bundle-path="/assets/vendor/pagefind/"',
  'data-guide-view="howto"',
  'data-guide-view="auth"',
  'data-guide-view="omamori"',
  'id="guide-ai-form"',
  'id="guide-ai-input"',
  'id="guide-ai-reset"',
  '個人情報、パスワード、認証コード、住所、電話番号、メールアドレス',
  '運営者への転送・個別返信はありません。',
].forEach((text) => expect(guideMarkup.includes(text), `案内センターの必須UIまたは注意文が不足しています: ${text}`));

[
  '@media (max-width: 640px)',
  '@media (prefers-reduced-motion: reduce)',
  '.guide-center { width: 100vw; border-left: 0; }',
].forEach((text) => expect(html.includes(text), `案内センターのレスポンシブまたは軽減モーション規則が不足しています: ${text}`));

[
  "const AI_GUIDE_ENDPOINT = '/api/v1/prediction/tenmei-ai-guide';",
  'fetch(API_BASE + AI_GUIDE_ENDPOINT',
  'history: guideCenterState.messages.slice(-12)',
  'question.length > 800',
  'guideCenterContainsSensitiveText(question)',
  'guideCenterState.messages = []',
  'window.openArticle(match[1], Number(match[2]))',
  "url.searchParams.get('guide_article')",
  'document.createElement(\'p\')',
  'content.textContent = String(text || \'\')',
].forEach((text) => expect(script.includes(text), `案内センターの安全なAI案内または記事遷移実装が不足しています: ${text}`));

[
  'window.Chatbot',
  'initFlowiseAiGuide',
  'FLOWISE_AI_GUIDE_ID',
  'flowise-embed',
  'assets/vendor/quikchat',
  'new window.quikchat',
  'chatbase.co',
  'chatbase.com',
  'intercom',
  'mailto:',
  'discord.gg',
  'zendesk',
  'authFetch(',
  'innerHTML =',
  'localStorage',
  'sessionStorage',
].forEach((text) => expect(!script.includes(text), `案内センターのAIスクリプトに禁止された依存または永続保存が残っています: ${text}`));

const vendorFiles = [
  'pagefind.js',
  'pagefind-ui.js',
  'pagefind-component-ui.js',
  'pagefind-component-ui.css',
  'wasm.unknown.pagefind',
  'pagefind-entry.json',
  'NOTICE.txt',
].map((file) => path.join(root, 'assets', 'vendor', 'pagefind', file));
vendorFiles.forEach((file) => expect(fs.existsSync(file), `Pagefindのローカル同梱資産が不足しています: ${path.relative(root, file)}`));

const noticePath = path.join(root, 'assets', 'vendor', 'pagefind', 'NOTICE.txt');
const notice = fs.existsSync(noticePath) ? fs.readFileSync(noticePath, 'utf8') : '';
expect(/Pagefind 1\.5\.0/.test(notice) && /MIT License/.test(notice), 'PagefindのバージョンまたはMITライセンス表示が不足しています。');

const buildScriptPath = path.join(root, 'scripts', 'build-guide-search-index.cjs');
const buildScript = fs.existsSync(buildScriptPath) ? fs.readFileSync(buildScriptPath, 'utf8') : '';
[
  'pagefind@1.5.0',
  'assets',
  'vendor',
  'pagefind',
  'newsData',
  'columnData',
  'guide_article',
  'data-pagefind-meta="guide_url:${guideUrl}"',
  'data-pagefind-meta="type:${label}"',
  'data-pagefind-meta="category:${category}"',
  'data-pagefind-meta="date:${item.date}"',
].forEach((text) => expect(buildScript.includes(text), `静的検索索引の再生成スクリプトが不足しています: ${text}`));

expect(!html.includes('flowise-embed-3.1.6.umd.js'), '置換済みのFlowise Embed資産をHTMLがまだ読み込んでいます。');
expect(!html.includes('id="ai-guide-launcher"'), '旧AI案内の起動ボタンが残っています。');
expect(!html.includes('id="ai-guide-panel"'), '旧AI案内パネルが残っています。');

if (failures.length > 0) {
  console.error('AI案内センターの回帰テストに失敗しました。');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('AI案内センターの回帰テストに合格しました。');
console.log(JSON.stringify({
  guideCenter: true,
  homeHelpAiTabs: true,
  pagefindLocalStaticSearch: true,
  noExternalChatSaaS: true,
  noConversationPersistence: true,
  aiOnlyNoOperatorHandoff: true,
  safeWorkerBackedAiGuide: true,
}, null, 2));
