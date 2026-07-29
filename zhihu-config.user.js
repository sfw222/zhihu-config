// ==UserScript==
// @name         知乎设置
// @namespace    http://tampermonkey.net/
// @version      5.7
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



    // 深色模式补丁 CSS
    if (current === 'dark') {
        const s = document.createElement('style');
        s.id = 'zhihu-auto-dark-mode-style';
        s.textContent = `
            html[data-theme="dark"]{color-scheme:dark;background:#191b1f!important}
            html[data-theme="dark"] body{color:#d4d4d8!important;background:#191b1f!important}
            html[data-theme="dark"] #root,html[data-theme="dark"] .App{background:#191b1f!important}
            html[data-theme="dark"]:where(.jumpThird-ad-tip,.Pc-feedAd-container--mobile,.Pc-feedAd-card-sign-popup,.Pc-feedAd-card-sign-popup-menu,.Pc-feedAd-card-content,.Pc-feedAd-new-card-content,.KfeCollection-CreateSaltCard,.KfeCollection-GoodsCardNew-wrapper,.KfeCollection-GoodsCardV2,.KfeCollection-PaidConsultCard-CardWrapper,.KfeCollection-PcCollegeCard-root,.KfeCollection-PcSaltBrandCard,.KfeCollection-PayModal-wrapper,.TooltipContent--white){background-color:var(--GBK99A,#191b1f)!important;border-color:var(--GBK09A,#282b30)!important;color:var(--GBK03A,#c2c6cf)!important}
            html[data-theme="dark"]:where(.Pc-feedAd-card-title,.Pc-feedAd-new-title){color:#d4d4d8!important}
            html[data-theme="dark"].KfeCollection-components-Toast{background-color:var(--GBK10C,#000)!important;color:var(--GBK03A,#c2c6cf)!important}
            html[data-theme="dark"]:where(.NavigateToAppCheckCard-mask,.KfeCollection-TextLink-mask,.KfeCollection-PurchaseBtn-mask){background:linear-gradient(180deg,transparent,var(--GBK99A,#191b1f))!important}
            html[data-theme="dark"].TooltipContent--white .TooltipContent-arrow::after{background-color:var(--GBK99A,#191b1f)!important}
            html[data-theme="dark"].SignContainer-content input:-webkit-autofill{-webkit-text-fill-color:var(--GBK03A,#c2c6cf)!important;-webkit-box-shadow:inset 0 0 0 1000px var(--GBK10A,#212429)!important}
            html[data-theme="dark"]:where(.ModalWrap-itemBtn,.SearchSubTabs-item,.DraftHistory-revert,.Pc-feedAd-link-btn):is(:hover,:focus-visible,.is-active){color:var(--GBL01A,#558eff)!important}
            html[data-theme="dark"]:where(.SearchTabs-customFilter .tag-selected,.highlight-wrap-checking){background-color:rgba(85,142,255,.1)!important}
            html[data-theme="dark"]:where(.AnswerForm-fullscreenBackdrop,.ImageView.is-active,.ImageGallery.is-active){background-color:rgba(0,0,0,.65)!important}
            html[data-theme="dark"] .AppHeader{background-color:var(--GBK99A,#191b1f)!important}
            html[data-theme="dark"] .AppHeader a.is-active,html[data-theme="dark"] .AppHeader .css-c5jmln{color:var(--GBL01A,#558eff)!important}
            html[data-theme="dark"] .AppHeader .Input{background-color:var(--GBK10A,#212429)!important;color:#d4d4d8!important}
            html[data-theme="dark"] .AppHeader .Input::placeholder{color:var(--GBK05A,#888d96)!important}
            html[data-theme="dark"] .css-427st7,html[data-theme="dark"] .css-1caetj6{color:var(--GBK03A,#c2c6cf)!important}
            html[data-theme="dark"] .css-427st7.is-active,html[data-theme="dark"] .css-1caetj6.is-active{color:#d4d4d8!important}
            html[data-theme="dark"] .css-427st7:hover,html[data-theme="dark"] .css-1caetj6:hover{color:#d4d4d8!important}
            html[data-theme="dark"] .css-va72p6{color:#d4d4d8!important}
            html[data-theme="dark"] .css-10u695f{color:#d4d4d8!important}
            html[data-theme="dark"] .css-r4op92{color:#d4d4d8!important}
            html[data-theme="dark"] .Comments-container{color:var(--GBK03A,#c2c6cf)!important}
            html[data-theme="dark"] .Comments-container .CommentContent{color:var(--GBK03A,#c2c6cf)!important}
            html[data-theme="dark"] .Comments-container a[href*="/people/"]:not(:has(img)){color:#d4d4d8!important}
            html[data-theme="dark"] .Comments-container .Modal-content{
                background-color:var(--GBK10A,#212429)!important;
                color:var(--GBK03A,#c2c6cf)!important;
                border:1px solid rgba(85,142,255,.10)!important;
                box-shadow:0 0 0 1px rgba(0,0,0,.12),0 10px 28px rgba(0,0,0,.26)!important;
            }
            html[data-theme="dark"] .Comments-container .Modal-content > div{
                background-color:transparent!important;
            }
            html[data-theme="dark"] .RichText code{background-color:var(--GBK10A,#212429)!important;color:var(--GBK03A,#c2c6cf)!important;border-color:var(--GBK09A,#282b30)!important}
            html[data-theme="dark"] .RichText pre{background-color:var(--GBK10A,#212429)!important;color:var(--GBK03A,#c2c6cf)!important;border-color:var(--GBK09A,#282b30)!important}
            html[data-theme="dark"] .RichText pre code{background-color:transparent!important;border:none!important}
            html[data-theme="dark"] .css-1ptadse{color:var(--GBK05A,#888d96)!important;background-color:var(--GBK99A,#191b1f)!important;border-color:var(--GBK09A,#282b30)!important}
            html[data-theme="dark"] .css-1e7fksk{background-color:var(--GBK99A,#191b1f)!important}
            html[data-theme="dark"] .css-8axkqi{background-color:#191b1f!important;border-color:var(--GBK09A,#282b30)!important}
            html[data-theme="dark"] .css-1rd6ukm{background-color:#191b1f!important}
            html[data-theme="dark"] .css-f9tv5t{background-color:#191b1f!important}
            html[data-theme="dark"] .css-mk7s6o{background-color:#191b1f!important}
            html[data-theme="dark"] .css-127i0sx{background-color:#191b1f!important}
            html[data-theme="dark"] .css-3ibr72{background-color:#191b1f!important}
            html[data-theme="dark"] .css-9511cm,html[data-theme="dark"] .css-dilx2p,html[data-theme="dark"] .css-11oa45q,html[data-theme="dark"] .css-2sopzd,html[data-theme="dark"] .css-44kk6u,html[data-theme="dark"] .css-1pariuy{background-color:#191b1f!important}
            html[data-theme="dark"] .css-9511cm,html[data-theme="dark"] .css-dilx2p,html[data-theme="dark"] .css-11oa45q,html[data-theme="dark"] .Card,html[data-theme="dark"] .css-12tmx22{border:1px solid rgba(255,255,255,.06)!important}
            html[data-theme="dark"] .Comments-container .css-13445jb,
            html[data-theme="dark"] .Modal-content .css-13445jb{
                background-color:var(--GBK10A,#212429)!important;
                color:var(--GBK03A,#c2c6cf)!important;
                border-color:rgba(85,142,255,.18)!important;
                box-shadow:inset 0 0 0 1px rgba(85,142,255,.08)!important;
                animation:zhihu-dark-comment-highlight 1s linear forwards!important;
            }
            @keyframes zhihu-dark-comment-highlight{
                0%{
                    background-color:rgba(85,142,255,.18);
                    box-shadow:inset 0 0 0 1px rgba(85,142,255,.28),0 0 0 1px rgba(85,142,255,.08);
                }
                60%{
                    background-color:rgba(33,36,41,.98);
                    box-shadow:inset 0 0 0 1px rgba(85,142,255,.18),0 0 0 1px rgba(0,0,0,.08);
                }
                100%{
                    background-color:var(--GBK10A,#212429);
                    box-shadow:inset 0 0 0 1px rgba(85,142,255,.10),0 0 0 1px rgba(0,0,0,.14);
                }
            }
            html[data-theme="dark"] .ContentItem-actions .VoteButton{color:var(--GBK03A,#c2c6cf)!important;background-color:transparent!important;border-color:var(--GBK09A,#282b30)!important}
            html[data-theme="dark"] .ContentItem-actions .VoteButton:hover{color:var(--GBL01A,#558eff)!important}
            html[data-theme="dark"] .ContentItem-actions .ContentItem-action{color:var(--GBK05A,#888d96)!important}
            html[data-theme="dark"] .ContentItem-actions .ContentItem-action:hover{color:#d4d4d8!important}
            html[data-theme="dark"] img{filter:brightness(0.5)!important}
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
