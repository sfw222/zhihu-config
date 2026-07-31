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
                '--z-bg-panel-soft': '#1b2526',
                '--z-bg-surface': '#1f292a',
                '--z-bg-surface-raised': '#243132',
                '--z-bg-surface-hover': '#2a3637',
                '--z-bg-surface-muted': '#263233',
                '--z-bg-toast': '#05090a',
                '--z-text-primary': '#d7e1de',
                '--z-text-on-primary': '#dce5e2',
                '--z-text-body': '#c8d2cf',
                '--z-text-muted': '#9eaaa7',
                '--z-text-soft': '#879693',
                '--z-text-placeholder': '#7f8f8b',
                '--z-text-title': '#c8d5d0',
                '--z-border': '#334142',
                '--z-border-subtle': '#263334',
                '--z-border-muted': 'rgba(154,170,166,.22)',
                '--z-border-soft': 'rgba(154,170,166,.14)',
                '--z-brand': '#65cc8c',
                '--z-brand-subtle': 'rgba(101,204,140,.12)',
                '--z-active': '#314143',
                '--z-img-brightness': '0.75',
                '--z-shadow': '0 0 0 1px rgba(0,0,0,.3),0 8px 24px rgba(0,0,0,.45)',
                '--z-shadow-surface': '0 14px 38px rgba(0,0,0,.18)',
                '--z-shadow-control': '0 10px 24px rgba(0,0,0,.16)',
                '--z-shadow-floating': '0 28px 80px rgba(0,0,0,.38)',
                '--z-overlay': 'rgba(5,9,10,.58)',
                '--z-logo-lens-bg': '#17211e',
                '--z-success-bg': 'rgba(69,191,120,.13)',
                '--z-success-text': '#77d59c',
                '--z-warning-bg': 'rgba(217,154,43,.14)',
                '--z-warning-text': '#e8c783',
                '--z-info-bg': 'rgba(100,158,203,.14)',
                '--z-info-text': '#96bfdc',
                '--z-danger-bg': 'rgba(217,87,69,.13)',
                '--z-danger-text': '#e99a8d',
                '--z-comment-hl-0': 'rgba(101,204,140,.22)',
                '--z-comment-hl-60': 'rgba(31,41,42,.98)',
                '--z-comment-hl-100': '#1f292a',
                '--z-highlight-active': 'rgba(101,204,140,.12)'
            }
        }
    };

    var ALL_VAR_KEYS = [
        '--z-bg','--z-bg-panel','--z-bg-panel-soft','--z-bg-surface','--z-bg-surface-raised','--z-bg-surface-hover','--z-bg-surface-muted','--z-bg-toast',
        '--z-text-primary','--z-text-on-primary','--z-text-body','--z-text-muted','--z-text-soft','--z-text-placeholder','--z-text-title',
        '--z-border','--z-border-subtle','--z-border-muted','--z-border-soft',
        '--z-brand','--z-brand-subtle','--z-active',
        '--z-img-brightness','--z-shadow','--z-shadow-surface','--z-shadow-control','--z-shadow-floating',
        '--z-overlay','--z-logo-lens-bg',
        '--z-success-bg','--z-success-text','--z-warning-bg','--z-warning-text',
        '--z-info-bg','--z-info-text','--z-danger-bg','--z-danger-text',
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
            /* ---- 色彩变量注入 ---- */
            'html[data-theme="dark"]{',
            '  color-scheme:dark;',
            '  --color-page:var(--z-bg,#111718);',
            '  --color-page-translucent:color-mix(in srgb,var(--z-bg,#111718) 95%,transparent);',
            '  --color-panel:var(--z-bg-panel,#182122);',
            '  --color-panel-soft:var(--z-bg-panel-soft,#1b2526);',
            '  --color-surface:var(--z-bg-surface,#1f292a);',
            '  --color-surface-raised:var(--z-bg-surface-raised,#243132);',
            '  --color-surface-hover:var(--z-bg-surface-hover,#2a3637);',
            '  --color-surface-muted:var(--z-bg-surface-muted,#263233);',
            '  --color-surface-selected:var(--z-active,#314143);',
            '  --color-text-primary:var(--z-text-primary,#d7e1de);',
            '  --color-text-body:var(--z-text-body,#c8d2cf);',
            '  --color-text-muted:var(--z-text-muted,#9eaaa7);',
            '  --color-text-soft:var(--z-text-soft,#879693);',
            '  --color-text-placeholder:var(--z-text-placeholder,#7f8f8b);',
            '  --color-text-on-primary:var(--z-text-on-primary,#dce5e2);',
            '  --color-border:var(--z-border,#334142);',
            '  --color-border-subtle:var(--z-border-subtle,#263334);',
            '  --color-border-muted:var(--z-border-muted,#9aaaa638);',
            '  --color-border-soft:var(--z-border-soft,#9aaaa624);',
            '  --color-primary:var(--z-bg-surface,#243132);',
            '  --color-primary-strong:var(--z-bg-surface-raised,#2c3a3b);',
            '  --color-primary-hover:var(--z-active,#314143);',
            '  --color-brand:var(--z-brand,#65cc8c);',
            '  --color-success-bg:var(--z-success-bg,#45bf7821);',
            '  --color-success-text:var(--z-success-text,#77d59c);',
            '  --color-warning-bg:var(--z-warning-bg,#d99a2b24);',
            '  --color-warning-text:var(--z-warning-text,#e8c783);',
            '  --color-info-bg:var(--z-info-bg,#649ecb24);',
            '  --color-info-text:var(--z-info-text,#96bfdc);',
            '  --color-danger-bg:var(--z-danger-bg,#d9574521);',
            '  --color-danger-text:var(--z-danger-text,#e99a8d);',
            '  --color-overlay:var(--z-overlay,#05090a94);',
            '  --color-logo-lens-bg:var(--z-logo-lens-bg,#17211e);',
            '  --shadow-surface:var(--z-shadow-surface,0 14px 38px #0000002e);',
            '  --shadow-control:var(--z-shadow-control,0 10px 24px #00000029);',
            '  --shadow-floating:var(--z-shadow-floating,0 28px 80px #00000061);',
            '  --background:var(--color-page);',
            '  --foreground:var(--color-text-body);',
            '}',
            /* ---- 基础覆盖 ---- */
            'html[data-theme="dark"]{color-scheme:dark;background:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"] body{color:var(--z-text-body,#a1a1aa)!important;background:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"] #root,html[data-theme="dark"] .App{background:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"]:where(.jumpThird-ad-tip,.Pc-feedAd-container--mobile,.Pc-feedAd-card-sign-popup,.Pc-feedAd-card-sign-popup-menu,.Pc-feedAd-card-content,.Pc-feedAd-new-card-content,.KfeCollection-CreateSaltCard,.KfeCollection-GoodsCardNew-wrapper,.KfeCollection-GoodsCardV2,.KfeCollection-PaidConsultCard-CardWrapper,.KfeCollection-PcCollegeCard-root,.KfeCollection-PcSaltBrandCard,.KfeCollection-PayModal-wrapper,.TooltipContent--white){background-color:var(--z-bg,#191b1f)!important;border-color:var(--z-border,#282b30)!important;color:var(--z-text-body,#c2c6cf)!important}',
            'html[data-theme="dark"]:where(.Pc-feedAd-card-title,.Pc-feedAd-new-title){color:var(--z-text-primary,#d4d4d8)!important}',
            'html[data-theme="dark"].KfeCollection-components-Toast{background-color:var(--z-bg-toast,#000)!important;color:var(--z-text-body,#c2c6cf)!important}',
            'html[data-theme="dark"]:where(.NavigateToAppCheckCard-mask,.KfeCollection-TextLink-mask,.KfeCollection-PurchaseBtn-mask){background:linear-gradient(180deg,transparent,var(--z-bg,#191b1f))!important}',
            'html[data-theme="dark"].TooltipContent--white .TooltipContent-arrow::after{background-color:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"].SignContainer-content input:-webkit-autofill{-webkit-text-fill-color:var(--z-text-body,#c2c6cf)!important;-webkit-box-shadow:inset 0 0 0 1000px var(--z-bg-surface-raised,#212429)!important}',
            'html[data-theme="dark"]:where(.ModalWrap-itemBtn,.SearchSubTabs-item,.DraftHistory-revert,.Pc-feedAd-link-btn):is(:hover,:focus-visible,.is-active){color:var(--z-brand,#558eff)!important}',
            'html[data-theme="dark"]:where(.SearchTabs-customFilter .tag-selected,.highlight-wrap-checking){background-color:var(--z-brand-subtle,rgba(85,142,255,.1))!important}',
            'html[data-theme="dark"]:where(.AnswerForm-fullscreenBackdrop,.ImageView.is-active,.ImageGallery.is-active){background-color:var(--z-overlay,rgba(0,0,0,.65))!important}',
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
            'html[data-theme="dark"] .Comments-container .Modal-content{background-color:var(--z-bg-surface,#212429)!important;color:var(--z-text-body,#c2c6cf)!important;border:1px solid var(--z-border-muted,rgba(85,142,255,.10))!important;box-shadow:var(--z-shadow-floating,0 0 0 1px rgba(0,0,0,.12),0 10px 28px rgba(0,0,0,.26))!important}',
            'html[data-theme="dark"] .Comments-container .Modal-content > div{background-color:transparent!important}',
            'html[data-theme="dark"] .RichText code{background-color:var(--z-bg-surface,#212429)!important;color:var(--z-text-body,#c2c6cf)!important;border-color:var(--z-border,#282b30)!important}',
            'html[data-theme="dark"] .RichText pre{background-color:var(--z-bg-surface,#212429)!important;color:var(--z-text-body,#c2c6cf)!important;border-color:var(--z-border,#282b30)!important}',
            'html[data-theme="dark"] .RichText pre code{background-color:transparent!important;border:none!important}',
            'html[data-theme="dark"] .css-1ptadse{color:var(--z-text-muted,#888d96)!important;background-color:var(--z-bg,#191b1f)!important;border-color:var(--z-border,#282b30)!important}',
            'html[data-theme="dark"] .css-1e7fksk{background-color:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"] .css-8axkqi{background-color:var(--z-bg,#191b1f)!important;border-color:var(--z-border,#282b30)!important}',
            'html[data-theme="dark"] .css-127i0sx{background-color:var(--z-bg,#191b1f)!important;border:1px solid var(--z-border-soft,rgba(255,255,255,.06))!important}',
            'html[data-theme="dark"] .css-9511cm,html[data-theme="dark"] .css-dilx2p,html[data-theme="dark"] .css-11oa45q,html[data-theme="dark"] .css-2sopzd,html[data-theme="dark"] .css-44kk6u,html[data-theme="dark"] .css-1pariuy{background-color:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"] .css-9511cm,html[data-theme="dark"] .css-dilx2p,html[data-theme="dark"] .css-11oa45q,html[data-theme="dark"] .Card,html[data-theme="dark"] .css-12tmx22{border:1px solid var(--z-border-soft,rgba(255,255,255,.06))!important}',
            'html[data-theme="dark"] .Comments-container .css-13445jb,html[data-theme="dark"] .Modal-content .css-13445jb{background-color:var(--z-bg-surface,#212429)!important;color:var(--z-text-body,#c2c6cf)!important;border-color:var(--z-border-muted,rgba(85,142,255,.18))!important;box-shadow:inset 0 0 0 1px var(--z-border-soft,rgba(85,142,255,.08))!important;animation:zhihu-dark-comment-highlight 1s linear forwards!important}',
            '@keyframes zhihu-dark-comment-highlight{0%{background-color:var(--z-comment-hl-0,rgba(85,142,255,.18));box-shadow:inset 0 0 0 1px var(--z-brand-subtle,rgba(85,142,255,.28)),0 0 0 1px var(--z-border-soft,rgba(85,142,255,.08))}60%{background-color:var(--z-comment-hl-60,rgba(33,36,41,.98));box-shadow:inset 0 0 0 1px var(--z-border-muted,rgba(85,142,255,.18)),0 0 0 1px rgba(0,0,0,.08)}100%{background-color:var(--z-comment-hl-100,var(--z-bg-surface,#212429));box-shadow:inset 0 0 0 1px var(--z-border-soft,rgba(85,142,255,.10)),0 0 0 1px rgba(0,0,0,.14)}}',
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
            'html[data-theme="dark"] .css-dp2cjg{background:var(--z-bg,#191b1f)!important}',
            /* ---- 泄漏色修复 ---- */
            'html[data-theme="dark"] .TopstoryItem,html[data-theme="dark"] .WriteArea,html[data-theme="dark"] .HotSearchCard,html[data-theme="dark"] .KfeCollection-CreateSaltCard,html[data-theme="dark"] .Pc-card,html[data-theme="dark"] .CreatorEntrance,html[data-theme="dark"] .Card{background-color:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"] .TopstoryItem,html[data-theme="dark"] .HotSearchCard,html[data-theme="dark"] .Card,html[data-theme="dark"] .Pc-card{border-color:var(--z-border,#9aaaa6)!important}',
            'html[data-theme="dark"] .SearchBar-searchButton,html[data-theme="dark"] .AppHeader-profileEntry,html[data-theme="dark"] .Sticky button,html[data-theme="dark"] .Notifications-icon,html[data-theme="dark"] .css-f8uegh{color:var(--z-text-soft,#929aab)!important;border-color:var(--z-text-soft,#929aab)!important}',
            'html[data-theme="dark"] .ContentItem-more,html[data-theme="dark"] .ContentItem-more svg{color:var(--z-text-muted,#5271b0)!important;border-color:var(--z-text-muted,#5271b0)!important}',
            'html[data-theme="dark"] a.AppHeader-profileAvatar,html[data-theme="dark"] a.AppHeader-profileAvatar img,html[data-theme="dark"] a.external{background-color:var(--z-bg-surface-raised,#09408e)!important}',
            'html[data-theme="dark"] .ProfileSideCreator,html[data-theme="dark"] footer,html[data-theme="dark"] .GlobalSideBar-footer{color:var(--z-text-muted,#8491a5)!important}',
            'html[data-theme="dark"] .css-1lkz3hi,html[data-theme="dark"] .css-1io725t,html[data-theme="dark"] .css-1io725t svg{color:var(--z-text-muted,#373a40)!important}',
            'html[data-theme="dark"] .HotSearchCard-change,html[data-theme="dark"] .HotSearchCard-dot{color:var(--z-text-muted,#9196a1)!important}',
            'html[data-theme="dark"] .HotSearchCard-dot{background-color:var(--z-text-muted,#9196a1)!important}',
            'html[data-theme="dark"] svg.Zi--Help,html[data-theme="dark"] svg.Zi--Help path{color:var(--z-text-muted,#adb0b7)!important}',
            'html[data-theme="dark"] .css-1hj0j6m,html[data-theme="dark"] .css-eh88np,html[data-theme="dark"] .LoadingBar{background-color:var(--z-brand,#1772f6)!important}',
            'html[data-theme="dark"] .css-so42cc,html[data-theme="dark"] .ZDI--ZhidaLogo24{color:var(--z-text-muted,#5a4df8)!important}',
            'html[data-theme="dark"] img.css-1t23x0k{background-color:var(--z-bg-surface,#f8f8fa)!important}',
            'html[data-theme="dark"] .HotSearchCard-tagHot{color:var(--z-danger-text,#d95350)!important}',
            'html[data-theme="dark"] .SearchBar-input{border-color:var(--z-border,#212429)!important}',
            /* ---- 问答页泄漏修复 ---- */
            'html[data-theme="dark"] .QuestionHeader,html[data-theme="dark"] .QuestionHeader-footer{background-color:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"] .ContentItem-meta,html[data-theme="dark"] .AuthorInfo{color:var(--z-text-body,#c2c6cf)!important}',
            'html[data-theme="dark"] .BrandQuestionSymbol,html[data-theme="dark"] .BrandQuestionSymbol-brandLink,html[data-theme="dark"] .BrandQuestionSymbol-name,html[data-theme="dark"] .BrandQuestionSymbol-logo{color:var(--z-text-soft,#929aab)!important}',
            'html[data-theme="dark"] .BrandQuestionSymbol-divider{background-color:var(--z-border,#282b30)!important}',
            'html[data-theme="dark"] .Tag.QuestionTopic,html[data-theme="dark"] .Tag-content,html[data-theme="dark"] .TopicLink{color:var(--z-brand,#1772f6)!important;border-color:var(--z-brand,#1772f6)!important}',
            'html[data-theme="dark"] .Tag.QuestionTopic{background-color:var(--z-brand-subtle,rgba(23,114,246,.08))!important}',
            'html[data-theme="dark"] .WriteAnswerButton,html[data-theme="dark"] .FollowButton{background-color:var(--z-brand,#558eff)!important}',
            'html[data-theme="dark"] .Reward,html[data-theme="dark"] .Reward-countZero{color:var(--z-text-muted,#9196a1)!important}',
            'html[data-theme="dark"] .Reward-rewardBtn{background-color:var(--z-danger-text,#f04567)!important}',
            'html[data-theme="dark"] img.Avatar{background-color:var(--z-bg-surface,#ffffff)!important}',
            'html[data-theme="dark"] blockquote{color:var(--z-text-muted,#535861)!important}',
            'html[data-theme="dark"] .QuestionTime-xiu{color:var(--z-text-muted,#9098ac)!important}',
            'html[data-theme="dark"] a.external{color:var(--z-brand,#09408e)!important}',
            'html[data-theme="dark"] .AnswerFormPortalContainer{background-color:var(--z-bg-surface,#f4f6f9)!important}',
            'html[data-theme="dark"] hr{border-color:var(--z-border,#808080)!important;background-color:var(--z-border,#808080)!important}',
            'html[data-theme="dark"] .InputLike{background-color:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"] .ContentItem-actions.Sticky{background-color:var(--z-bg,#191b1f)!important}',
            'html[data-theme="dark"] a.css-wmwsyx{color:var(--z-bg,#191b1f)!important;background-color:var(--z-bg-surface,#f8f8fa)!important}',
            'html[data-theme="dark"] button.css-19giw7g,html[data-theme="dark"] button.css-jaevqf{border-color:var(--z-border,#ebeced)!important}',
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
                '#zhihu-settings-panel{display:none;position:fixed;bottom:80px;right:24px;z-index:10000;width:260px;background:rgba(24,33,34,.96);border:1px solid #334142;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.5);flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}',
                '#zhihu-settings-panel .zh-sp-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px}',
                '#zhihu-settings-panel .zh-sp-header-title{font-size:14px;font-weight:600;color:#d7e1de;letter-spacing:.3px}',
                '#zhihu-settings-panel .zh-sp-close{width:24px;height:24px;border-radius:6px;border:none;background:transparent;color:#7f8f8b;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;line-height:1}',
                '#zhihu-settings-panel .zh-sp-close:hover{background:rgba(42,54,55,.6);color:#d7e1de}',
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
                '<div class="zh-sp-header"><span class="zh-sp-header-title">知乎设置</span><button class="zh-sp-close" id="zh-sp-close">&times;</button></div>' +
                '<div class="zh-sp-divider"></div>' +
                '<div class="zh-sp-row"><span class="zh-sp-label">深色模式</span><button class="zh-sp-toggle' + (isDark ? ' on' : '') + '" id="zh-dark-toggle"></button></div>' +
                '<div class="zh-sp-divider"></div>' +
                '<div class="zh-sp-section-label">色彩主题</div>' +
                themeOptionsHtml +
                '<div style="height:8px"></div>';

            document.body.appendChild(panel);

            // 关闭按钮
            document.getElementById('zh-sp-close').addEventListener('click', function () {
                panel.style.display = 'none';
            });

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
