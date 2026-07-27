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

    // 搜索页文章目录树修复：拦截 Modal 目录弹窗，注入为文章内联侧边栏
    (function fixSearchToc() {
        // 注入侧边栏样式
        var tocCss = document.createElement('style');
        tocCss.id = 'zhihu-inline-toc-style';
        tocCss.textContent = `
            /* 搜索页内联目录侧边栏容器 */
            .zhihu-inline-toc {
                float: right;
                width: 220px;
                margin: 0 0 12px 16px;
                padding: 12px;
                border-radius: 8px;
                background: var(--GBK10A, #212429);
                border: 1px solid var(--GBK09A, #282b30);
                font-size: 13px;
                line-height: 1.6;
                max-height: 400px;
                overflow-y: auto;
            }
            .zhihu-inline-toc-title {
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 8px;
                color: var(--GBK02A, #fff);
            }
            .zhihu-inline-toc-item {
                display: block;
                padding: 4px 8px;
                color: var(--GBK03A, #c2c6cf);
                text-decoration: none;
                border-radius: 4px;
                cursor: pointer;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .zhihu-inline-toc-item:hover {
                background: var(--GBK09A, #282b30);
                color: var(--GBL01A, #558eff);
            }
            .zhihu-inline-toc-item.is-h1 {
                font-weight: 600;
                padding-left: 4px;
            }
            .zhihu-inline-toc-item.is-h2 {
                padding-left: 16px;
            }
            .zhihu-inline-toc-item.is-h3 {
                padding-left: 28px;
                font-size: 12px;
            }
            /* 隐藏搜索页的目录浮动按钮（已被内联侧边栏替代） */
            .SearchResult-Card .zhihu-inline-toc-btn-hidden {
                display: none !important;
            }
            /* 小屏幕不浮动，改为顶部排列 */
            @media (max-width: 800px) {
                .zhihu-inline-toc {
                    float: none;
                    width: 100%;
                    margin: 0 0 12px 0;
                    max-height: 200px;
                }
            }
        `;
        (document.head || document.documentElement).appendChild(tocCss);

        // 拦截目录 Modal：当检测到目录弹窗出现时，提取内容注入文章卡片
        function handleTocModal(modal) {
            // 仅在搜索页生效
            if (!location.pathname.startsWith('/search')) return;

            var titleEl = modal.querySelector('.Modal-title');
            if (!titleEl || titleEl.textContent.trim() !== '目录') return;

            // 防止重复处理
            if (modal.dataset.inlineTocProcessed) return;
            modal.dataset.inlineTocProcessed = '1';

            // 提取目录项
            var items = modal.querySelectorAll('.css-46sm9v');
            if (items.length === 0) return;

            // 找到当前展开的文章卡片
            var expandedCard = document.querySelector('.SearchResult-Card .RichContent-inner:not(.is-collapsed)');
            if (!expandedCard) {
                // 备选：找展开的 ContentItem
                expandedCard = document.querySelector('.SearchResult-Card .ContentItem');
            }
            if (!expandedCard) return;

            // 找到文章正文区域
            var articleBody = expandedCard.querySelector('[itemprop="articleBody"]') ||
                              expandedCard.querySelector('.RichText') ||
                              expandedCard.querySelector('[id="content"]');
            if (!articleBody) return;

            // 检查是否已经注入过
            if (expandedCard.querySelector('.zhihu-inline-toc')) return;

            // 构建内联目录
            var tocDiv = document.createElement('div');
            tocDiv.className = 'zhihu-inline-toc';

            var tocTitle = document.createElement('div');
            tocTitle.className = 'zhihu-inline-toc-title';
            tocTitle.textContent = '目录';
            tocDiv.appendChild(tocTitle);

            items.forEach(function (item, index) {
                var textEl = item.querySelector('.css-1nna83t');
                if (!textEl) return;
                var text = textEl.textContent.trim();
                var link = document.createElement('a');
                link.className = 'zhihu-inline-toc-item';
                // 第一个是文章标题，标记为 h1 级别
                if (index === 0) {
                    link.className += ' is-h1';
                } else {
                    link.className += ' is-h2';
                }
                link.textContent = text;
                link.title = text;
                // 点击跳转到对应标题
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    var headings = articleBody.querySelectorAll('h1, h2, h3, h4');
                    // index 0 是文章标题本身，跳到第一个 h1
                    var targetIndex = index === 0 ? 0 : index - 1;
                    if (headings[targetIndex]) {
                        headings[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
                tocDiv.appendChild(link);
            });

            // 注入到文章正文开头
            articleBody.insertBefore(tocDiv, articleBody.firstChild);

            // 关闭原始 Modal（模拟点击遮罩层或关闭按钮）
            var backdrop = document.querySelector('.Modal-backdrop, .css-qxzzje');
            if (backdrop) {
                // 尝试找到关闭按钮
                var closeBtn = modal.querySelector('.Modal-closeButton, [aria-label="关闭"]');
                if (closeBtn) {
                    closeBtn.click();
                } else {
                    // 隐藏 Modal
                    modal.style.display = 'none';
                    // 隐藏遮罩层
                    var overlay = modal.previousElementSibling;
                    if (overlay && overlay.classList.contains('Modal-backdrop')) {
                        overlay.style.display = 'none';
                    }
                }
            }
        }

        // 监听 DOM 变化，检测目录 Modal 出现
        var tocObserver = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    var node = added[j];
                    if (node.nodeType !== 1) continue;
                    // 直接是 Modal 容器
                    if (node.querySelector && node.querySelector('.Modal-title')) {
                        handleTocModal(node);
                    }
                    // Modal 内部的子节点
                    if (node.classList && node.classList.contains('Modal-title')) {
                        handleTocModal(node.closest('.css-qxzzje') || node.parentElement);
                    }
                }
            }
        });

        if (document.body) {
            tocObserver.observe(document.body, { childList: true, subtree: true });
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                tocObserver.observe(document.body, { childList: true, subtree: true });
            });
        }
    })();

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