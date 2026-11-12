/**
 * 修复 egret 引擎事件池污染导致的
 *   TypeError: u.$initTo is not a function
 * （engine.min.js:1868 TouchEvent.dispatchTouchEvent）
 *
 * 原理：egret.Event.create 会从 t.eventPool 里 pop 对象复用。
 * 一旦池中混入了不是 TouchEvent 的普通 Event，之后每次触摸都会
 * 取出该对象并调用 $initTo，从而抛错，表现为点击/引导卡住。
 *
 * 这里做两件事：
 *   1) 给 TouchEvent.create 加类型校验，弹出非法对象直接丢弃；
 *   2) 兜底修复：dispatchTouchEvent 抛错时清理池并重试一次，
 *      同时在控制台输出污染源信息，便于定位。
 *
 * 必须在 engine.min.js 之后、游戏代码之前加载。
 */
(function (win) {
    'use strict';

    var DEBUG_KEY = 'fyqstGuardDebug';
    var lastPoison = null;
    var droppedCount = 0;
    var debug = false;
    try {
        debug = win.localStorage && win.localStorage.getItem(DEBUG_KEY) === '1';
    } catch (e) { /* ignore */ }

    function log() {
        if (!win.console || !win.console.warn) return;
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[engine-guard]');
        win.console.warn.apply(win.console, args);
    }

    function isTouchEventLike(obj, cls) {
        if (!obj) return false;
        if (typeof obj.$initTo !== 'function') return false;
        if (cls && !(obj instanceof cls)) return false;
        return true;
    }

    // ------------------------------------------------------------------
    // 核心修复：egret.Event.release 会把 `t.constructor.eventPool` 直接当数组 push，
    // 但普通对象 / 被篡改原型的实例的 constructor 不是 egret.Event 子类，
    // 其 eventPool 为 undefined，于是 push 抛错；另一种情况是池被塞进别的类实例。
    // 这里统一做“池归属校验”，保证 release 一定推到正确的池里。
    // ------------------------------------------------------------------
    function patchRelease(cls) {
        if (!cls || !cls.release || cls.release.__fyqstPatched) return;

        cls.release = function (event) {
            if (!event) return;
            try {
                if (typeof event.clean === 'function') event.clean();
            } catch (e) { /* ignore */ }

            // 找到真正应该接收它的池：优先事件自身类
            var target = null;
            var ctor = event.constructor;
            if (ctor && (ctor === cls || ctor.prototype instanceof cls)) {
                target = ctor;
            } else if (event instanceof cls) {
                target = cls;
            }

            if (!target) {
                // 类型对不上，直接丢弃，绝不污染任何池
                lastPoison = lastPoison || { type: event.$type, ctor: ctor && ctor.name, stack: new Error().stack };
                if (debug) {
                    log('release 丢弃不匹配对象：', event.$type, '构造类：', ctor && ctor.name);
                    log('来源堆栈：', lastPoison.stack);
                }
                return;
            }

            var proto = target.prototype;
            while (proto) {
                var owner = proto.constructor;
                if (owner && owner.eventPool) break;
                proto = Object.getPrototypeOf(proto);
            }

            if (!target.eventPool) target.eventPool = [];
            target.eventPool.push(event);
        };
        cls.release.__fyqstPatched = true;
    }

    // 清理池中所有非法对象，返回清理数量
    function sanitizePool(cls) {
        var pool = cls && cls.eventPool;
        if (!pool || !pool.length) return 0;
        var kept = [];
        var dropped = 0;
        for (var i = 0; i < pool.length; i++) {
            if (isTouchEventLike(pool[i], cls)) {
                kept.push(pool[i]);
            } else {
                dropped++;
                if (debug) log('丢弃池中非法对象：', pool[i] && pool[i].$type, pool[i] && pool[i].constructor && pool[i].constructor.name);
            }
        }
        if (dropped) { cls.eventPool = kept; droppedCount += dropped; }
        return dropped;
    }

    function patchCreate(cls) {
        if (!cls || !cls.create || cls.create.__fyqstPatched) return;
        // cls.create(eventClass, type, bubbles, cancelable)
        cls.create = function (eventClass, type, bubbles, cancelable) {
            var pool = eventClass && eventClass.eventPool;
            if (pool && pool.length) {
                while (pool.length) {
                    var obj = pool.pop();
                    if (!isTouchEventLike(obj, eventClass)) {
                        if (debug) log('create 跳过非法对象：', obj && obj.$type, obj && obj.constructor && obj.constructor.name);
                        continue;
                    }
                    obj.$type = type;
                    obj.$bubbles = !!bubbles;
                    obj.$cancelable = !!cancelable;
                    obj.$isDefaultPrevented = false;
                    obj.$isPropagationStopped = false;
                    obj.$isPropagationImmediateStopped = false;
                    obj.$eventPhase = 2;
                    return obj;
                }
            }
            return new eventClass(type, bubbles, cancelable);
        };
        cls.create.__fyqstPatched = true;
    }

    function patchDispatch(cls) {
        if (!cls || !cls.dispatchTouchEvent || cls.dispatchTouchEvent.__fyqstPatched) return;

        var original = cls.dispatchTouchEvent;

        cls.dispatchTouchEvent = function () {
            try {
                return original.apply(this, arguments);
            } catch (err) {
                var msg = err && err.message ? err.message : String(err);
                if (msg.indexOf('$initTo') === -1) throw err;

                // 池被污染：清空非法对象后重试一次
                var dropped = sanitizePool(cls);
                log('捕获 $initTo 报错，已清理事件池 ' + dropped + ' 个非法对象，重试派发。');
                if (debug) {
                    log('原始堆栈：', err && err.stack);
                    log('当前触摸池：', (cls.eventPool || []).length, '普通事件池：', (win.egret.Event.eventPool || []).length);
                }
                return original.apply(this, arguments);
            }
        };

        cls.dispatchTouchEvent.__fyqstPatched = true;
        cls.dispatchTouchEvent.__fyqstOriginal = original;
    }

    function install() {
        var egret = win.egret;
        if (!egret || !egret.TouchEvent) return false;

        patchCreate(egret.TouchEvent);
        patchCreate(egret.Event);
        patchRelease(egret.TouchEvent);
        patchRelease(egret.Event);
        patchDispatch(egret.TouchEvent);

        var dropped = sanitizePool(egret.TouchEvent) + sanitizePool(egret.Event);
        if (dropped) log('初始化清理了 ' + dropped + ' 个非法事件对象。');

        // 暴露调试开关
        win.fyqstEngineGuard = {
            version: '1.0.0',
            sanitize: function () {
                return sanitizePool(egret.TouchEvent) + sanitizePool(egret.Event);
            },
            enableDebug: function (on) {
                debug = on !== false;
                try {
                    if (win.localStorage) {
                        win.localStorage.setItem(DEBUG_KEY, debug ? '1' : '0');
                    }
                } catch (e) { /* ignore */ }
                log('调试模式：' + (debug ? '开启' : '关闭'));
            },
            lastPoison: function () { return lastPoison; },
            stats: function () {
                return {
                    touchPool: (egret.TouchEvent.eventPool || []).length,
                    eventPool: (egret.Event.eventPool || []).length,
                    patched: !!(egret.TouchEvent.create && egret.TouchEvent.create.__fyqstPatched),
                    dropped: droppedCount
                };
            }
        };

        return true;
    }

    if (!install()) {
        // engine 尚未就绪时，等 DOM 就绪后再试一次
        var tries = 0;
        var timer = win.setInterval(function () {
            tries++;
            if (install() || tries > 40) {
                win.clearInterval(timer);
                if (tries > 40) log('未能安装补丁：engine 未加载。');
            }
        }, 50);
    }
}(window));
