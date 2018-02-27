import { Howl, Howler } from 'howler';

import SoundEngine from './soundEngine';

export default class Sound {
    constructor(opt = {
        name,
        parent,
        url,
        loop,
        volume,
        onLoaded
    }) {
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