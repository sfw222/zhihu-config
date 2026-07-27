// ==UserScript==
// @name         知乎美化
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  隐藏知乎各页面侧边栏（拉宽内容）；链接转直链；回答/文章发布时间置顶；问题创建时间显示；GIF自动播放；引用角标高亮
// @author       AN drew & sfw222
// @match        *://*.zhihu.com/*
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    /* ====== 配置 ====== */
    var HIDE_KEY = 'sidebar_hidden';

    function isHidden() {
        return GM_getValue(HIDE_KEY, true);
    }

    function toggle() {
        GM_setValue(HIDE_KEY, !isHidden());
        location.reload();
    }

    GM_registerMenuCommand(isHidden() ? '✓ 侧边栏已隐藏' : '  侧边栏已显示', toggle);

    /* ====== 页面 URL 变化监听 ====== */
    var currentPath = '';

    function watchUrl() {
        setInterval(function () {
            if (location.href !== currentPath) {
                currentPath = location.href;
                onPageChange();
            }
        }, 300);
    }

    function onPageChange() {
        var url = location.href;

        if (url.indexOf('/question/') > -1) {
            setTimeout(question, 500);
        } else if (url.indexOf('zhuanlan.zhihu.com') > -1 || url.indexOf('/p/') > -1) {
            setTimeout(zhuanlan, 500);
        } else if (url.indexOf('/search') > -1) {
            setTimeout(search, 500);
        } else if (url.indexOf('/collection/') > -1 || url.indexOf('/collections/') > -1) {
            setTimeout(collection, 500);
        } else if (url.indexOf('/topic/') > -1) {
            setTimeout(topic, 500);
        } else if (url.indexOf('/people/') > -1 || url.indexOf('/org/') > -1) {
            setTimeout(people, 500);
        } else if (url.indexOf('/column/') > -1) {
            setTimeout(column, 500);
        } else if (url.indexOf('/recent-viewed') > -1) {
            setTimeout(recent, 500);
        } else {
            setTimeout(index, 500);
        }
    }

    /* ====== 通用：隐藏侧边栏 + 拉宽内容 ====== */
    function hideSidebar(sideSelector, mainSelector, containerSelector) {
        if (!isHidden()) return;
        var $side = $(sideSelector);
        var $main = $(mainSelector);
        var $container = $(containerSelector);
        if ($side.length && !$side.hasClass('zh-hidden')) {
            $side.hide();
            $side.addClass('zh-hidden');
        }
        if ($main.length && $container.length) {
            $main.width($container.width());
        }
    }

    /* ====== 首页 ====== */
    function index() {
        hideSidebar('.GlobalSideBar', '.Topstory-mainColumn', '.Topstory-container');
        hideSidebar('.GlobalLeftSideBar', '.Topstory-mainColumn', '.Topstory-container');
    }

    /* ====== 回答页 ====== */
    function question() {
        hideSidebar('.GlobalSideBar', '.Question-mainColumn', '.QuestionPage');
        showTime();
    }

    /* ====== 专栏文章 ====== */
    function zhuanlan() {
        hideSidebar('.ColumnPageHeader-ButtonColumn', '.Post-content', '.Post-Main');
        showTime();
    }

    /* ====== 搜索页 ====== */
    function search() {
        hideSidebar('.GlobalSideBar', '.SearchMain-Column', '.Search-container');
        hideSidebar('.SearchSideBar', '.SearchMain-Column', '.Search-container');
    }

    /* ====== 收藏夹 ====== */
    function collection() {
        hideSidebar('.GlobalSideBar', '.CollectionsDetailPage-mainColumn', '.CollectionsDetailPage');
        hideSidebar('.CollectionsDetailPage-sideColumn', '.CollectionsDetailPage-mainColumn', '.CollectionsDetailPage');
    }

    /* ====== 话题页 ====== */
    function topic() {
        hideSidebar('.ContentLayout-sideColumn', '.ContentLayout-mainColumn', '.ContentLayout');
    }

    /* ====== 用户主页 ====== */
    function people() {
        hideSidebar('.Profile-sideColumn', '.Profile-mainColumn', '.Profile-main');
    }

    /* ====== 专栏列表 ====== */
    function column() {
        hideSidebar('.ColumnPage-aside', '.ColumnPage-main', '.ColumnPage');
    }

    /* ====== 最近浏览 ====== */
    function recent() {
        hideSidebar('.GlobalSideBar', '.Topstory-mainColumn', '.Topstory-container');
    }

    /* ====== 链接转直链 ====== */
    function directLink() {
        $('a.external').each(function () {
            var href = $(this).attr('href');
            if (!href || $(this).data('zh-converted')) return;
            var m = href.match(/(?:link\?url=|target=)([^&]+)/);
            if (m) {
                try {
                    var decoded = decodeURIComponent(m[1]);
                    if (decoded.indexOf('http') === 0) {
                        $(this).attr('href', decoded);
                        $(this).data('zh-converted', true);
                    }
                } catch (e) {}
            }
        });

        $('a.LinkCard:not(.MCNLinkCard)').each(function () {
            var href = $(this).attr('href');
            if (!href || $(this).data('zh-converted')) return;
            var m = href.match(/(?:link\?url=|target=)([^&]+)/);
            if (m) {
                try {
                    var decoded = decodeURIComponent(m[1]);
                    if (decoded.indexOf('http') === 0) {
                        $(this).attr('href', decoded);
                        $(this).data('zh-converted', true);
                    }
                } catch (e) {}
            }
        });
    }

    /* ====== 回答/文章发布时间置顶 ====== */
    function showTime() {
        $('.ContentItem-time').each(function () {
            if ($(this).data('zh-timed')) return;
            var $link = $(this).find('a');
            var tooltip = $link.attr('data-tooltip');
            if (!tooltip) return;
            var text = $link.text();
            if (text.indexOf(tooltip) === -1) {
                $link.text(tooltip + '\u2003' + text);
            }
            $(this).data('zh-timed', true);
        });
    }

    /* ====== 问题创建/编辑时间 ====== */
    function showQuestionTime() {
        if (location.href.indexOf('/log') > -1) return;
        if ($('.zh-question-time').length) return;

        var $meta = $('.QuestionPage .QuestionHeader-side');
        if (!$meta.length) return;

        var m = location.href.match(/\/question\/(\d+)/);
        if (!m) return;
        var qid = m[1];

        $.get('https://www.zhihu.com/api/v4/questions/' + qid, function (data) {
            if (data && data.created && data.updated_time) {
                var created = formatTime(data.created);
                var updated = formatTime(data.updated_time);
                $meta.append(
                    '<p class="zh-question-time" style="color:#8590a6;font-size:13px;margin-top:8px;">' +
                    '创建于 ' + created + '\u2003编辑于 ' + updated +
                    '</p>'
                );
            }
        });
    }

    function formatTime(ts) {
        var d = new Date(ts * 1000);
        var pad = function (n) { return n < 10 ? '0' + n : n; };
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
            ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    /* ====== GIF 自动播放 ====== */
    function gifPlay() {
        $('.GifPlayer .ztext-gif').each(function () {
            if ($(this).hasClass('GifPlayer-gif2mp4')) {
                if (this.paused) {
                    this.play();
                }
            } else {
                var src = $(this).attr('src');
                if (src && src.indexOf('webp') === -1) {
                    $(this).attr('src', src.replace('.jpg', '.webp'));
                }
            }
        });
    }

    /* ====== 引用角标高亮 ====== */
    function highlightRef() {
        $('sup[data-draft-type=reference]').off('click.zh-ref').on('click.zh-ref', function () {
            var id = $(this).find('a').attr('href');
            if (id) {
                $(id).css('background', 'rgba(0,132,255,0.15)');
                setTimeout(function () { $(id).css('background', ''); }, 2000);
            }
        });
    }

    /* ====== 设置 ====== */
    GM_registerMenuCommand('知乎美化设置', function () {
        var current = isHidden();
        var msg = '当前：' + (current ? '侧边栏已隐藏' : '侧边栏已显示') + '\n\n';
        msg += '点击「确定」切换为：' + (current ? '显示' : '隐藏');
        if (confirm(msg)) {
            toggle();
        }
    });

    /* ====== 主入口 ====== */
    $(function () {
        directLink();
        highlightRef();
        showQuestionTime();
        gifPlay();
        onPageChange();
        watchUrl();

        setInterval(directLink, 200);
        setInterval(gifPlay, 500);
        setInterval(showTime, 500);
    });
})();
