import * as THREE from 'three';
import Engine from '../core/engine.js';

// Timeline is meant to be used as Sequence
// You can add virtual camera, object animations, sounds and music.
export default class Timeline {
    constructor(opt = {
        onFinished
    }) {

        this.cameras = {};
        this.animations = {};
        this.sounds = {};
        this.musics = {};

        this.isPlaying = false;

        this.onFinished = opt.onFinished || function() {};

    }

    add(fct, timestamp) {}

    start() {}

    pause() {}

    stop() {}
}