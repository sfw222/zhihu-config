// ==UserScript==
// @name         知乎设置
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  手动切换知乎深色/浅色主题（默认深色），修复少量深色模式遗漏；完全移除 AI 总结卡片，不留空白占位。
// @author       sfw222
// @match        https://www.zhihu.com/*
// @match        https://zhuanlan.zhihu.com/*
// @icon         https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/Logos/zhihu-line.svg
// @updateURL    https://raw.githubusercontent.com/sfw222/zhihu-config/main/zhihu-config.user.js
// @downloadURL  https://raw.githubusercontent.com/sfw222/zhihu-config/main/zhihu-config.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// @noframes
// ==/UserScript==





(function () {
    'use strict';

    const PARAM = 'theme';
    const root = document.documentElement;
    const current = GM_getValue('theme', 'dark');

    function applyTheme(theme) {
        GM_setValue('theme', theme);
        document.cookie = `theme=${theme}; Path=/; Domain=.zhihu.com; Max-Age=31536000; SameSite=Lax; Secure`;
        root.setAttribute('data-theme', theme);

        const url = new URL(location.href);
        const hint = url.searchParams.get(PARAM) || root.getAttribute('data-theme');
        if (hint !== theme) {
            url.searchParams.set(PARAM, theme);
            location.replace(url.href);
        }
    }

    // 油猴菜单切换
    ['dark', 'light'].forEach(function (t) {
        GM_registerMenuCommand(
            (current === t ? '✓ ' : '') + (t === 'dark' ? '深色模式' : '浅色模式'),
            function () { applyTheme(t); }
        );
    });

    // 首次加载应用主题
    applyTheme(current);

    // 搜索页文章目录树修复：将目录树从覆盖正文改为折叠/展开式内联显示
    const tocStyle = document.createElement('style');
    tocStyle.id = 'zhihu-search-toc-fix';
    tocStyle.textContent = `
        /* 搜索结果页：目录树按钮样式调整 */
        .SearchResult-Card .Post-RichTextContainer .css-14qjjyh,
        .SearchResult-Card .RichContent-inner .css-14qjjyh {
            position: relative !important;
            z-index: 1;
        }
        /* 搜索结果页：目录面板改为内联定位，不覆盖正文 */
        .SearchResult-Card .Post-RichTextContainer .Catalog,
        .SearchResult-Card .RichContent-inner .Catalog,
        .SearchResult-Card .Post-RichTextContainer [class*="Catalog"],
        .SearchResult-Card .RichContent-inner [class*="Catalog"] {
            position: relative !important;
            float: none !important;
            width: 100% !important;
            max-height: none !important;
            margin-bottom: 12px !important;
            border-radius: 8px !important;
            overflow: hidden;
        }
        /* 搜索结果页：移除目录侧边栏的固定定位 */
        .SearchResult-Card .Post-RichTextContainer .Catalog-content,
        .SearchResult-Card .RichContent-inner .Catalog-content,
        .SearchResult-Card [class*="CatalogWrapper"] {
            position: relative !important;
            top: auto !important;
            left: auto !important;
            right: auto !important;
            transform: none !important;
            width: 100% !important;
            max-height: 300px !important;
            overflow-y: auto !important;
        }
        /* 搜索结果页：目录项样式 */
        .SearchResult-Card .Catalog-item,
        .SearchResult-Card [class*="CatalogItem"] {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `;
    (document.head || root).appendChild(tocStyle);

    // 深色模式补丁 CSS
    if (current === 'dark') {
        const s = document.createElement('style');
        s.id = 'zhihu-auto-dark-mode-style';
        s.textContent = `
            html[data-theme="dark"]{color-scheme:dark}
            html[data-theme="dark"]:where(.jumpThird-ad-tip,.Pc-feedAd-container--mobile,.Pc-feedAd-card-sign-popup,.Pc-feedAd-card-sign-popup-menu,.Pc-feedAd-card-content,.Pc-feedAd-new-card-content,.KfeCollection-CreateSaltCard,.KfeCollection-GoodsCardNew-wrapper,.KfeCollection-GoodsCardV2,.KfeCollection-PaidConsultCard-CardWrapper,.KfeCollection-PcCollegeCard-root,.KfeCollection-PcSaltBrandCard,.KfeCollection-PayModal-wrapper,.TooltipContent--white){background-color:var(--GBK99A,#191b1f)!important;border-color:var(--GBK09A,#282b30)!important;color:var(--GBK03A,#c2c6cf)!important}
            html[data-theme="dark"]:where(.Pc-feedAd-card-title,.Pc-feedAd-new-title){color:var(--GBK02A,#fff)!important}
            html[data-theme="dark"].KfeCollection-components-Toast{background-color:var(--GBK10C,#000)!important;color:var(--GBK03A,#c2c6cf)!important}
            html[data-theme="dark"]:where(.NavigateToAppCheckCard-mask,.KfeCollection-TextLink-mask,.KfeCollection-PurchaseBtn-mask){background:linear-gradient(180deg,transparent,var(--GBK99A,#191b1f))!important}
            html[data-theme="dark"].TooltipContent--white .TooltipContent-arrow::after{background-color:var(--GBK99A,#191b1f)!important}
            html[data-theme="dark"].SignContainer-content input:-webkit-autofill{-webkit-text-fill-color:var(--GBK03A,#c2c6cf)!important;-webkit-box-shadow:inset 0 0 0 1000px var(--GBK10A,#212429)!important}
            html[data-theme="dark"]:where(.ModalWrap-itemBtn,.SearchSubTabs-item,.DraftHistory-revert,.Pc-feedAd-link-btn):is(:hover,:focus-visible,.is-active){color:var(--GBL01A,#558eff)!important}
            html[data-theme="dark"]:where(.SearchTabs-customFilter .tag-selected,.highlight-wrap-checking){background-color:rgba(85,142,255,.1)!important}
            html[data-theme="dark"]:where(.AnswerForm-fullscreenBackdrop,.ImageView.is-active,.ImageGallery.is-active){background-color:rgba(0,0,0,.65)!important}
        `;
        (document.head || root).appendChild(s);
    }

    // 防止知乎 SPA 导航覆盖主题
    new MutationObserver(function () {
        var t = GM_getValue('theme', 'dark');
        if (root.getAttribute('data-theme') !== t) root.setAttribute('data-theme', t);
    }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    // 移除 AI 总结卡片
    function removeAISummary() {
        var jumpBtn = document.querySelector('[data-testid="Button:zhida_message_block_jump_entrance_top"]');
        if (!jumpBtn) return;
        var scroller = jumpBtn.closest('[data-custom-scroller="true"]');
        if (!scroller) return;
        var card = scroller.parentElement;
        if (card) card = card.parentElement;
        if (card) card = card.parentElement;
        if (card && card !== document.body && !card.hasAttribute('data-custom-scroller')) {
            card.remove();
        }
    }

    // 等 body 就绪后监听
    var aiTimer = null;
    function debounceRemove() {
        if (aiTimer) return;
        aiTimer = setTimeout(function () { aiTimer = null; removeAISummary(); }, 500);
    }

    if (document.body) {
        removeAISummary();
        new MutationObserver(debounceRemove).observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            removeAISummary();
            new MutationObserver(debounceRemove).observe(document.body, { childList: true, subtree: true });
        });
    }

})();