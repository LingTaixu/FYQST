/**
 * 游戏内「每日奖励」悬浮入口。
 *
 * 悬浮图标常驻右下角；点击后弹出窗口，窗口绑定当前登录 token
 * （accountId + loginKey），每个账号每天可领取 10 份 998 充值档位奖励，
 * 奖励由服务端一次性通过邮件发放。
 */
(function () {
    'use strict';
    if (window.__fyqstDailyReward) return;
    window.__fyqstDailyReward = true;

    var API = '/daily.php';
    var state = { account: null, claimed: false, busy: false, product: null, hidden: false, checkedKey: '', midnightTimer: 0, retryAt: 0 };

    var style = document.createElement('style');
    style.textContent = [
        '#fyqst-daily-btn{position:fixed;right:14px;bottom:96px;z-index:99999;width:46px;height:46px;border:0;border-radius:50%;',
        'background:linear-gradient(145deg,#ffd76e,#f0a33c);box-shadow:0 6px 16px rgba(0,0,0,.35);cursor:pointer;',
        'display:flex;align-items:center;justify-content:center;font-size:22px;line-height:1;padding:0;',
        'animation:fyqst-daily-pulse 2.4s ease-in-out infinite;touch-action:manipulation;}',
        '#fyqst-daily-btn:active{transform:scale(.94);}',
        '@keyframes fyqst-daily-pulse{0%,100%{box-shadow:0 6px 16px rgba(0,0,0,.35);}50%{box-shadow:0 6px 22px rgba(255,196,84,.85);}}',
        '#fyqst-daily-mask{position:fixed;inset:0;z-index:100000;background:rgba(12,14,18,.62);display:none;align-items:center;justify-content:center;padding:18px;}',
        '#fyqst-daily-mask.open{display:flex;}',
        '#fyqst-daily-win{width:100%;max-width:360px;border-radius:16px;overflow:hidden;background:#1d2129;color:#f4f1e8;',
        'box-shadow:0 18px 48px rgba(0,0,0,.55);font-family:"Microsoft YaHei",PingFang SC,sans-serif;}',
        '.fyqst-daily-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;',
        'background:linear-gradient(135deg,#3a2b16,#241c10);border-bottom:1px solid rgba(255,209,118,.25);}',
        '.fyqst-daily-head h3{margin:0;font-size:15px;font-weight:600;letter-spacing:1px;color:#ffd76e;}',
        '.fyqst-daily-close{background:none;border:0;color:#b9b2a4;font-size:20px;line-height:1;cursor:pointer;padding:0 2px;}',
        '.fyqst-daily-body{padding:16px;}',
        '.fyqst-daily-line{font-size:12px;color:#a8a294;margin:0 0 10px;}',
        '.fyqst-daily-line b{color:#f4f1e8;font-weight:500;}',
        '.fyqst-daily-gift{background:rgba(255,209,118,.08);border:1px solid rgba(255,209,118,.28);border-radius:10px;padding:12px;margin:12px 0;}',
        '.fyqst-daily-gift strong{display:block;font-size:13px;color:#ffd76e;margin-bottom:6px;}',
        '.fyqst-daily-gift span{display:block;font-size:12px;color:#cfc8b8;line-height:1.8;}',
        '.fyqst-daily-action{width:100%;padding:11px 0;border:0;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;',
        'background:linear-gradient(145deg,#ffd76e,#f0a33c);color:#3a2b16;}',
        '.fyqst-daily-action[disabled]{opacity:.55;cursor:not-allowed;filter:grayscale(.35);}',
        '.fyqst-daily-msg{margin:10px 0 0;font-size:12px;line-height:1.7;color:#8fd18a;min-height:16px;}',
        '.fyqst-daily-msg.error{color:#f08a7a;}'
    ].join('');
    document.head.appendChild(style);

    var btn = document.createElement('button');
    btn.id = 'fyqst-daily-btn';
    btn.type = 'button';
    btn.title = '每日奖励';
    btn.setAttribute('aria-label', '每日奖励');
    btn.textContent = '🎁';

    var mask = document.createElement('div');
    mask.id = 'fyqst-daily-mask';
    mask.innerHTML = [
        '<div id="fyqst-daily-win" role="dialog" aria-modal="true" aria-label="每日奖励">',
        '<div class="fyqst-daily-head"><h3>每日奖励 · 998 充值</h3><button class="fyqst-daily-close" type="button" aria-label="关闭">×</button></div>',
        '<div class="fyqst-daily-body">',
        '<p class="fyqst-daily-line">账号：<b data-fyqst="account">读取中…</b></p>',
        '<p class="fyqst-daily-line">角色：<b data-fyqst="player">—</b></p>',
        '<div class="fyqst-daily-gift"><strong>每日可领 10 份 998 充值档位</strong>',
        '<span>每份：200 万钻石 + 200 万积分 + 1 个至尊礼盒</span>',
        '<span>每天 0 点重置，按 998 元档位计入累计充值</span>',
        '<span>钻石与积分通过邮件发放，充值活动可正常累计</span></div>',
        '<button class="fyqst-daily-action" type="button" data-fyqst="claim">领取今日奖励</button>',
        '<p class="fyqst-daily-msg" data-fyqst="msg"></p>',
        '</div></div>'
    ].join('');

    function q(sel) { return mask.querySelector('[data-fyqst="' + sel + '"]'); }
    function msg(text, isError) {
        var node = q('msg');
        node.textContent = text || '';
        node.className = 'fyqst-daily-msg' + (isError ? ' error' : '');
    }
    function msToShanghaiMidnight() {
        // 距离下一个北京时间 0 点（+5 秒）的毫秒数，用于次日重新显示悬浮按钮。
        var shifted = Date.now() + 8 * 3600000;
        var next = (Math.floor(shifted / 86400000) + 1) * 86400000 + 5000;
        return Math.max(1000, next - shifted);
    }
    function hideButton() {
        state.hidden = true;
        btn.style.display = 'none';
    }
    function showButton() {
        state.hidden = false;
        btn.style.display = 'flex';
    }
    function scheduleMidnightReset() {
        if (state.midnightTimer) clearTimeout(state.midnightTimer);
        state.midnightTimer = setTimeout(function () {
            state.midnightTimer = 0;
            state.checkedKey = '';
            state.claimed = false;
            showButton();
            refresh();
        }, msToShanghaiMidnight());
    }
    function currentAccount() {
        if (!(window.gd && gd.accountCtrl)) return null;
        var accountId = Number(gd.accountCtrl.getId && gd.accountCtrl.getId());
        var loginKey = gd.accountCtrl.getLoginKey && gd.accountCtrl.getLoginKey();
        if (!accountId || !loginKey) return null;
        var userId = 0;
        if (window.gd.userCtrl && gd.userCtrl.getId) userId = Number(gd.userCtrl.getId()) || 0;
        return {
            accountId: accountId,
            loginKey: String(loginKey),
            userId: userId,
            name: (gd.accountCtrl.getAccountName && gd.accountCtrl.getAccountName()) || ''
        };
    }
    function request(method, account) {
        var body = { accountId: account.accountId, loginKey: account.loginKey, userId: account.userId };
        if (method === 'GET') {
            var query = Object.keys(body).map(function (k) { return k + '=' + encodeURIComponent(body[k]); }).join('&');
            return fetch(API + '?' + query, { credentials: 'same-origin' }).then(parse);
        }
        return fetch(API, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(parse);
    }
    function parse(response) {
        return response.json().catch(function () { return { ok: false, error: '服务返回异常' }; });
    }
    function refresh() {
        var account = currentAccount();
        if (!account) {
            q('account').textContent = '请先进入游戏';
            q('player').textContent = '—';
            q('claim').disabled = true;
            q('claim').textContent = '进入游戏后可领取';
            return;
        }
        q('account').textContent = account.name ? account.name + '（ID ' + account.accountId + '）' : 'ID ' + account.accountId;
        state.account = account;
        state.checkedKey = account.accountId + ':' + account.loginKey;
        request('GET', account).then(function (data) {
            if (!data.ok) {
                q('player').textContent = '—';
                q('claim').disabled = true;
                q('claim').textContent = '暂不可领取';
                msg(data.error || '读取失败', true);
                return;
            }
            q('player').textContent = data.player ? data.player.nickName + '（ID ' + data.player.id + '）' : '—';
            state.claimed = !!data.claimed;
            state.product = data.product || null;
            state.checkedKey = account.accountId + ':' + account.loginKey;
            q('claim').disabled = state.claimed;
            q('claim').textContent = state.claimed ? '今日已领取' : '领取今日奖励';
            if (state.claimed) {
                // 领取过就把悬浮按钮收起来，次日 0 点再出现。
                msg('今天已经领取过了，明天 0 点后再来。');
                hideButton();
                scheduleMidnightReset();
            } else {
                showButton();
                msg('');
            }
        }).catch(function () {
            // 网络异常时保持按钮可见，30 秒后再重试。
            state.checkedKey = '';
            state.retryAt = Date.now() + 30000;
            q('claim').disabled = true;
            msg('网络异常，请稍后重试', true);
        });
    }
    function claim() {
        if (state.busy) return;
        var account = currentAccount();
        if (!account) { msg('请先进入游戏', true); return; }
        state.busy = true;
        q('claim').disabled = true;
        q('claim').textContent = '领取中…';
        request('POST', account).then(function (data) {
            if (!data.ok) {
                if (data.claimed) {
                    state.claimed = true;
                    q('claim').textContent = '今日已领取';
                } else {
                    q('claim').disabled = false;
                    q('claim').textContent = '重新领取';
                }
                msg(data.error || '领取失败', true);
                return;
            }
            state.claimed = true;
            state.checkedKey = account.accountId + ':' + account.loginKey;
            q('claim').textContent = '今日已领取';
            msg('领取成功！已计入累计充值 ' + (data.count || 10) * 998 + ' 元，钻石与积分请查收邮件。');
            scheduleMidnightReset();
            setTimeout(function () {
                hideButton();
                close();
            }, 1800);
        }).catch(function () {
            q('claim').disabled = false;
            q('claim').textContent = '重新领取';
            msg('网络异常，请稍后重试', true);
        }).then(function () {
            state.busy = false;
        });
    }
    function open() {
        if (state.hidden) return;
        mask.classList.add('open');
        msg('');
        refresh();
    }
    function close() { mask.classList.remove('open'); }

    btn.addEventListener('click', open);
    mask.addEventListener('click', function (event) { if (event.target === mask) close(); });
    mask.querySelector('.fyqst-daily-close').addEventListener('click', close);
    q('claim').addEventListener('click', claim);

    function mount() {
        if (!document.body) return setTimeout(mount, 200);
        document.body.appendChild(btn);
        document.body.appendChild(mask);
    }
    // 游戏启动后才有登录态：轮询等待，发现账号/token 变化就同步一次领取状态。
    var watchdog = setInterval(function () {
        var account = currentAccount();
        if (!account) return;
        if (Date.now() < state.retryAt) return;
        var key = account.accountId + ':' + account.loginKey;
        if (key === state.checkedKey) return;
        refresh();
    }, 3000);

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
})();
