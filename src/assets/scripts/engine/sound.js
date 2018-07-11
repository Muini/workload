import { Howl, Howler } from 'howler';

import Engine from './engine';
import UUID from './utils/uuid';
import SoundEngine from './soundEngine';

export default class Sound {
    constructor(opt = {
        name,
        parent,
        url,
        loop,
        volume,
    }) {
        this.uuid = UUID();
        this.name = opt.name || null;
        this.howl = new Howl({
            src: [opt.url],
            autoplay: false,
            preload: false,
            loop: opt.loop ? opt.loop : false,
            volume: opt.volume ? opt.volume : 1.0,
        })
        this.parent = opt.parent ? opt.parent : null; //Parent mush be THREE object to get 3D position
        if (!this.parent) throw 'Sound parameter "parent" is mandatory and should be a Object or Scene type';
        this.scene = this.parent.isScene ? this.parent : this.parent.scene;
        this.nominalVolume = opt.volume ? opt.volume : 1.0;

        this.init();
    }

    init() {
        // Add the sound to the scene, either if the parent is an object or not
        if (this.parent.isScene) {
            this.scene.addSound(this);
        } else {
            // If its an object, add it to the object for quick ref and to the scene for preloading
            this.parent.sounds[this.name] = this;
            this.scene.addSound(this);
        }
    }

    load(callback) {
        this.howl.once('load', _ => {
            if (typeof callback == 'function')
                callback();
        });
        this.howl.load();
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