import { Howl, Howler } from 'howler';

class SoundEngine {
    constructor(opt = {
        // datas
    }) {
        this.sounds = {};

        // this.registerSounds();

        this.bindEvents();

        window.SoundEngine = this;
    }

    /*registerSounds() {
        for (let i = 0; i < this.datas.length; i++) {
            this.new(this.datas[i].name, this.datas[i].url, this.datas[i].loop, this.datas[i].volume);
        }
    }*/

    bindEvents() {
        let isActive = true
        document.addEventListener('visibilitychange', _ => {
            if (document.visibilityState == 'visible') {
                if (!isActive) {
                    isActive = true
                    Howler.mute(false);
                }
            } else {
                if (isActive) {
                    isActive = false
                    Howler.mute(true);
                }
            }
        })
        window.addEventListener('focus', _ => {
            if (!isActive) {
                isActive = true
                Howler.mute(false);
            }
        }, false)
        window.addEventListener('blur', _ => {
            if (isActive) {
                isActive = false
                Howler.mute(true);
            }
        }, false)
    }
}

export default class Sound {
    constructor(opt = {
        name,
        parent,
        url,
        loop,
        volume,
        onLoaded
    }) {
        if (!window.SoundEngine) {
            new SoundEngine();
        }

        this.name = opt.name || null;
        this.howl = new Howl({
            src: [opt.url],
            autoplay: false,
            preload: true,
            loop: opt.loop ? opt.loop : false,
            volume: opt.volume ? opt.volume : 1.0,
        })
        this.parent = opt.parent ? opt.parent : null; //Parent mush be THREE object to get 3D position
        this.nominalVolume = opt.volume ? opt.volume : 1.0;
        this.howl.once('load', function() {
            if (typeof onLoaded == 'function')
                onLoaded();
        });
    }

    play(fadeLength) {
        if (fadeLength == undefined)
            fadeLength = 0;
        this.howl.volume(.0);
        this.howl.play();
        this.howl.fade(0, this.nominalVolume, fadeLength);
    }

    stop(fadeLength) {
        if (fadeLength == undefined)
            fadeLength = 60;
        this.howl.fade(this.nominalVolume, 0, fadeLength);
    }

    destroy() {
        this.name = null;
        this.howl.unload();
        this.howl = null;
        this.parent = null;
        this.nominalVolume = null;
    }
}