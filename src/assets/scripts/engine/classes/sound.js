import { Howl, Howler } from 'howler';

import UUID from '../utils/uuid';
import Log from '../utils/log';
import SoundEngine from '../core/soundEngine';

// TODO: Inherit Entity class when Entity class has been lighten
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
        if (!this.parent) return Log.push('error', this.constructor.name, `Sound parameter "parent" is mandatory and should be a Entity or Scene type`);
        this.scene = this.parent.isScene ? this.parent : this.parent.scene;
        this.nominalVolume = opt.volume ? opt.volume : 1.0;

        this.wasPlaying = false;

        this.init();
    }

    init() {
        // Add the sound to the scene, either if the parent is an entity or not
        if (this.parent.isScene) {
            this.scene.addSound(this);
        } else {
            // If its an entity, add it to the entity for quick ref and to the scene for preloading
            this.parent.sounds.set(this.name, this);
            this.scene.addSound(this);
        }
        SoundEngine.register(this);
    }

    load(callback) {
        this.howl.once('load', _ => {
            if (typeof callback == 'function')
                callback();
        });
        this.howl.on('end', _ => {
            this.isPlaying = false;
            this.wasPlaying = false;
        })
        this.howl.load();
    }

    play(fadeLength) {
        this.howl.volume(.0);
        this.howl.play();
        this.howl.fade(0, this.nominalVolume, fadeLength ? fadeLength : 0);
    }

    pause(){
        this.wasPlaying = true;
        this.howl.pause();
    }

    setRate(rate){
        this.howl.rate(rate);
    }

    resume(){
        if(!this.wasPlaying) return;
        this.wasPlaying = false;
        this.howl.play();
    }

    stop(fadeLength) {
        this.wasPlaying = false;
        this.howl.once('fade', _ => {
            this.howl.stop();
        });
        this.howl.fade(this.nominalVolume, 0, fadeLength ? fadeLength : 60);
    }

    destroy() {
        this.stop();
        SoundEngine.unregister(this);
        this.uuid = null;
        this.name = null;
        this.howl.unload();
        this.howl = null;
        this.parent = null;
        this.nominalVolume = null;
    }
}