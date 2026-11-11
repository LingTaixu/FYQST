/* Silent mode: no music or sound data is fetched, including cached player settings. */
(function (root) {
    'use strict';
    Object.defineProperty(root, 'noVoice', { value: true, writable: false, configurable: false });
    var installed = false;

    function noop() {}
    function channel() { return { volume: 0, position: 0, stop: noop }; }
    function loadSilently(url) {
        this.url = url;
        var sound = this;
        // Resource loaders still receive completion, so groups cannot hang or retry.
        setTimeout(function () {
            if (sound.dispatchEventWith) sound.dispatchEventWith(root.egret.Event.COMPLETE);
        }, 0);
    }

    root.FyqstAudioPolicy = Object.freeze({
        enabled: false,
        install: function () {
            if (installed) return;
            var egret = root.egret;
            if (!egret) throw new Error('Load the Egret engine before installing the audio policy.');
            egret.project.audioEnabled = false;
            egret.project.musicEnabled = false;
            var web = egret.web || {};
            [egret.Sound, web.HtmlSound, web.WebAudioSound].forEach(function (Sound) {
                if (!Sound) return;
                Sound.prototype.load = loadSilently;
                Sound.prototype.play = channel;
                Sound.prototype.close = noop;
            });
            var mo = root.mo;
            if (mo) {
                if (mo.stopAllSounds) mo.stopAllSounds();
                mo.playAudio = noop;
                mo.playMusic = noop;
                ['audioEnabled', 'musicEnabled'].forEach(function (name) {
                    mo[name] = false;
                    Object.defineProperty(mo, name, { get: function () { return false; }, set: noop, configurable: false });
                });
            }
            installed = true;
        }
    });
})(window);
