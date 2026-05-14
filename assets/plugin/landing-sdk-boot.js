/**
 * LandingSDK 启动器
 * 负责：加载 SDK、初始化、上报页面展示、全局点击坐标记录
 *
 * 用法：
 *   <script src="/assets/plugin/landing-sdk-boot.js"></script>
 *   <script>
 *     bootLandingSDK({ appId, domain, channel, landing_page_id, trace_id });
 *   </script>
 */
(function (w, d, tag, src, name) {
    // 创建占位 tracker，SDK 加载前的调用会进入队列
    w[name] = w[name] || function () {
        var args = Array.prototype.slice.call(arguments);
        return new Promise(function (resolve, reject) {
            (w[name].q = w[name].q || []).push({ args: args, resolve: resolve, reject: reject });
        });
    };
    w[name].l = 1 * new Date();

    // 异步加载第三方 SDK
    var a = d.createElement(tag), m = d.getElementsByTagName(tag)[0];
    a.async = 1;
    a.src = src;
    m.parentNode.insertBefore(a, m);

    // 全局记录最后一次点击/触摸坐标
    function saveClick(e) {
        var t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
        if (t && t.clientX != null) {
            w._lastClickSnapshot = { x: t.clientX, y: t.clientY, ts: Date.now() };
        }
    }
    d.addEventListener('touchstart', saveClick, true);
    d.addEventListener('click', saveClick, true);

})(window, document, 'script', 'assets/plugin/landing-sdk-v1.1.1.js', 'tracker');


window.bootLandingSDK = function (cfg) {
    var timer = setInterval(function () {
        if (!window.LandingSDK) return;
        clearInterval(timer);

        var initCfg = {
            appId: cfg.appId,
            channel: cfg.channel || '',
            prod: true,
            batch: true,
        };
        if (cfg.domain) initCfg.domain = cfg.domain;
        window.LandingSDK.init(initCfg);

        window.LandingSDK.track.landingPageView({
            landing_page_id: cfg.landing_page_id,
        });

        var queued = (window.tracker && window.tracker.q) || [];
        var real = window.LandingSDK.track;
        real.q = [];
        window.tracker = real;
        queued.forEach(function (item) {
            real.apply(null, item.args).then(item.resolve).catch(item.reject);
        });
        queued.length = 0;
    }, 30);
};