// ==UserScript==
// @name         知乎设置
// @namespace    http://tampermonkey.net/
// @version      7.0
// @description  知乎深色/浅色主题切换 + 多色彩主题预设 + 悬停预览 + AI 总结卡片移除
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

    // ====== 主题预设 ======
    var PRESETS = {
        'default': {
            name: '默认深色',
            swatches: ['#191b1f', '#212429', '#558eff', '#d4d4d8'],
            vars: {}
        },
        'dark-teal': {
            name: '深青绿',
            swatches: ['#111718', '#1f292a', '#65cc8c', '#d7e1de'],
            vars: {
                '--z-bg': '#111718',
                '--z-bg-panel': '#182122',
                '--z-bg-surface': '#1f292a',
                '--z-bg-toast': '#05090a',
                '--z-text-primary': '#d7e1de',
                '--z-text-body': '#c8d2cf',
                '--z-text-muted': '#9eaaa7',
                '--z-text-title': '#c8d5d0',
                '--z-border': '#334142',
                '--z-brand': '#65cc8c',
                '--z-brand-subtle': 'rgba(101,204,140,.12)',
                '--z-active': '#314143',
                '--z-img-brightness': '0.75',
                '--z-shadow': '0 0 0 1px rgba(0,0,0,.3),0 8px 24px rgba(0,0,0,.45)',
                '--z-comment-hl-0': 'rgba(101,204,140,.22)',
                '--z-comment-hl-60': 'rgba(31,41,42,.98)',
                '--z-comment-hl-100': '#1f292a',
                '--z-highlight-active': 'rgba(101,204,140,.12)'
            }
        }
    };

    var ALL_VAR_KEYS = [
        '--z-bg','--z-bg-panel','--z-bg-surface','--z-bg-toast',
        '--z-text-primary','--z-text-body','--z-text-muted','--z-text-title',
        '--z-border','--z-brand','--z-brand-subtle','--z-active',
        '--z-img-brightness','--z-shadow',
        '--z-comment-hl-0','--z-comment-hl-60','--z-comment-hl-100','--z-highlight-active'
    ];

    // ====== CSS 变量操作 ======
    function applyPreset(id) {
        var preset = PRESETS[id] || PRESETS['default'];
        var v = preset.vars;
        for (var i = 0; i < ALL_VAR_KEYS.length; i++) {
            if (v[ALL_VAR_KEYS[i]]) {
                root.style.setProperty(ALL_VAR_KEYS[i], v[ALL_VAR_KEYS[i]]);
            } else {
                root.style.removeProperty(ALL_VAR_KEYS[i]);
            }
        }
    }

    // ====== 主题切换 ======
    var PARAM = 'theme';
    var root = document.documentElement;
    var current = GM_getValue('theme', 'dark');

    function applyTheme(theme) {
        GM_setValue('theme', theme);
        document.cookie = 'theme=' + theme + '; Path=/; Domain=.zhihu.com; Max-Age=31536000; SameSite=Lax; Secure';
        root.setAttribute('data-theme', theme);

        if (theme === 'dark') {
            applyPreset(GM_getValue('colorPreset', 'default'));
        } else {
            applyPreset('default');
        }

        var url = new URL(location.href);
        var hint = url.searchParams.get(PARAM) || root.getAttribute('data-theme');
        if (hint !== theme) {
            url.searchParams.set(PARAM, theme);
            location.replace(url.href);
        }
    }

    // 油猴菜单入口
    GM_registerMenuCommand('打开设置面板', function () {
        var panel = document.getElementById('zhihu-settings-panel');
        if (panel) panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    });

    // 首次加载
    applyTheme(current);

    // ====== 深色模式补丁 CSS（使用 CSS 变量）======
    if (current === 'dark') {
        var s = document.createElement('style');
        s.id = 'zhihu-auto-dark-mode-style';
        s.textContent = [
            'html[data-theme="dark"]{color-scheme:dark;background:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"] body{color:var(--z-text-body,#a1a1aa)!important;background:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"] #root,html[data-theme="dark"] .App{background:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"]:where(.jumpThird-ad-tip,.Pc-feedAd-container--mobile,.Pc-feedAd-card-sign-popup,.Pc-feedAd-card-sign-popup-menu,.Pc-feedAd-card-content,.Pc-feedAd-new-card-content,.KfeCollection-CreateSaltCard,.KfeCollection-GoodsCardNew-wrapper,.KfeCollection-GoodsCardV2,.KfeCollection-PaidConsultCard-CardWrapper,.KfeCollection-PcCollegeCard-root,.KfeCollection-PcSaltBrandCard,.KfeCollection-PayModal-wrapper,.TooltipContent--white){background-color:var(--z-bg,#191b1f)!important;border-color:var(--z-border,#282b30)!important;color:var(--z-text-body,#c2c6cf)!important}',
            'html[data-theme="dark"]:where(.Pc-feedAd-card-title,.Pc-feedAd-new-title){color:var(--z-text-primary,#d4d4d8)!important}',
            'html[data-theme="dark"].KfeCollection-components-Toast{background-color:var(--z-bg-toast,#000)!important;color:var(--z-text-body,#c2c6cf)!important}',
            'html[data-theme="dark"]:where(.NavigateToAppCheckCard-mask,.KfeCollection-TextLink-mask,.KfeCollection-PurchaseBtn-mask){background:linear-gradient(180deg,transparent,var(--z-bg,#191b1f))!important}',
            'html[data-theme="dark"].TooltipContent--white .TooltipContent-arrow::after{background-color:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"].SignContainer-content input:-webkit-autofill{-webkit-text-fill-color:var(--z-text-body,#c2c6cf)!important;-webkit-box-shadow:inset 0 0 0 1000px var(--z-bg-surface,#212429)!important}',
            'html[data-theme="dark"]:where(.ModalWrap-itemBtn,.SearchSubTabs-item,.DraftHistory-revert,.Pc-feedAd-link-btn):is(:hover,:focus-visible,.is-active){color:var(--z-brand,#558eff)!important}',
            'html[data-theme="dark"]:where(.SearchTabs-customFilter .tag-selected,.highlight-wrap-checking){background-color:var(--z-brand-subtle,rgba(85,142,255,.1))!important}',
            'html[data-theme="dark"]:where(.AnswerForm-fullscreenBackdrop,.ImageView.is-active,.ImageGallery.is-active){background-color:rgba(0,0,0,.65)!important}',
            'html[data-theme="dark"] .AppHeader{background-color:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"] .AppHeader a.is-active,html[data-theme="dark"] .AppHeader .css-c5jmln{color:var(--z-brand,#558eff)!important}',
            'html[data-theme="dark"] .AppHeader .Input{background-color:var(--z-bg-surface,#212429)!important;color:var(--z-text-primary,#d4d4d8)!important}',
            'html[data-theme="dark"] .AppHeader .Input::placeholder{color:var(--z-text-muted,#888d96)!important}',
            'html[data-theme="dark"] .css-427st7,html[data-theme="dark"] .css-1caetj6{color:var(--z-text-body,#c2c6cf)!important}',
            'html[data-theme="dark"] .css-427st7.is-active,html[data-theme="dark"] .css-1caetj6.is-active{color:var(--z-text-primary,#d4d4d8)!important}',
            'html[data-theme="dark"] .css-427st7:hover,html[data-theme="dark"] .css-1caetj6:hover{color:var(--z-text-primary,#d4d4d8)!important}',
            'html[data-theme="dark"] .css-va72p6{color:var(--z-text-primary,#d4d4d8)!important}',
            'html[data-theme="dark"] .css-10u695f{color:var(--z-text-primary,#d4d4d8)!important}',
            'html[data-theme="dark"] .css-r4op92{color:var(--z-text-primary,#d4d4d8)!important}',
            'html[data-theme="dark"] .Comments-container{color:var(--z-text-body,#c2c6cf)!important}',
            'html[data-theme="dark"] .Comments-container .CommentContent{color:var(--z-text-body,#c2c6cf)!important}',
            'html[data-theme="dark"] .Comments-container a[href*="/people/"]:not(:has(img)){color:var(--z-text-primary,#d4d4d8)!important}',
            'html[data-theme="dark"] .Comments-container .Modal-content{background-color:var(--z-bg-surface,#212429)!important;color:var(--z-text-body,#c2c6cf)!important;border:1px solid rgba(85,142,255,.10)!important;box-shadow:var(--z-shadow,0 0 0 1px rgba(0,0,0,.12),0 10px 28px rgba(0,0,0,.26))!important}',
            'html[data-theme="dark"] .Comments-container .Modal-content > div{background-color:transparent!important}',
            'html[data-theme="dark"] .RichText code{background-color:var(--z-bg-surface,#212429)!important;color:var(--z-text-body,#c2c6cf)!important;border-color:var(--z-border,#282b30)!important}',
            'html[data-theme="dark"] .RichText pre{background-color:var(--z-bg-surface,#212429)!important;color:var(--z-text-body,#c2c6cf)!important;border-color:var(--z-border,#282b30)!important}',
            'html[data-theme="dark"] .RichText pre code{background-color:transparent!important;border:none!important}',
            'html[data-theme="dark"] .css-1ptadse{color:var(--z-text-muted,#888d96)!important;background-color:var(--z-bg,#191b1f)!important;border-color:var(--z-border,#282b30)!important}',
            'html[data-theme="dark"] .css-1e7fksk{background-color:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"] .css-8axkqi{background-color:var(--z-bg,#191b1f)!important;border-color:var(--z-border,#282b30)!important}',
            'html[data-theme="dark"] .css-127i0sx{background-color:var(--z-bg,#191b1f)!important;border:1px solid rgba(255,255,255,.06)!important}',
            'html[data-theme="dark"] .css-9511cm,html[data-theme="dark"] .css-dilx2p,html[data-theme="dark"] .css-11oa45q,html[data-theme="dark"] .css-2sopzd,html[data-theme="dark"] .css-44kk6u,html[data-theme="dark"] .css-1pariuy{background-color:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"] .css-9511cm,html[data-theme="dark"] .css-dilx2p,html[data-theme="dark"] .css-11oa45q,html[data-theme="dark"] .Card,html[data-theme="dark"] .css-12tmx22{border:1px solid rgba(255,255,255,.06)!important}',
            'html[data-theme="dark"] .Comments-container .css-13445jb,html[data-theme="dark"] .Modal-content .css-13445jb{background-color:var(--z-bg-surface,#212429)!important;color:var(--z-text-body,#c2c6cf)!important;border-color:rgba(85,142,255,.18)!important;box-shadow:inset 0 0 0 1px rgba(85,142,255,.08)!important;animation:zhihu-dark-comment-highlight 1s linear forwards!important}',
            '@keyframes zhihu-dark-comment-highlight{0%{background-color:var(--z-comment-hl-0,rgba(85,142,255,.18));box-shadow:inset 0 0 0 1px rgba(85,142,255,.28),0 0 0 1px rgba(85,142,255,.08)}60%{background-color:var(--z-comment-hl-60,rgba(33,36,41,.98));box-shadow:inset 0 0 0 1px rgba(85,142,255,.18),0 0 0 1px rgba(0,0,0,.08)}100%{background-color:var(--z-comment-hl-100,var(--z-bg-surface,#212429));box-shadow:inset 0 0 0 1px rgba(85,142,255,.10),0 0 0 1px rgba(0,0,0,.14)}}',
            'html[data-theme="dark"] .ContentItem-actions .VoteButton{color:var(--z-text-body,#c2c6cf)!important;background-color:transparent!important;border-color:var(--z-border,#282b30)!important}',
            'html[data-theme="dark"] .ContentItem-actions .VoteButton:hover{color:var(--z-brand,#558eff)!important}',
            'html[data-theme="dark"] .ContentItem-actions .ContentItem-action{color:var(--z-text-muted,#888d96)!important}',
            'html[data-theme="dark"] .ContentItem-actions .ContentItem-action:hover{color:var(--z-text-primary,#d4d4d8)!important}',
            'html[data-theme="dark"] img{filter:brightness(var(--z-img-brightness,0.5))!important}',
            'html[data-theme="dark"] .ContentItem-title{color:var(--z-text-title,#c0c0c8)!important}',
            'html[data-theme="dark"] .SearchBar{contain:layout!important}',
            'html[data-theme="dark"] .SearchBar-menu{width:100%!important}',
            'html[data-theme="dark"] .skeleton,html[data-theme="dark"] .skeleton--t02,html[data-theme="dark"] .skeleton--ease-in,html[data-theme="dark"] .css-hguyb0{background:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"] .skeleton__line,html[data-theme="dark"] .skeleton__line--t02,html[data-theme="dark"] .css-ay5346{background:var(--z-bg-surface,#212429)!important}',
            'html[data-theme="dark"] .css-dp2cjg{background:var(--z-bg,#191b1f)!important}'
        ].join('\n');
        (document.head || root).appendChild(s);
    }

    // 防止知乎 SPA 导航覆盖主题 + 色彩主题
    new MutationObserver(function () {
        var t = GM_getValue('theme', 'dark');
        if (root.getAttribute('data-theme') !== t) root.setAttribute('data-theme', t);
        if (t === 'dark') applyPreset(GM_getValue('colorPreset', 'default'));
    }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    // ====== 移除 AI 总结卡片 ======
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

    // ====== 设置面板 ======
    (function initPanel() {
        var setup = function () {
            // 注入面板样式
            var ps = document.createElement('style');
            ps.id = 'zhihu-settings-panel-style';
            ps.textContent = [
                '#zhihu-settings-toggle{position:fixed;bottom:24px;right:24px;z-index:10001;width:44px;height:44px;border-radius:50%;background:rgba(24,33,34,.92);border:1px solid #334142;color:#9eaaa7;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;box-shadow:0 2px 12px rgba(0,0,0,.4)}',
                '#zhihu-settings-toggle:hover{background:rgba(31,41,42,.95);color:#65cc8c;border-color:#65cc8c;transform:scale(1.08)}',
                '#zhihu-settings-panel{display:none;position:fixed;bottom:80px;right:24px;z-index:10000;width:260px;background:rgba(24,33,34,.96);border:1px solid #334142;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.5);flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}',
                '#zhihu-settings-panel .zh-sp-header{padding:14px 16px 10px;font-size:14px;font-weight:600;color:#d7e1de;letter-spacing:.3px}',
                '#zhihu-settings-panel .zh-sp-divider{height:1px;background:#334142;margin:0 16px}',
                '#zhihu-settings-panel .zh-sp-row{display:flex;align-items:center;justify-content:space-between;padding:12px 16px}',
                '#zhihu-settings-panel .zh-sp-label{font-size:13px;color:#c8d2cf}',
                '#zhihu-settings-panel .zh-sp-toggle{position:relative;width:42px;height:24px;border-radius:12px;background:#334142;cursor:pointer;transition:background .25s;flex-shrink:0;-webkit-appearance:none;appearance:none;border:none;outline:none}',
                '#zhihu-settings-panel .zh-sp-toggle::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#879693;transition:all .25s}',
                '#zhihu-settings-panel .zh-sp-toggle.on{background:#2a3637}',
                '#zhihu-settings-panel .zh-sp-toggle.on::after{left:21px;background:#65cc8c}',
                '#zhihu-settings-panel .zh-sp-section-label{padding:10px 16px 6px;font-size:12px;color:#7f8f8b;text-transform:uppercase;letter-spacing:.5px}',
                '#zhihu-settings-panel .zh-sp-theme{display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;transition:background .15s;border:2px solid transparent;margin:2px 8px;border-radius:8px}',
                '#zhihu-settings-panel .zh-sp-theme:hover{background:rgba(42,54,55,.5)}',
                '#zhihu-settings-panel .zh-sp-theme.selected{border-color:#65cc8c;background:rgba(42,54,55,.4)}',
                '#zhihu-settings-panel .zh-sp-theme-name{font-size:13px;color:#c8d2cf;flex:1}',
                '#zhihu-settings-panel .zh-sp-theme-swatches{display:flex;gap:3px}',
                '#zhihu-settings-panel .zh-sp-theme-swatch{width:18px;height:18px;border-radius:4px;border:1px solid rgba(255,255,255,.1)}'
            ].join('\n');
            document.head.appendChild(ps);

            // 注入面板 HTML
            var panel = document.createElement('div');
            panel.id = 'zhihu-settings-panel';

            // 构建主题选项 HTML
            var themeOptionsHtml = '';
            var ids = Object.keys(PRESETS);
            for (var i = 0; i < ids.length; i++) {
                var p = PRESETS[ids[i]];
                var swHtml = '';
                for (var j = 0; j < p.swatches.length; j++) {
                    swHtml += '<span class="zh-sp-theme-swatch" style="background:' + p.swatches[j] + '"></span>';
                }
                themeOptionsHtml += '<div class="zh-sp-theme" data-preset="' + ids[i] + '">' +
                    '<span class="zh-sp-theme-name">' + p.name + '</span>' +
                    '<span class="zh-sp-theme-swatches">' + swHtml + '</span></div>';
            }

            var isDark = GM_getValue('theme', 'dark') === 'dark';

            panel.innerHTML =
                '<div class="zh-sp-header">知乎设置</div>' +
                '<div class="zh-sp-divider"></div>' +
                '<div class="zh-sp-row"><span class="zh-sp-label">深色模式</span><button class="zh-sp-toggle' + (isDark ? ' on' : '') + '" id="zh-dark-toggle"></button></div>' +
                '<div class="zh-sp-divider"></div>' +
                '<div class="zh-sp-section-label">色彩主题</div>' +
                themeOptionsHtml +
                '<div style="height:8px"></div>';

            document.body.appendChild(panel);

            // 设置按钮
            var btn = document.createElement('button');
            btn.id = 'zhihu-settings-toggle';
            btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>';
            document.body.appendChild(btn);

            // 更新主题选中状态
            function updateSelection() {
                var themes = panel.querySelectorAll('.zh-sp-theme');
                var sp = GM_getValue('colorPreset', 'default');
                for (var k = 0; k < themes.length; k++) {
                    if (themes[k].getAttribute('data-preset') === sp) {
                        themes[k].classList.add('selected');
                    } else {
                        themes[k].classList.remove('selected');
                    }
                }
            }
            updateSelection();

            // 打开/关闭面板
            btn.addEventListener('click', function () {
                panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
            });

            // 点击面板外部关闭
            document.addEventListener('click', function (e) {
                if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
                    panel.style.display = 'none';
                }
            });

            // 深色/浅色切换
            var toggle = document.getElementById('zh-dark-toggle');
            toggle.addEventListener('click', function () {
                var newTheme = GM_getValue('theme', 'dark') === 'dark' ? 'light' : 'dark';
                toggle.classList.toggle('on', newTheme === 'dark');
                applyTheme(newTheme);
            });

            // 主题悬停预览 + 点击应用
            var themes = panel.querySelectorAll('.zh-sp-theme');
            for (var m = 0; m < themes.length; m++) {
                (function (el) {
                    el.addEventListener('mouseenter', function () {
                        applyPreset(el.getAttribute('data-preset'));
                    });
                    el.addEventListener('mouseleave', function () {
                        if (GM_getValue('theme', 'dark') === 'dark') {
                            applyPreset(GM_getValue('colorPreset', 'default'));
                        } else {
                            applyPreset('default');
                        }
                    });
                    el.addEventListener('click', function () {
                        var id = el.getAttribute('data-preset');
                        GM_setValue('colorPreset', id);
                        // 确保深色模式
                        if (GM_getValue('theme', 'dark') !== 'dark') {
                            toggle.classList.add('on');
                            applyTheme('dark');
                        }
                        applyPreset(id);
                        updateSelection();
                    });
                })(themes[m]);
            }
        };

        if (document.body) setup();
        else document.addEventListener('DOMContentLoaded', setup);
    })();

})();
