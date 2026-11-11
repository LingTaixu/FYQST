import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

test('silent sound loaders complete without network, including saved enabled settings', async () => {
    let transfers = 0;
    const events = [];
    class Sound {
        load() { transfers++; }
        play() { transfers++; }
        dispatchEventWith(event) { events.push(event); }
    }
    class HtmlSound extends Sound {}
    class WebAudioSound extends Sound {}
    const window = {
        egret: { project: {}, Sound, web: { HtmlSound, WebAudioSound }, Event: { COMPLETE: 'complete' } },
        mo: { audioEnabled: true, musicEnabled: true, playAudio() { transfers++; }, playMusic() { transfers++; } }
    };
    const source = fs.readFileSync(path.resolve(import.meta.dir, '../www/wwwroot/www/js/bandwidth.js'), 'utf8');
    vm.runInNewContext(source, { window, setTimeout });
    window.FyqstAudioPolicy.install();
    window.mo.audioEnabled = window.mo.musicEnabled = true;
    window.mo.playAudio('tap.mp3');
    window.mo.playMusic('city.mp3');
    for (const Type of [Sound, HtmlSound, WebAudioSound]) {
        const sound = new Type();
        sound.load('cached.mp3?v=old');
        const channel = sound.play();
        channel.stop();
        expect(channel.volume).toBe(0);
    }
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(transfers).toBe(0);
    expect(events).toEqual(['complete', 'complete', 'complete']);
    expect(window.mo.audioEnabled).toBe(false);
    expect(window.mo.musicEnabled).toBe(false);
    expect(window.noVoice).toBe(true);
});
