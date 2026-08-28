const TRANSLATION_MANIFEST_URL = '/assets/data/static-translations/manifest.json';

const LANGUAGE_OPTIONS = [
    { code: 'ja', locale: 'ja', native: '日本語', japanese: '日本語', mark: '日' },
    { code: 'en', locale: 'en', native: 'English', japanese: '英語', mark: 'EN' },
    { code: 'ko', locale: 'ko', native: '한국어', japanese: '韓国語', mark: '한' },
    { code: 'zh', locale: 'zh-CN', native: '简体中文', japanese: '簡体中国語', mark: '简' },
    { code: 'zh_hant', locale: 'zh-TW', native: '繁體中文', japanese: '繁体中国語', mark: '繁' },
    { code: 'fr', locale: 'fr', native: 'Français', japanese: 'フランス語', mark: 'FR' },
    { code: 'de', locale: 'de', native: 'Deutsch', japanese: 'ドイツ語', mark: 'DE' },
    { code: 'es', locale: 'es', native: 'Español', japanese: 'スペイン語', mark: 'ES' },
    { code: 'pt', locale: 'pt', native: 'Português', japanese: 'ポルトガル語', mark: 'PT' },
    { code: 'vi', locale: 'vi', native: 'Tiếng Việt', japanese: 'ベトナム語', mark: 'VI' },
    { code: 'id', locale: 'id', native: 'Bahasa Indonesia', japanese: 'インドネシア語', mark: 'ID' },
    { code: 'th', locale: 'th', native: 'ไทย', japanese: 'タイ語', mark: 'TH' },
];

const state = {
    currentLanguage: 'ja',
    dictionaryCache: new Map(),
    manifest: null,
    manifestPromise: null,
    originalNodes: [],
    originalText: new WeakMap(),
    translating: false,
    pendingLanguage: null,
    observed: false,
    mutationTimer: null,
};

function getOption(code) {
    return LANGUAGE_OPTIONS.find((option) => option.code === code) || LANGUAGE_OPTIONS[0];
}

function getElement(id) {
    return document.getElementById(id);
}

function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function restoreWhitespace(original, translated) {
    const leading = String(original || '').match(/^\s*/)?.[0] || '';
    const trailing = String(original || '').match(/\s*$/)?.[0] || '';
    return `${leading}${translated}${trailing}`;
}

function setStatus({ title, detail, loading = false, progress = null }) {
    const container = getElement('static-translation-status');
    const titleElement = getElement('static-translation-status-title');
    const detailElement = getElement('static-translation-status-detail');
    const progressElement = getElement('static-translation-progress');
    if (container) container.classList.toggle('is-loading', Boolean(loading));
    if (titleElement) titleElement.textContent = title;
    if (detailElement) detailElement.textContent = detail;
    if (progressElement) {
        progressElement.hidden = progress === null;
        if (progress !== null) progressElement.value = Math.max(0, Math.min(100, Number(progress) || 0));
    }
}

function updateLanguageButtons() {
    document.querySelectorAll('[data-static-language]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.staticLanguage === state.currentLanguage));
        button.disabled = state.translating;
    });
}

function renderLanguageGrid() {
    const grid = getElement('static-translation-language-grid');
    if (!grid) return;
    grid.innerHTML = LANGUAGE_OPTIONS.map((option) => {
        const isCurrent = option.code === state.currentLanguage;
        return `<button class="translation-language-option notranslate" type="button" data-static-language="${option.code}" aria-pressed="${isCurrent}" aria-label="${option.japanese}で表示">
            <span class="translation-language-option__mark" aria-hidden="true">${option.mark}</span>
            <span class="translation-language-option__copy">
                <span class="translation-language-option__native">${option.native}</span>
                <span class="translation-language-option__ja">${option.japanese}</span>
            </span>
        </button>`;
    }).join('');
    grid.addEventListener('click', (event) => {
        const button = event.target.closest('[data-static-language]');
        if (!button || button.disabled) return;
        void selectLanguage(button.dataset.staticLanguage);
    });
}

function isExcludedTextNode(node) {
    const parent = node.parentElement;
    if (!parent || !normalizeText(node.nodeValue)) return true;
    return Boolean(parent.closest([
        'script', 'style', 'noscript', 'template', 'svg', 'math', 'textarea', 'input', 'select', 'option', 'button', '[role="button"]',
        '[contenteditable="true"]', '[data-translation-exclude]', '.notranslate', '#sidebar', '#translation-dialog',
        '#document-history-dialog', '#site-language-access', '#tutorial-overlay', '#ch-plugin', '.channel-plugin',
        '[aria-live]'
    ].join(',')));
}

function collectTextNodes() {
    const root = document.querySelector('.view-section.active') || document.getElementById('main-content') || document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            return isExcludedTextNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
    });
    const nodes = [];
    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!state.originalText.has(node)) {
            state.originalText.set(node, node.nodeValue);
            state.originalNodes.push(node);
        }
        nodes.push(node);
    }
    return nodes;
}

function restoreJapanese() {
    state.originalNodes.forEach((node) => {
        if (node?.isConnected && state.originalText.has(node)) node.nodeValue = state.originalText.get(node);
    });
    document.documentElement.lang = 'ja';
}

