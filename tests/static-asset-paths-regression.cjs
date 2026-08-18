const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const requiredFaviconFiles = [
  'favicon-96x96.png',
  'favicon.svg',
  'favicon.ico',
  'apple-touch-icon.png',
  'site.webmanifest',
  'web-app-manifest-192x192.png',
  'web-app-manifest-512x512.png',
];

assert.equal(
  /(?:src|href)=["']\/(?:assets|favicon)\//.test(html),
  false,
  'RawGitHackなどのサブパス配信で欠落するルート相対アセット参照が残っています。'
);

[
  '<link rel="icon" type="image/png" href="favicon/favicon-96x96.png" sizes="96x96" />',
  '<link rel="icon" type="image/svg+xml" href="favicon/favicon.svg" />',
  '<link rel="shortcut icon" href="favicon/favicon.ico" />',
  '<link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon.png" />',
  '<link rel="manifest" href="favicon/site.webmanifest" />',
  '<img src="favicon/apple-touch-icon.png" alt="天命乃杜">',
].forEach((reference) => {
  assert(html.includes(reference), `配信先非依存のアイコン参照がありません: ${reference}`);
});

for (const file of requiredFaviconFiles) {
  assert(fs.existsSync(path.join(root, 'favicon', file)), `必要な本サイトアイコンがありません: favicon/${file}`);
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'favicon', 'site.webmanifest'), 'utf8'));
assert.equal(manifest.name, '天命乃杜', 'Manifestのサイト名が天命乃杜と一致しません。');
assert(manifest.icons.some((icon) => icon.src === 'web-app-manifest-192x192.png' && icon.sizes === '192x192'), '192pxのManifestアイコン参照が不正です。');
assert(manifest.icons.some((icon) => icon.src === 'web-app-manifest-512x512.png' && icon.sizes === '512x512'), '512pxのManifestアイコン参照が不正です。');

const generatedImageReferences = [...html.matchAll(/<img src="(assets\/article-images\/column-\d{3}-overview\.webp)"/g)].map((match) => match[1]);
assert(generatedImageReferences.length >= 56, 'RawGitHackで確認すべきAI生成画像の文書相対参照が不足しています。');
for (const reference of generatedImageReferences) {
  assert(fs.existsSync(path.join(root, reference)), `AI生成画像の実ファイルがありません: ${reference}`);
}

console.log(`静的アセット参照回帰テストに合格しました。AI生成画像 ${generatedImageReferences.length} 件と本サイトアイコンを確認しました。`);
