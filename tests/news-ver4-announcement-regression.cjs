const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.resolve(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const article = html.match(/\{\s*id: 87,[\s\S]*?\n\},\n\n\{\s*id: 86,/)?.[0] || '';

assert(article, 'Ver.4.0完了記事（id:87）を抽出できません。');

[
  'id: 87,',
  'title: "【UI/UX大規模刷新】Ver.4.0「静謐な即応」— 天命乃杜の全画面を新たな意匠へ統一しました"',
  'date: "2026/08/17"',
  'time: "12:37"',
  'tag: "新機能・改善"',
  'Ver.4.0「静謐な即応」について',
  '社務所だよりを基準に、全画面の共通意匠を整備',
  '日々の参拝・占い・記録の導線を統一',
  'おみくじの体験を、心構えから結果の次の行動まで再設計',
  'サイドバーを最後の共通操作面として刷新',
  'クリック、Enter、Spaceのいずれでも一枚を選べる操作',
  '今回の更新をもって、サービスのバージョン表記を<strong>Ver.4.0</strong>へ更新しました。',
  '記事・保存・安全性に関する更新',
  'お盆に神社へお参りしてもいい？——先祖を想う夏、神道の答え',
  '文字数と読了目安を記事詳細を開く前にも確認できるようにしました。',
  'おみくじ結果に、PDFとして保存する操作を追加しました。',
  'DOM XSS対策とセキュリティヘッダーを追加し、Google連携時に認証トークンがURLへ露出しないよう修正しました。',
  '通知・確認モーダルを含む既存の重要な操作は、今回の刷新対象から外して維持しています。',
  '以上、今回の変更内容のご報告でした。引き続き「運勢・天命乃杜」をよろしくお願いいたします。',
].forEach((text) => {
  assert(article.includes(text), `Ver.4.0完了記事に必要なメタデータまたは本文が不足しています: ${text}`);
});

assert.equal(article.includes('date: "2026/08/12"'), false, '新記事の日付に直前記事の日付が混入しています。');
assert.equal(article.includes('Ver.4.0'), true, '新記事でVer.4.0刷新の完了が明示されていません。');
assert.equal(article.includes('<h3>'), true, '新記事に既存形式の大見出しがありません。');
assert.equal(article.includes('<ul class="list-disc ml-5 mb-4">'), true, '新記事に既存形式の箇条書き構造がありません。');

console.log('Ver.4.0完了に関する社務所だより記事の回帰テストに合格しました。');
console.log(JSON.stringify({
  latestNewsArticle: true,
  publishedAt: '2026/08/17 12:37',
  ver4ScopeDocumented: true,
  ver40ServiceReleaseDocumented: true,
  preVer4UnrecordedUpdatesDocumented: true,
  existingModalExceptionDocumented: true,
}, null, 2));
