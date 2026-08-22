const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
let failures = 0;

function expect(condition, message) {
  if (!condition) {
    failures += 1;
    console.error(`FAIL: ${message}`);
  }
}

function includes(fragment, message) {
  expect(html.includes(fragment), message);
}

function matches(pattern, message) {
  expect(pattern.test(html), message);
}

console.log('全国・土地の運気 国土見晴台回帰テストを開始します。');

// テンプレート全体
includes('class="view-section prefecture-observatory-layout relative"', '国土見晴台のルートテンプレートが存在する');
includes('class="prefecture-observatory-hero"', '国土見晴台のヒーローが存在する');
includes('REGIONAL FORTUNE OBSERVATORY', 'ヒーローの英字ラベルが存在する');
includes('<p class="prefecture-observatory-kicker"><i class="bi bi-map" aria-hidden="true"></i> REGIONAL FORTUNE OBSERVATORY</p>', 'ヒーロー英字ラベルの左アイコンが共通構造で存在する');
includes('全国・土地の運気', '画面の正式名称が維持されている');
includes('id="pref-date-display"', '日付表示要素が維持されている');
includes('独自のアルゴリズムに基づく娯楽コンテンツです。', '娯楽コンテンツの注意書きが維持されている');
includes('class="prefecture-observatory-mark"', '土地の運気を示す印章が存在する');
expect(!html.includes('class="prefecture-observatory-title-icon"'), '主見出しの左にだけある旧アイコン構造が残っていない');
expect(!html.includes('.prefecture-observatory-title-icon {'), '主見出し左アイコンの旧スタイルが残っていない');
expect(!html.includes('id="view-prefecture" class="view-section max-w-5xl mx-auto relative pb-20"'), '旧Bento形式の土地の運気ルートが残っていない');
expect(!html.includes('<!-- ヘッダー Hero カード -->\n    <div class="bento-card mb-6 relative overflow-hidden text-white"'), '旧土地の運気ヒーローカードが残っていない');

// アクセシブルな表示切替
includes('role="tablist" aria-label="土地の運気の表示方法"', '表示切替がtablistとして定義されている');
includes('id="pref-tab-text" type="button" role="tab" aria-controls="pref-text-content" aria-selected="true" tabindex="0"', 'ランキングタブのARIA接続が存在する');
includes('id="pref-tab-map" type="button" role="tab" aria-controls="pref-map-content" aria-selected="false" tabindex="-1"', '地図タブのARIA接続が存在する');
includes('onkeydown="handlePrefTabKeydown(event)"', 'タブのキーボード操作が接続されている');
includes('id="pref-text-content" class="prefecture-view-panel" role="tabpanel" aria-labelledby="pref-tab-text" tabindex="0"', 'ランキングパネルがtablistと接続されている');
includes('id="pref-map-content" class="prefecture-view-panel" role="tabpanel" aria-labelledby="pref-tab-map" tabindex="0" hidden', '地図パネルが初期非表示かつtablistと接続されている');
includes('window.handlePrefTabKeydown = function(event)', 'タブ用キーボード関数が存在する');
includes("if (event.key === 'ArrowRight')", '右矢印によるタブ移動がある');
includes("if (event.key === 'ArrowLeft')", '左矢印によるタブ移動がある');
includes("if (event.key === 'Home')", 'Homeによるタブ移動がある');
includes("if (event.key === 'End')", 'Endによるタブ移動がある');
includes("if (event.key === 'Enter' || event.key === ' ')", 'EnterとSpaceによるタブ有効化がある');
includes("textContent.hidden = !isText;", 'ランキングパネルをhidden属性で切り替える');
includes("mapContent.hidden = isText;", '地図パネルをhidden属性で切り替える');
includes("btnText.setAttribute('aria-selected', String(isText));", 'ランキングタブの選択状態を同期する');
includes("btnMap.setAttribute('aria-selected', String(!isText));", '地図タブの選択状態を同期する');
expect(!html.includes('<div id="pref-map-content" style="display:none;">'), '旧インラインstyleによる地図パネル非表示が残っていない');

// ランキングの契約
includes('id="prefecture-ranking-status"', 'ランキング状態表示のライブリージョンが存在する');
includes('aria-live="polite"', 'ランキング状態表示が控えめなライブリージョンである');
includes('id="prefecture-top3" class="pref-top3-container"', '上位3件の描画先が維持されている');
includes('id="prefecture-list" class="pref-list-grid"', '4位以下の描画先が維持されている');
includes('本日の三景', '上位3件の見出しが存在する');
includes('47都道府県の記録', '4位以下の見出しが存在する');
includes('window.renderPrefectureRanking = function()', 'ランキング描画関数が維持されている');
includes('const rankingStatus = document.getElementById(\'prefecture-ranking-status\');', 'ランキング状態要素を取得している');
includes('rankingStatus.textContent = `全47都道府県・${dateParts ? dateParts[1] : \'\'}月${dateParts ? dateParts[2] : \'\'}日の記録`;', 'ランキング状態が当日の日付を反映する');
includes('const top3Data = rankingData.slice(0, 3);', '上位3件の抽出が維持されている');
includes('const restData = rankingData.slice(3);', '4位以下の抽出が維持されている');
includes("createTopCard(top3Data[0], 1, 'crown-gold'", '1位カードの描画が維持されている');
includes("createTopCard(top3Data[1], 2, 'crown-silver'", '2位カードの描画が維持されている');
includes("createTopCard(top3Data[2], 3, 'crown-bronze'", '3位カードの描画が維持されている');
includes('rankingData.sort((a, b) => b.score - a.score);', 'ランキングの降順整列が維持されている');

