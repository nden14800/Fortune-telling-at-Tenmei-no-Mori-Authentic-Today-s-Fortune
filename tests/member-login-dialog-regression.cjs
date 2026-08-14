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
  '<dialog id="guest-name-modal" class="guest-name-dialog" aria-labelledby="guest-name-dialog-title" aria-describedby="guest-name-dialog-description">',
  '参拝者名モーダルがネイティブdialogとして定義されていません。'
);
requireText(
  'function openGuestNameModal(onConfirm, trigger = null)',
  '参拝者名モーダルを開く共通関数がありません。'
);
requireText(
  'modal.showModal();',
  '参拝者名モーダルがモーダルとして開かれません。'
);
requireText(
  "dialog.addEventListener('cancel'",
  '参拝者名モーダルのEscape操作が定義されていません。'
);
requireText(
  'initGuestNameModalDialog();',
  '参拝者名モーダルの初期化が読み込み時に実行されません。'
);
requireText(
  'trigger.focus({ preventScroll: true })',
  '参拝者名モーダルを閉じた後に操作起点へフォーカスが戻りません。'
);
requireText(
  '#lab-lock.lab-lock-container,\n#dream-login-overlay.login-lock-container',
  'LabsとAI夢占いのロックカードに共通の垂直配置基準がありません。'
);
requireText(
  'padding: clamp(8rem, 10vw, 11rem) 0 2.5rem;',
  'LabsとAI夢占いのロックカードに固定の視覚的オフセットがありません。'
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
  guestNameNativeDialog: true,
  sharedGateVerticalOffset: true,
  reducedMotion: true,
  legacyZodiacModalRemoved: true,
}, null, 2));