async function loadManifest() {
    if (state.manifest) return state.manifest;
    if (!state.manifestPromise) {
        state.manifestPromise = fetch(TRANSLATION_MANIFEST_URL, { credentials: 'omit', cache: 'force-cache' })
            .then(async (response) => {
                if (!response.ok) throw new Error(`translation_manifest_http_${response.status}`);
                const manifest = await response.json();
                if (manifest?.schemaVersion !== 1 || manifest?.sourceLanguage !== 'ja' || !manifest.files) {
                    throw new Error('translation_manifest_invalid');
                }
                state.manifest = manifest;
                return manifest;
            })
            .catch((error) => {
                state.manifestPromise = null;
                throw error;
            });
    }
    return state.manifestPromise;
}

async function loadDictionary(language) {
    if (state.dictionaryCache.has(language)) return state.dictionaryCache.get(language);
    const manifest = await loadManifest();
    const fileName = manifest.files?.[language];
    if (!fileName || !/^[a-z_]+\.json$/i.test(fileName)) throw new Error(`translation_language_unavailable_${language}`);
    const url = new URL(`/assets/data/static-translations/${fileName}`, window.location.origin);
    if (url.origin !== window.location.origin) throw new Error('translation_dictionary_nonlocal');
    const response = await fetch(url.href, { credentials: 'omit', cache: 'force-cache' });
    if (!response.ok) throw new Error(`translation_dictionary_http_${response.status}`);
    const dictionary = await response.json();
    if (dictionary?.schemaVersion !== 1 || dictionary?.sourceLanguage !== 'ja' || dictionary?.targetLanguage !== language || !dictionary.translations) {
        throw new Error('translation_dictionary_invalid');
    }
    state.dictionaryCache.set(language, dictionary.translations);
    return dictionary.translations;
}

function applyDictionary(dictionary) {
    const nodes = collectTextNodes();
    let translatedCount = 0;
    for (const node of nodes) {
        const original = state.originalText.get(node);
        const translated = dictionary[normalizeText(original)];
        if (typeof translated === 'string' && translated.trim()) {
            node.nodeValue = restoreWhitespace(original, translated);
            translatedCount += 1;
        }
    }
    return { total: nodes.length, translated: translatedCount };
}

async function selectLanguage(language, { force = false } = {}) {
    const option = getOption(language);
    if (state.translating) {
        state.pendingLanguage = option.code;
        return;
    }
    if (!force && option.code === state.currentLanguage) return;

    state.translating = true;
    state.pendingLanguage = option.code;
    updateLanguageButtons();
    try {
        restoreJapanese();
        if (option.code === 'ja') {
            state.currentLanguage = 'ja';
            setStatus({ title: '日本語を表示中です', detail: '公開時の原文へ戻しました。', loading: false });
            return;
        }
        setStatus({
            title: `${option.japanese}の表示データを読み込んでいます`,
            detail: 'このサイトが自己配信する軽量な翻訳データを読み込んでいます。本文を翻訳APIへ送信しません。',
            loading: true,
            progress: 30,
        });
        const dictionary = await loadDictionary(option.code);
        if (state.pendingLanguage !== option.code) return;
        setStatus({
            title: `${option.japanese}を表示しています`,
            detail: '表示中の公開本文を軽量な自己配信翻訳データで置き換えています。',
            loading: true,
            progress: 70,
        });
        const result = applyDictionary(dictionary);
        if (state.pendingLanguage !== option.code) return;
        state.currentLanguage = option.code;
        document.documentElement.lang = option.locale;
        setStatus({
            title: `${option.japanese}を表示中です`,
            detail: `公開本文を軽量な自己配信翻訳データで表示しました（${result.translated}/${result.total}件）。日本語を選ぶと原文へ戻ります。`,
            loading: false,
            progress: 100,
        });
    } catch (error) {
        console.error('Static translation display failed:', error);
        restoreJapanese();
        state.currentLanguage = 'ja';
        setStatus({
            title: '翻訳表示を開始できませんでした',
            detail: '自己配信する軽量な翻訳データの取得に失敗しました。通信状況を確認して、もう一度お試しください。',
            loading: false,
        });
    } finally {
        state.translating = false;
        if (state.pendingLanguage !== option.code) {
            const nextLanguage = state.pendingLanguage;
            state.pendingLanguage = null;
            updateLanguageButtons();
            if (nextLanguage) void selectLanguage(nextLanguage);
            return;
        }
        state.pendingLanguage = null;
        updateLanguageButtons();
    }
}

function observeViewChanges() {
    if (state.observed || !document.body) return;
    const observer = new MutationObserver((mutations) => {
        const activeViewChanged = mutations.some((mutation) => mutation.target instanceof Element && mutation.target.matches('.view-section'));
        if (!activeViewChanged || state.currentLanguage === 'ja' || state.translating) return;
        window.clearTimeout(state.mutationTimer);
        state.mutationTimer = window.setTimeout(() => {
            if (!state.translating && state.currentLanguage !== 'ja') void selectLanguage(state.currentLanguage, { force: true });
        }, 180);
    });
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });
    state.observed = true;
}

function openTranslationPanel() {
    const dialog = getElement('translation-dialog');
    if (dialog && !dialog.open) dialog.showModal();
}

function closeTranslationPanel() {
    const dialog = getElement('translation-dialog');
    if (dialog?.open) dialog.close();
}

function initialize() {
    renderLanguageGrid();
    updateLanguageButtons();
    observeViewChanges();
    window.openTranslationPanel = openTranslationPanel;
    window.closeTranslationPanel = closeTranslationPanel;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
} else {
    initialize();
}