// 地図・位置情報・遅延読み込みの契約
includes('id="pref-map-container"', '地図コンテナのIDが維持されている');
includes('id="pref-map" aria-label="都道府県別の土地の運気を表示する地図"', '地図の識別ラベルが存在する');
includes('地図: © <a href="https://www.openstreetmap.org/copyright"', 'OpenStreetMapの帰属が存在する');
includes('rel="noopener noreferrer"', '外部地図帰属リンクの安全属性が存在する');
includes('ensureLeafletLoaded().then(function()', 'Leafletが遅延読み込みされる');
includes('renderPrefectureMap();', '地図描画関数が表示切替から呼ばれる');
includes('_prefMap.invalidateSize({ pan: false, debounceMoveend: true });', '表示切替後に地図サイズを更新する');
includes("_prefMap = L.map('pref-map', {", 'Leaflet地図が既存IDへ初期化される');
includes("L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'", 'OpenStreetMapタイルが維持されている');
includes('L.control.locate({', '現在地操作が維持されている');
includes("strings: { title: '現在地を表示' }", '現在地操作のラベルが維持されている');
includes('fullscreenControl: true,', '全画面操作が維持されている');
includes('rankingData.forEach(item => {', '全都道府県のマーカー描画が維持されている');
includes('circle.bindPopup(popupContent', 'マーカーの詳細ポップアップが維持されている');
includes('circle.bindTooltip(`${item.name}　${item.score}`', 'マーカーの補助ツールチップが維持されている');

// 外観・テーマ・応答性・操作性の契約
includes('/* Ver.4.0: 全国・土地の運気 — 国土見晴台 */', '国土見晴台CSSブロックが存在する');
includes('.prefecture-observatory-layout {', '新テンプレートのルートCSSが存在する');
includes('.prefecture-observatory-hero {', '新ヒーローのCSSが存在する');
includes(".prefecture-observatory-kicker,\n.prefecture-section-kicker,\n.prefecture-map-kicker {\n    display: flex;", '英字ラベルが共通の横並びアイコン構造である');
includes("font-family: 'Zen Kaku Gothic New', sans-serif;", '英字ラベルが共通のゴシック書体を使用する');
includes('.prefecture-observatory-kicker i,', '英字ラベル左アイコンの色と寸法を定義している');
includes('.prefecture-observatory-controls {', '新コントロール面のCSSが存在する');
includes('.prefecture-ranking-panel,', 'ランキング面のCSSが存在する');
includes('.prefecture-map-panel {', '地図面のCSSが存在する');
includes('.pref-tab-btn:focus-visible,', 'タブの可視フォーカス規則が存在する');
includes('html.dark .prefecture-observatory-hero,', 'ダークテーマのヒーロー規則が存在する');
includes('html.dark #pref-map .leaflet-tile-pane {', 'ダークテーマで地図タイル面を切り替える規則が存在する');
includes('filter: invert(100%) hue-rotate(172deg) brightness(76%) saturate(62%) contrast(88%);', 'ダークテーマ用の地図タイルフィルターが存在する');
includes('html.dark #pref-map .leaflet-bar a,', 'ダークテーマでLeaflet操作部品の色を切り替える規則が存在する');
includes('html.dark #pref-map .leaflet-control-attribution {', 'ダークテーマで地図帰属表示の色を切り替える規則が存在する');
includes('html.dark .pref-leaflet-popup .leaflet-popup-content-wrapper,', 'ダークテーマで地図ポップアップの色を切り替える規則が存在する');
includes('html.dark .pref-popup-inner .pp-score.rank-S { color: #f1cc69; }', 'ダークテーマでSランクのポップアップ色を明るく保つ規則が存在する');
includes('html.dark .pref-popup-inner .pp-score small {', 'ダークテーマでランク補助ラベルの可読性を保つ規則が存在する');
includes('html.dark #pref-map .leaflet-tooltip {', 'ダークテーマで地図ホバーツールチップの可読性を保つ規則が存在する');
includes('#pref-map .leaflet-tile-pane {\n    transition: filter 180ms', '地図タイルがテーマ変更時に落ち着いて切り替わる規則が存在する');
includes('@media (min-width: 720px)', '広い画面向けのランキング配置規則が存在する');
includes('@media (max-width: 719px)', '狭い画面向けの一列配置規則が存在する');
includes('@media (prefers-reduced-motion: reduce)', '低モーション規則が存在する');
includes('height: clamp(360px, 58vw, 560px);', '地図が柔軟な高さで表示される');
includes('/* Ver.4.0: 画面横断の紙面・カードリズム統一', '画面横断の紙面・カードリズム統一規則が存在する');
includes('.prefecture-observatory-layout,\n.auth-pilgrimage-view {\n    width: min(100%, 960px);', '土地の運気と参拝証の共通コンテンツ幅が定義されている');
includes('.prefecture-observatory-hero,\n.auth-passport-hero {\n    min-height: 250px;', '両画面のヒーローカード高が統一されている');
includes('.prefecture-observatory-controls,\n.prefecture-ranking-panel,\n.prefecture-map-panel,\n.auth-journey-panel,\n.auth-workbench {\n    border-radius: 22px;', '両画面の主要カード角丸が統一されている');

if (failures > 0) {
  console.error(`全国・土地の運気 国土見晴台回帰テスト: ${failures}件失敗`);
  process.exit(1);
}

console.log('全国・土地の運気 国土見晴台回帰テスト: 合格');
