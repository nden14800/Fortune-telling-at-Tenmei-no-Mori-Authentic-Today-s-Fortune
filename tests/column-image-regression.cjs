const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repositoryRoot, 'index.html');
const assetDirectory = path.join(repositoryRoot, 'assets', 'article-images');
const indexHtml = fs.readFileSync(indexPath, 'utf8');
const generatedImages = [
  ...Array.from({ length: 20 }, (_, offset) => ({ id: 5 + offset, extension: 'webp' })),
  ...Array.from({ length: 20 }, (_, offset) => ({ id: 25 + offset, extension: 'webp' })),
  ...[45, 46, 47, 48, 49, 50, 51, 52, 54, 55, 56, 57, 58, 59, 60, 61].map((id) => ({ id, extension: 'webp' })),
];
const residualSvgArticles = [2, 3, 4];
const structuredSvgSources = [
  'assets/article-images/omikuji-rank-order-12.svg',
];
const tallScreenshotSources = [
  'assets/article-images/atago-jinja-omikuji-full-page.webp',
  'assets/article-images/macchan-mikuji-full-page.webp',
  'assets/article-images/omikuji-do-full-page.webp',
  'assets/article-images/omikuji-online-full-page.webp',
  'assets/article-images/prism-japan-omikuji-full-page.webp',
];
const failures = [];

for (const { id, extension } of generatedImages) {
  const paddedId = String(id).padStart(3, '0');
  const imageReference = `assets/article-images/column-${paddedId}-overview.${extension}`;
  const svgReference = `assets/article-images/column-${paddedId}-overview.svg`;
  const assetPath = path.join(assetDirectory, `column-${paddedId}-overview.${extension}`);
  const imageTagPattern = new RegExp(`<img src="${imageReference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" alt="([^"]+)" loading="lazy">`);

  if (!fs.existsSync(assetPath)) {
    failures.push(`生成画像が存在しません: ${assetPath}`);
  }
  if (!indexHtml.includes(imageReference)) {
    failures.push(`AI生成画像の参照がありません: ${imageReference}`);
  }
  if (indexHtml.includes(svgReference)) {
    failures.push(`AI生成画像へ置換済みの記事にSVG参照が残っています: ${svgReference}`);
  }
  if (!imageTagPattern.test(indexHtml)) {
    failures.push(`空でないalt属性またはlazy loadingを持つ画像タグがありません: ${imageReference}`);
  }
}

if (!indexHtml.includes('.article-visual--ai-generated img') || !indexHtml.includes('aspect-ratio: 16 / 9') || !indexHtml.includes('object-fit: cover')) {
  failures.push('AI生成画像向けの表示比率・object-fit規則がありません。');
}
if (indexHtml.includes('.article-content .article-visual img[src$=".webp"]')) {
  failures.push('全WebPへ固定16:9を適用する規則が残っています。');
}
for (const id of residualSvgArticles) {
  const paddedId = String(id).padStart(3, '0');
  const svgReference = `assets/article-images/column-${paddedId}-overview.svg`;
  const svgAsset = path.join(assetDirectory, `column-${paddedId}-overview.svg`);
  if (!fs.existsSync(svgAsset) || !indexHtml.includes(svgReference)) {
    failures.push(`生成上限後に保留したSVG資料が失われています: ${svgReference}`);
  }
}

for (const source of structuredSvgSources) {
  const assetPath = path.join(repositoryRoot, source);
  if (!fs.existsSync(assetPath) || !indexHtml.includes(source)) {
    failures.push(`正確な吉凶順を示す構造化SVGが失われています: ${source}`);
  }
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

if (/(?:src|href)=["']\/(?:assets|favicon)\//.test(indexHtml)) {
  failures.push('RawGitHackなどのサブパス配信で欠落するルート相対アセット参照が残っています。');
}

const disclosureLabelCount = (indexHtml.match(/<strong>AI生成イメージ<\/strong>/g) || []).length;
const nonPhotographNoticeCount = (indexHtml.match(/実在の場所・人物・出来事を撮影した写真ではありません。/g) || []).length;
const disclosureFigureCount = (indexHtml.match(/<figure class="article-visual article-visual--overview article-visual--ai-generated">/g) || []).length;

if (disclosureLabelCount !== generatedImages.length) {
  failures.push(`AI生成ラベルの件数が不正です: ${disclosureLabelCount}`);
}
if (nonPhotographNoticeCount !== generatedImages.length * 2) {
  failures.push(`非実写説明の件数が不正です: ${nonPhotographNoticeCount}`);
}
if (disclosureFigureCount !== generatedImages.length) {
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

console.log(`神籤草子画像回帰テストに成功しました。AI生成画像 ${generatedImages.length} 件、保留SVG ${residualSvgArticles.length} 件、構造化SVG ${structuredSvgSources.length} 件、縦長スクリーンショット ${tallScreenshotSources.length} 件を確認しました。`);
