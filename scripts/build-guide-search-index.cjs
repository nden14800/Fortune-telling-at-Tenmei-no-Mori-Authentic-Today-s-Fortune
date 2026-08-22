const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'index.html');
const outputDir = path.join(root, 'assets', 'vendor', 'pagefind');
const sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tenmei-mori-guide-search-'));
const pagefindNotice = `Pagefind 1.5.0\nhttps://pagefind.app/\nhttps://github.com/Pagefind/pagefind\n\nThis directory contains Pagefind's locally served static search assets and an index generated from publicly available 社務所だより and 神籤草子 articles. No external search SaaS, account, analytics endpoint, or visitor query logging is used.\n\nPagefind is licensed under the MIT License.\n\nMIT License\n\nCopyright (c) 2021 CloudCannon Pty Ltd\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \"Software\"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n`;

function fail(message) {
  console.error(`案内センター検索索引の生成に失敗しました: ${message}`);
  process.exit(1);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function articleText(html) {
  return String(html ?? '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function sourceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start === -1 || end === -1) fail(`${startMarker} から ${endMarker} までの記事データを検出できません。`);
  return source.slice(start, end);
}

function loadArticleData() {
  const source = fs.readFileSync(htmlPath, 'utf8');
  const newsSource = sourceBetween(source, 'const newsData =', '// ■ 神籤草子（コラム）データ');
  const columnSource = sourceBetween(source, 'const columnData =', '// 履歴ページネーション用の状態管理');

  try {
    const evaluate = new Function(`${newsSource}\n${columnSource}\nreturn { newsData, columnData };`);
    const { newsData, columnData } = evaluate();
    if (!Array.isArray(newsData) || !Array.isArray(columnData)) {
      fail('記事データを配列として読み取れません。');
    }
    return { newsData, columnData };
  } catch (error) {
    fail(`記事データを読み取れません。${error.message}`);
  }
}

function makeSearchDocument(type, item) {
  const label = type === 'news' ? '社務所だより' : '神籤草子';
  const category = item.tag || item.category || label;
  const guideUrl = `/?guide_article=${encodeURIComponent(`${type}-${item.id}`)}`;
  const documentTitle = `${item.title} | ${label} | 天命乃杜`;
  const text = articleText(item.content);

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(documentTitle)}</title>
</head>
<body>
  <main data-pagefind-body>
    <p data-pagefind-meta="guide_url:${guideUrl}"></p>
    <p data-pagefind-meta="type:${label}"></p>
    <p data-pagefind-meta="category:${category}"></p>
    <p data-pagefind-meta="date:${item.date}"></p>
    <h1 data-pagefind-meta="title">${escapeHtml(item.title)}</h1>
    <p>${escapeHtml(label)}・${escapeHtml(category)}・${escapeHtml(item.date)}</p>
    <p>${escapeHtml(item.desc || '')}</p>
    <article>${escapeHtml(text)}</article>
  </main>
</body>
</html>`;
}

function writeSearchSources(newsData, columnData) {
  for (const item of newsData) {
    fs.writeFileSync(path.join(sourceDir, `news-${item.id}.html`), makeSearchDocument('news', item));
  }
  for (const item of columnData) {
    fs.writeFileSync(path.join(sourceDir, `column-${item.id}.html`), makeSearchDocument('column', item));
  }
}

function runPagefind() {
  fs.rmSync(outputDir, { recursive: true, force: true });
  const result = spawnSync(
    'npx',
    ['--yes', 'pagefind@1.5.0', '--site', sourceDir, '--output-path', outputDir],
    { cwd: root, encoding: 'utf8' }
  );

  if (result.error) fail(result.error.message);
  if (result.status !== 0) fail((result.stderr || result.stdout || 'Pagefind CLIが異常終了しました。').trim());

  const requiredFiles = [
    'pagefind.js',
    'pagefind-ui.js',
    'pagefind-component-ui.js',
    'pagefind-component-ui.css',
  ];
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(outputDir, file))) {
      fail(`Pagefindの生成物が不足しています: ${file}`);
    }
  }

  fs.writeFileSync(path.join(outputDir, 'NOTICE.txt'), pagefindNotice, 'utf8');
  return result.stdout.trim();
}

try {
  const { newsData, columnData } = loadArticleData();
  writeSearchSources(newsData, columnData);
  const output = runPagefind();
  console.log(output);
  console.log(JSON.stringify({
    news: newsData.length,
    columns: columnData.length,
    total: newsData.length + columnData.length,
    outputDir: path.relative(root, outputDir),
  }, null, 2));
} finally {
  fs.rmSync(sourceDir, { recursive: true, force: true });
}
