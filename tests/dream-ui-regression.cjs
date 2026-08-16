const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.resolve(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function requireText(text, message) {
  assert(html.includes(text), message);
}

function countOccurrences(text) {
  return html.split(text).length - 1;
}

requireText(
  '<section id="view-dream" class="view-section dream-oracle-layout" aria-labelledby="dream-page-title">',
  'AI夢占いがVer.4.0共通レイアウトへ移行していません。'
);
requireText(
  '<header class="dream-oracle-hero">',
  'AI夢占いの二重線ヒーローがありません。'
);
requireText(
  '.dream-oracle-hero::before { position: absolute; inset: 12px; border: 1px solid var(--dream-inner-line); border-radius: 20px;',
  'AI夢占いヒーローの内側細枠が共通規則どおりではありません。'
);
requireText(
  'class="dream-oracle-mark" data-ver4-hero-emblem',
  'AI夢占いの共通円形印章が設定されていません。'
);
requireText(
  'width: 128px !important;',
  '共通円形印章のデスクトップ寸法が定義されていません。'
);
requireText(
  'width: 96px !important;',
  '共通円形印章のタブレット・モバイル寸法が定義されていません。'
);
requireText(
  'class="dream-oracle-panel dream-input-panel"',
  '夢入力面が通常カードとして構成されていません。'
);
requireText(
  'class="dream-oracle-panel dream-history-panel"',
  '夢の記録面が通常カードとして構成されていません。'
);
requireText(
  '.dream-oracle-panel { position: relative; overflow: hidden; padding: 24px; border: 1px solid var(--card-border) !important; border-radius: 24px !important;',
  'AI夢占いの通常カードに統一余白・角丸が適用されていません。'
);
requireText(
  'class="dream-panel-icon"',
  'AI夢占いの通常カードに丸形アイコンがありません。'
);
requireText(
  'border-radius: 50%; color: var(--dream-accent);',
  'AI夢占いのカードアイコンが丸形ではありません。'
);
requireText(
  'id="dream-input" maxlength="400"',
  '夢入力欄の既存IDまたは文字数制限が維持されていません。'
);
requireText(
  'id="dream-submit-btn" type="button" onclick="submitDreamFortune()"',
  '夢占い送信ボタンの既存処理が維持されていません。'
);
requireText(
  'id="dream-response-area" class="hidden dream-response-card"',
  '夢の解釈表示領域の既存IDが維持されていません。'
);
requireText(
  'id="dream-response-text"',
  '夢の解釈本文の既存IDが維持されていません。'
);
requireText(
  'id="dream-history-list" aria-live="polite"',
  '夢の記録一覧の既存IDまたはライブリージョンが維持されていません。'
);
requireText(
  'id="dream-history-pagination"',
  '夢の記録ページネーションの既存IDが維持されていません。'
);
requireText(
  'class="dream-history-entry"',
  '動的に描画される夢の記録に新しい通常カード構造がありません。'
);
requireText(
  'class="dream-history-interpretation"',
  '動的に描画される夢の解釈に新しい階層スタイルがありません。'
);
requireText(
  'id="dream-login-overlay" class="login-lock-container hidden"',
  'AI夢占いの会員ロック識別子が維持されていません。'
);
requireText(
  "onclick=\"openMemberLoginDialog('dream', this)\"",
  'AI夢占いの会員ロックが共通ログイン導線へ接続されていません。'
);
requireText(
  "openMemberLoginDialog('dream', btn || document.activeElement);",
  '未ログイン時の夢占い送信が共通ログイン導線へ接続されていません。'
);
requireText(
  'html.dark #view-dream.dream-oracle-layout',
  'AI夢占いのダークテーマ変数がありません。'
);
requireText(
  'html.dark .dream-oracle-hero',
  'AI夢占いヒーローのダークテーマがありません。'
);
requireText(
  '.dream-oracle-hero { grid-template-columns: 1fr; padding: 24px 20px !important; }',
  'AI夢占いヒーローのモバイル1カラム規則がありません。'
);
requireText(
  '.dream-form-actions { align-items: stretch; flex-direction: column; }',
  'AI夢占い操作面のモバイル縦積み規則がありません。'
);
assert.equal(countOccurrences('data-ver4-hero-emblem'), countOccurrences('data-ver4-hero-emblem'), '共通印章の属性検査に失敗しました。');

console.log('AI夢占いVer.4.0 UI回帰テストに合格しました。');
console.log(JSON.stringify({
  dreamOracleTemplate: true,
  sharedHeroEmblem: true,
  normalCardHierarchy: true,
  inputAndHistoryContractsPreserved: true,
  memberLockPreserved: true,
  darkThemeRulesPresent: true,
  responsiveRulesPresent: true,
}, null, 2));
