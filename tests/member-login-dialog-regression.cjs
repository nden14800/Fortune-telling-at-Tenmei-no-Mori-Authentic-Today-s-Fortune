const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.resolve(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function requireText(text, message) {
  assert(html.includes(text), message);
}

function forbidText(text, message) {
  assert(!html.includes(text), message);
}

requireText(
  '<dialog id="member-login-dialog" class="member-login-dialog" aria-labelledby="member-login-dialog-title" aria-describedby="member-login-dialog-description">',
  '共通ログイン要求モーダルがネイティブdialogとして定義されていません。'
);
requireText(
  'autofocus',
  '共通ログイン要求モーダルの初期フォーカス先が定義されていません。'
);
requireText(
  'dialog.showModal();',
  '共通ログイン要求モーダルがモーダルとして開かれません。'
);
requireText(
  "dialog.addEventListener('close'",
  '共通ログイン要求モーダルを閉じた後のフォーカス復帰処理がありません。'
);
requireText(
  'trigger.focus({ preventScroll: true });',
  '共通ログイン要求モーダルを閉じた後に操作起点へフォーカスが戻りません。'
);
requireText(
  'function openMemberLoginDialog(source = \'default\', trigger = null)',
  '共通ログイン要求モーダルを開く関数がありません。'
);
requireText(
  "openMemberLoginDialog('zodiac', trigger);",
  '星座のお気に入り登録が共通ログイン要求モーダルに接続されていません。'
);
requireText(
  "openMemberLoginDialog('labs', el || document.activeElement);",
  'TENMEI Labsの未ログイン操作が共通ログイン要求モーダルに接続されていません。'
);
requireText(
  "openMemberLoginDialog('dream', btn || document.activeElement);",
  'AI夢占いの未ログイン操作が共通ログイン要求モーダルに接続されていません。'
);
requireText(
  "onclick=\"openMemberLoginDialog('dream', this)\"",
  'AI夢占いのロックカードが共通ログイン要求モーダルに接続されていません。'
);
requireText(
  '<div class="member-login-gate-card login-lock-card">',
  'AI夢占いのロックカードに共通会員限定カードの意匠が適用されていません。'
);
requireText(
  "onclick=\"openMemberLoginDialog('labs', this)\"",
  'TENMEI Labsのロックカードが共通ログイン要求モーダルに接続されていません。'
);
requireText(
  "aria-label=\"${data.sign.name} ${data.blood}型をお気に入り${isFav ? 'から外す' : 'に登録する'}\"",
  '星座のお気に入りボタンのアクセシブルな名前がありません。'
);
requireText(
  '.member-login-dialog::backdrop',
  '共通ログイン要求モーダルの背景遮蔽スタイルがありません。'
);
requireText(
  'html.reduce-motion .member-login-dialog[open] .member-login-dialog-surface',
  '共通ログイン要求モーダルの低モーション対応がありません。'
);
forbidText(
  'zodiac-login-modal',
  '廃止済みの星座専用ログインモーダルへの参照が残っています。'
);
forbidText(
  'closeZodiacModal',
  '廃止済みの星座専用ログインモーダルを閉じる関数が残っています。'
);
forbidText(
  '会員限定の機能です。ログインして入室してください。',
  'TENMEI Labsの未ログイン時導線が、次の行動を示さない旧トーストのままです。'
);

console.log('共通ログイン要求モーダルの回帰テストに合格しました。');
console.log(JSON.stringify({
  nativeDialog: true,
  focusReturn: true,
  sources: ['zodiac', 'labs', 'dream'],
  reducedMotion: true,
  legacyZodiacModalRemoved: true,
}, null, 2));
