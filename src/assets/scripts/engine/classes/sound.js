import { Howl, Howler } from 'howler';

import UUID from '../utils/uuid';
import Log from '../utils/log';
import SoundManager from '../core/soundManager';

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
        this._howl = new Howl({
            src: [opt.url],
            autoplay: false,
            preload: false,
            loop: opt.loop ? opt.loop : false,
            volume: opt.volume ? opt.volume : 1.0,
        })
        this.parent = opt.parent ? opt.parent : null; //Parent mush be THREE object to get 3D position
        if (!this.parent) return Log.push('error', this.constructor.name, `Sound parameter "parent" is mandatory and should be a Entity or Scene type`);
        this.scene = this.parent.isScene ? this.parent : this.parent.scene;
        this._nominalVolume = opt.volume ? opt.volume : 1.0;

        this._wasPlaying = false;

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
        SoundManager.register(this);
    }

    load(callback) {
        this._howl.once('load', _ => {
            if (typeof callback == 'function')
                callback();
        });
        this._howl.on('end', _ => {
            this.isPlaying = false;
            this._wasPlaying = false;
        })
        this._howl.load();
    }

    play(fadeLength) {
        this._howl.volume(.0);
        this._howl.play();
        this._howl.fade(0, this._nominalVolume, fadeLength ? fadeLength : 0);
    }

    pause(){
        this._wasPlaying = true;
        this._howl.pause();
    }

    setRate(rate){
        this._howl.rate(rate);
    }

    resume(){
        if(!this._wasPlaying) return;
        this._wasPlaying = false;
        this._howl.play();
    }

    stop(fadeLength) {
        this._wasPlaying = false;
        this._howl.once('fade', _ => {
            this._howl.stop();
        });
        this._howl.fade(this._nominalVolume, 0, fadeLength ? fadeLength : 60);
    }

    destroy() {
        this.stop();
        SoundManager.unregister(this);
        this.uuid = null;
        this.name = null;
        this._howl.unload();
        this._howl = null;
        this.parent = null;
        this._nominalVolume = null;
    }
}