const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repositoryRoot, 'index.html');
const assetDirectory = path.join(repositoryRoot, 'assets', 'article-images');
const indexHtml = fs.readFileSync(indexPath, 'utf8');
const generatedImageIds = [45, 46, 47, 48, 49, 50, 51, 52, 54, 55, 56, 57, 58, 59, 60, 61];
const tallScreenshotSources = [
  '/assets/article-images/atago-jinja-omikuji-full-page.webp',
  '/assets/article-images/macchan-mikuji-full-page.webp',
  '/assets/article-images/omikuji-do-full-page.webp',
  '/assets/article-images/omikuji-online-full-page.webp',
  '/assets/article-images/prism-japan-omikuji-full-page.webp',
];
const failures = [];

for (const id of generatedImageIds) {
  const paddedId = String(id).padStart(3, '0');
  const webpReference = `/assets/article-images/column-${paddedId}-overview.webp`;
  const svgReference = `/assets/article-images/column-${paddedId}-overview.svg`;
  const assetPath = path.join(assetDirectory, `column-${paddedId}-overview.webp`);
  const imageTagPattern = new RegExp(`<img src="${webpReference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" alt="([^"]+)" loading="lazy">`);

  if (!fs.existsSync(assetPath)) {
    failures.push(`生成画像が存在しません: ${assetPath}`);
  }
  if (!indexHtml.includes(webpReference)) {
    failures.push(`WebP参照がありません: ${webpReference}`);
  }
  if (indexHtml.includes(svgReference)) {
    failures.push(`先行公開対象にSVG参照が残っています: ${svgReference}`);
  }
  if (!imageTagPattern.test(indexHtml)) {
    failures.push(`空でないalt属性またはlazy loadingを持つ画像タグがありません: ${webpReference}`);
  }
}

if (!indexHtml.includes('.article-visual--ai-generated img') || !indexHtml.includes('aspect-ratio: 16 / 9') || !indexHtml.includes('object-fit: cover')) {
  failures.push('AI生成WebP向けの表示比率・object-fit規則がありません。');
}
if (indexHtml.includes('.article-content .article-visual img[src$=".webp"]')) {
  failures.push('全WebPへ固定16:9を適用する規則が残っています。');
}
for (const screenshotSource of tallScreenshotSources) {
  const imagePosition = indexHtml.indexOf(screenshotSource);
  const figureStart = indexHtml.lastIndexOf('<figure', imagePosition);
  const figureEnd = indexHtml.indexOf('</figure>', imagePosition);
  const figureFragment = indexHtml.slice(figureStart, figureEnd);
  if (imagePosition === -1 || !figureFragment.includes('article-visual--screen')) {
    failures.push(`縦長スクリーンショットの全体表示用クラスがありません: ${screenshotSource}`);
  }
}

const disclosureLabelCount = (indexHtml.match(/<strong>AI生成イメージ<\/strong>/g) || []).length;
const nonPhotographNoticeCount = (indexHtml.match(/実在の場所・人物・出来事を撮影した写真ではありません。/g) || []).length;
const disclosureFigureCount = (indexHtml.match(/<figure class="article-visual article-visual--overview article-visual--ai-generated">/g) || []).length;

if (disclosureLabelCount !== generatedImageIds.length) {
  failures.push(`AI生成ラベルの件数が不正です: ${disclosureLabelCount}`);
}
if (nonPhotographNoticeCount !== generatedImageIds.length * 2) {
  failures.push(`非実写説明の件数が不正です: ${nonPhotographNoticeCount}`);
}
if (disclosureFigureCount !== generatedImageIds.length) {
  failures.push(`AI生成画像用figureの件数が不正です: ${disclosureFigureCount}`);
}
if (!indexHtml.includes('ai-image-disclosure__badge') || !indexHtml.includes('ai-image-disclosure__copy')) {
  failures.push('AI生成ラベルの表示部品がありません。');
}

if (failures.length > 0) {
  console.error('神籤草子画像回帰テストに失敗しました。');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`神籤草子画像回帰テストに成功しました。先行公開画像 ${generatedImageIds.length} 件を確認しました。`);
