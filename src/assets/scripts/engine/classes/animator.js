import * as THREE from 'three';

import Log from '../utils/log';

export default class Animator {
    constructor(opt = {
        model,
        animations
    }) {

        this.model = opt.model;
        if (!this.model) return Log.push('error', this, `Animator parameter "model" is mandatory and should be a Entity or Scene type`);

        this.animations = opt.animations || undefined;

        this.instance = new THREE.AnimationMixer(this.model);

        this._currentAction = undefined;

        this.isPlaying = false;

        this.skeleton = new THREE.SkeletonHelper(this.model);
        this.skeleton.visible = false;

        this.model.add(this.skeleton);

    }

    play(animationName, callback) {

        let clip = THREE.AnimationClip.findByName(this.animations, animationName);

        if (!clip) return;

        this._currentAction = this.instance.clipAction(clip);
        this._currentAction.play();

        this.isPlaying = true;
    }

    setSpeed(speed){
        this._currentAction.timeScale = speed || 1.0;
    }

    pause() {
        if (!this.isPlaying) return;
        this._currentAction.paused = true;
    }

    stop() {
        if (!this.isPlaying) return;
        this.instance.stopAllAction();
        this._currentAction = undefined;
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