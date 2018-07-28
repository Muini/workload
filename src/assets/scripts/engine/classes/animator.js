import * as THREE from 'three';

import Log from '../utils/log';

export default class Animator {
    constructor(opt = {
        model,
        animations
    }) {

        this.model = opt.model;
        if (!this.model) return Log.push('error', this.constructor.name, `Animator parameter "model" is mandatory and should be a Entity or Scene type`);

        this.animations = opt.animations || undefined;

        this.instance = new THREE.AnimationMixer(this.model);

        this.currentAction = undefined;

        this.isPlaying = false;

    }

    play(animationName, callback) {

        let clip = THREE.AnimationClip.findByName(this.animations, animationName);

        if (!clip) return;

        this.currentAction = this.instance.clipAction(clip);
        this.currentAction.play();

        this.isPlaying = true;
    }

    setSpeed(speed){
        this.currentAction.timeScale = speed || 1.0;
    }

    pause() {
        if (!this.isPlaying) return;
        this.currentAction.paused = true;
    }

    stop() {
        if (!this.isPlaying) return;
        this.instance.stopAllAction();
        this.currentAction = undefined;
        this.isPlaying = false;
    }

    update(time, delta) {
        this.instance.update(delta / 1000)
    }

    destroy() {
        this.stop();
        this.animations = null;
        this.instance = null;
        this.parent = null;
        this.isPlaying = null;
    }
}