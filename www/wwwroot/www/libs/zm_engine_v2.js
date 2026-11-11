! function (a) {
    function b(a) {
        return "[object Function]" == Object.prototype.toString.call(a)
    }

    function c(a) {
        return "[object Array]" == Object.prototype.toString.call(a)
    }

    function d(a, b) {
        var c = /^\w+\:\/\//;
        return /^\/\/\/?/.test(a) ? a = location.protocol + a : c.test(a) || "/" == a.charAt(0) || (a = (b || "") + a), c.test(a) ? a : ("/" == a.charAt(0) ? r : q) + a
    }

    function e(a, b) {
        for (var c in a) a.hasOwnProperty(c) && (b[c] = a[c]);
        return b
    }

    function f(a) {
        for (var b = !1, c = 0; c < a.scripts.length; c++) a.scripts[c].ready && a.scripts[c].exec_trigger && (b = !0, a.scripts[c].exec_trigger(), a.scripts[c].exec_trigger = null);
        return b
    }

    function g(a, b, c, d) {
        a.onload = a.onreadystatechange = function () {
            a.readyState && "complete" != a.readyState && "loaded" != a.readyState || b[c] || (a.onload = a.onreadystatechange = null, d())
        }
    }

    function h(a) {
        a.ready = a.finished = !0;
        for (var b = 0; b < a.finished_listeners.length; b++) a.finished_listeners[b]();
        a.ready_listeners = [], a.finished_listeners = []
    }

    function i(a, b, c, d, e) {
        setTimeout(function () {
            var f, h, i = b.real_src;
            if ("item" in s) {
                if (!s[0]) return void setTimeout(arguments.callee, 25);
                s = s[0]
            }
            f = document.createElement("script"), b.type && (f.type = b.type), b.charset && (f.charset = b.charset), e ? w ? (c.elem = f, v ? (f.preload = !0, f.onpreload = d) : f.onreadystatechange = function () {
                "loaded" == f.readyState && d()
            }, f.src = i) : e && 0 == i.indexOf(r) && a[l] ? (h = new XMLHttpRequest, h.onreadystatechange = function () {
                4 == h.readyState && (h.onreadystatechange = function () {}, c.text = h.responseText + "\n//@ sourceURL=" + i, d())
            }, h.open("GET", i), h.send()) : (f.type = "text/cache-script", g(f, c, "ready", function () {
                s.removeChild(f), d()
            }), f.src = i, s.insertBefore(f, s.firstChild)) : x ? (f.async = !1, g(f, c, "finished", d), f.src = i, s.insertBefore(f, s.firstChild)) : (g(f, c, "finished", d), f.src = i, s.insertBefore(f, s.firstChild))
        }, 0)
    }

    function j() {
        function q(a, b, c) {
            function d() {
                null != e && (e = null, h(c))
            }
            var e;
            A[b.src].finished || (a[n] || (A[b.src].finished = !0), e = c.elem || document.createElement("script"), b.type && (e.type = b.type), b.charset && (e.charset = b.charset), g(e, c, "finished", d), c.elem ? c.elem = null : c.text ? (e.onload = e.onreadystatechange = null, e.text = c.text) : e.src = b.real_src, s.insertBefore(e, s.firstChild), c.text && d())
        }

        function r(a, b, c, e) {
            var f, g, j = function () {
                    b.ready_cb(b, function () {
                        q(a, b, f)
                    })
                },
                k = function () {
                    b.finished_cb(b, c)
                };
            b.src = d(b.src, a[p]), b.real_src = b.src + (a[o] ? (/\?.*$/.test(b.src) ? "&_" : "?_") + ~~(1e9 * Math.random()) + "=" : ""), A[b.src] || (A[b.src] = {
                items: [],
                finished: !1
            }), g = A[b.src].items, a[n] || 0 == g.length ? (f = g[g.length] = {
                ready: !1,
                finished: !1,
                ready_listeners: [j],
                finished_listeners: [k]
            }, i(a, b, f, e ? function () {
                f.ready = !0;
                for (var a = 0; a < f.ready_listeners.length; a++) f.ready_listeners[a]();
                f.ready_listeners = []
            } : function () {
                h(f)
            }, e)) : (f = g[0], f.finished ? k() : f.finished_listeners.push(k))
        }

        function t() {
            function a(a, b) {
                a.ready = !0, a.exec_trigger = b, g()
            }

            function d(a, b) {
                a.ready = a.finished = !0, a.exec_trigger = null;
                for (var c = 0; c < b.scripts.length; c++)
                    if (!b.scripts[c].finished) return;
                b.finished = !0, g()
            }

            function g() {
                for (; n < l.length;)
                    if (b(l[n])) try {
                        l[n++]()
                    } catch (a) {} else {
                        if (!l[n].finished) {
                            if (f(l[n])) continue;
                            break
                        }
                        n++
                    }
                    n == l.length && (o = !1, j = !1)
            }

            function h() {
                j && j.scripts || l.push(j = {
                    scripts: [],
                    finished: !0
                })
            }
            var i, j, k = e(v, {}),
                l = [],
                n = 0,
                o = !1;
            return i = {
                script: function () {
                    for (var f = 0; f < arguments.length; f++)! function (f, g) {
                        var l;
                        c(f) || (g = [f]);
                        for (var n = 0; n < g.length; n++) h(), f = g[n], b(f) && (f = f()), f && (c(f) ? (l = [].slice.call(f), l.unshift(n, 1), [].splice.apply(g, l), n--) : ("string" == typeof f && (f = {
                            src: f
                        }), f = e(f, {
                            ready: !1,
                            ready_cb: a,
                            finished: !1,
                            finished_cb: d
                        }), j.finished = !1, j.scripts.push(f), r(k, f, j, x && o), o = !0, k[m] && i.wait()))
                    }(arguments[f], arguments[f]);
                    return i
                }, wait: function () {
                    if (arguments.length > 0) {
                        for (var a = 0; a < arguments.length; a++) l.push(arguments[a]);
                        j = l[l.length - 1]
                    } else j = !1;
                    return g(), i
                }
            }, {
                script: i.script,
                wait: i.wait,
                setOptions: function (a) {
                    return e(a, k), i
                }
            }
        }
        var u, v = {},
            x = w || y,
            z = [],
            A = {};
        return v[l] = !0, v[m] = !1, v[n] = !1, v[o] = !1, v[p] = "", u = {
            setGlobalDefaults: function (a) {
                return e(a, v), u
            }, setOptions: function () {
                return t().setOptions.apply(null, arguments)
            }, script: function () {
                return t().script.apply(null, arguments)
            }, wait: function () {
                return t().wait.apply(null, arguments)
            }, queueScript: function () {
                return z[z.length] = {
                    type: "script",
                    args: [].slice.call(arguments)
                }, u
            }, queueWait: function () {
                return z[z.length] = {
                    type: "wait",
                    args: [].slice.call(arguments)
                }, u
            }, runQueue: function () {
                for (var a, b = u, c = z.length, d = c; --d >= 0;) a = z.shift(), b = b[a.type].apply(null, a.args);
                return b
            }, noConflict: function () {
                return a.$ZMLF = k, u
            }, sandbox: function () {
                return j()
            }
        }
    }
    var k = a.$ZMLF,
        l = "UseLocalXHR",
        m = "AlwaysPreserveOrder",
        n = "AllowDuplicates",
        o = "CacheBust",
        p = "BasePath",
        q = /^[^?#]*\//.exec(location.href)[0],
        r = /^\w+\:\/\/\/?[^\/]+/.exec(q)[0],
        s = document.head || document.getElementsByTagName("head"),
        t = a.opera && "[object Opera]" == Object.prototype.toString.call(a.opera) || "MozAppearance" in document.documentElement.style,
        u = document.createElement("script"),
        v = "boolean" == typeof u.preload,
        w = v || u.readyState && "uninitialized" == u.readyState,
        x = !w && u.async === !0,
        y = !w && !x && !t;
    a.$ZMLF = j(),
        function (a, b, c) {
            null == document.readyState && document[a] && (document.readyState = "loading", document[a](b, c = function () {
                document.removeEventListener(b, c, !1), document.readyState = "complete"
            }, !1))
        }("addEventListener", "DOMContentLoaded")
}(this), ZmEngine = function () {
    this.DEBUG = !1;
    var a = "https:" == document.location.protocol;
    this.DEBUG ? (this.mZmHost = "http://123.56.249.173/soeasysrtest", this.mZmSdkHost = "http://123.56.249.173/soeasysrtest") : (this.mZmHost = a ? "" : "", this.mZmSdkHost = a ? "" : ""), this.zmRUSP = a ? "https://cn.soeasysdk.com/userserver/getUserInfo" : "http://cn.soeasysdk.com/userserver/getUserInfo", this.zmRSSP = a ? "https://cn.soeasysdk.com/userserver/getRoleInfo" : "http://cn.soeasysdk.com/userserver/getRoleInfo", this.zmOIDSP = a ? "https://cn.soeasysdk.com/ordercreate/getorderid" : "http://cn.soeasysdk.com/ordercreate/getorderid", this.zmUASP = a ? "https://cn.soeasysdk.com/authserver/auth" : "http://cn.soeasysdk.com/authserver/auth", this.zmLOC = a ? "https://cn.soeasysdk.com/locserver/loc" : "http://cn.soeasysdk.com/locserver/loc", this.mZmAppConfSuffix = ".js", this.mCurrLoadFileIdx = 0, this.mChannelParams = {}
}, ZmEngine.prototype.loadFiles = function () {
    var a = this;
    if (console.log("loadFiles()..."), console.log("conf idx_:" + a.mCurrLoadFileIdx), mZmTargetFiles.length > 0) {
        var b = mZmTargetFiles[a.mCurrLoadFileIdx];
        if (b.indexOf("http://") == -1 && b.indexOf("https://") == -1) {
            var c = new Date,
                d = "" + c.getFullYear() + (c.getMonth() + 1) + c.getDate();
            d = d + c.getHours() + c.getMinutes() + c.getSeconds(), b = this.mZmSdkHost + mZmTargetFiles[a.mCurrLoadFileIdx] + "&random=" + d
        }
        $ZMLF.script(b).wait(function () {
            a.mCurrLoadFileIdx++, a.mCurrLoadFileIdx >= mZmTargetFiles.length ? (console.log("mZmTargetFiles loaded!"), "function" == typeof zmInitSucc && (console.log("zmInitSucc..."), zmInitSucc())) : a.loadFiles()
        })
    } else console.log("mZmTargetFiles is empty!"), "function" == typeof zmInitSucc && (console.log("zmInitSucc..."), zmInitSucc())
}, ZmEngine.prototype.getParentUrl = function () {
    var a = window.location != window.parent.location ? document.referrer : document.location.href;
    return console.log("parenturl_:" + a), a
}, ZmEngine.prototype.start = function () {
    console.log("zmengine load succ and start...");
    var a = this;
    a.mChannelParams = (new ZmSdkUtils).getAllUrlParams();
    var b = window.navigator.userAgent;
    if (console.log("ua_:" + b), b.indexOf("H5GamePlayer") >= 0) return window.Zmsdk && !window.ZmSdk && (window.ZmSdk = new Zmsdk), console.log(ZmSdk), void("function" == typeof zmInitSucc && (console.log("UA zmInitSucc..."), zmInitSucc()));
    //if (!a.mChannelParams.zmcon) return console.error("zmcon not found"), void alert("游戏初始化失败");
    //var c = this.mZmHost + "/gameini/apps_conf/" + "c67ed0993b48c8f89c9999847ab88e68" + this.mZmAppConfSuffix;
	var c = "libs/" + "c67ed0993b48c8f89c9999847ab88e68" + this.mZmAppConfSuffix;
    console.log("start load config file..."), $ZMLF.script(c).wait(function () {
        return console.log("config file load succ"), "undefined" == typeof mZmParams.zapid ? void console.error("sptype or zmappid is undefined!") : (console.log("start to load other files..."), console.log("conf targetfiles_:" + mZmTargetFiles.toString()), void a.loadFiles())
    })
}, ZmSdkUtils = function () {}, ZmSdkUtils.prototype.Base64Encode = function (a) {
    var b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    if (a) {
        if (a += "", 0 === a.length) return a;
        a = encodeURIComponent(a);
        var c, d, e = [],
            f = b[64],
            g = a.length - a.length % 3;
        for (c = 0; c < g; c += 3) d = a.charCodeAt(c) << 16 | a.charCodeAt(c + 1) << 8 | a.charCodeAt(c + 2), e.push(b.charAt(d >> 18)), e.push(b.charAt(d >> 12 & 63)), e.push(b.charAt(d >> 6 & 63)), e.push(b.charAt(63 & d));
        switch (a.length - g) {
        case 1:
            d = a.charCodeAt(c) << 16, e.push(b.charAt(d >> 18) + b.charAt(d >> 12 & 63) + f + f);
            break;
        case 2:
            d = a.charCodeAt(c) << 16 | a.charCodeAt(c + 1) << 8, e.push(b.charAt(d >> 18) + b.charAt(d >> 12 & 63) + b.charAt(d >> 6 & 63) + f)
        }
        return e.join("")
    }
}, ZmSdkUtils.prototype.setParameter = function (a, b, c) {
    a = a.replace(/(#.*)/gi, "");
    var d = new RegExp("([?&])" + b + "=([^&]*)(?=&|$)", "i");
    return d.test(a) ? a.replace(d, "$1" + b + "=" + c) : a + (a.indexOf("?") == -1 ? "?" : "&") + b + "=" + c
}, ZmSdkUtils.prototype.ajax = function (a, b, c) {
    var d = {
        method: "GET",
        url: a + "?param=" + this.Base64Encode(b),
        data: b,
        type: "json",
        success: c
    };
    new ZmSdkUtilsAjax(this._zmsdk, d.method, d.url, d.data, d.type, d.success)
}, ZmSdkUtilsAjax = function (a, b, c, d, e, f) {
    this._zmsdk = a, this.xmlhttp = null, window.XMLHttpRequest ? this.xmlhttp = new XMLHttpRequest : this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"), this.type = e, this.success = f, console.log("zmsdkutilsajax open " + c), this.xmlhttp.open(b, c, !0);
    var g = this;
    if (this.xmlhttp.onreadystatechange = function () {
        g.callback.apply(g)
    }, "object" == typeof d && null != d) {
        var h = [];
        for (var i in d) h.push(i + "=" + escape(d[i]));
        d = h.join("&")
    }
    console.log("zmsdkutilsajax send data"), this.xmlhttp.send(d)
}, ZmSdkUtilsAjax.prototype.callback = function () {
    if (console.log("zmsdkutilsajax call retsate_:" + this.xmlhttp.readyState + " retstus_:" + this.xmlhttp.status), 4 == this.xmlhttp.readyState && 200 == this.xmlhttp.status) {
        var a = null;
        switch (this.type) {
        case "text":
            a = this.xmlhttp.responseText;
            break;
        case "json":
            try {
                a = JSON.parse(this.xmlhttp.responseText)
            } catch (b) {
                a = this.xmlhttp.responseText
            }
        }
        console.log("zmsdkutilsajax call success"), this.success && this.success.call(this.xmlhttp, a)
    } else 4 == this.xmlhttp.readyState && 200 != this.xmlhttp.status && (console.log("zmsdkutilsajax call fail"), this.success && this.success.call(this.xmlhttp, {
        msg: "request fail state_" + this.xmlhttp.readyState + " status_:" + this.xmlhttp.status
    }))
}, ZmSdkUtils.prototype.isSupportLocalStorage = function () {
    if ("object" == typeof window.localStorage) try {
        return window.localStorage.setItem("localStorage", 1), window.localStorage.removeItem("localStorage"), !0
    } catch (a) {}
    return !1
}, ZmSdkUtils.prototype.getAllUrlParams = function (a) {
    try {
        window.OPEN_DATA && window.OPEN_DATA.appurl && (a = window.OPEN_DATA.appurl)
    } catch (a) {}
    var b = window.location.href;
    b.indexOf("#") == -1 || a || (a = b);
    var c = a ? a.split("?")[1] : window.location.search.slice(1),
        d = {};
    if (c) {
        c = c.split("#")[0];
        if (c.match(/&quot;/) != null) {
            c = c.replace(/&quot;/g, "\"");
        }
        var e = c.split("&");
        console.log("queryString_:" + c);
        for (var f = 0; f < e.length; f++) {
            var g = e[f].split("="),
                h = void 0,
                i = g[0].replace(/\[\d*\]/, function (a) {
                    return h = a.slice(1, -1), ""
                }),
                j = "undefined" == typeof g[1] || g[1];
            if (g.length > 2) {
                var k = e[f].indexOf("=");
                console.info("idx", k), j = e[f].substr(k + 1)
            }
            d[i] ? ("string" == typeof d[i] && (d[i] = [d[i]]), "undefined" == typeof h ? d[i].push(j) : d[i][h] = j) : d[i] = j
        }
    }
    return d
};
var mZmEngine = new ZmEngine;
mZmEngine.start(); /*!ZMSDKV1.02017-07-26 */