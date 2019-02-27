import * as THREE from 'three';
import { AnimationAction } from 'three/src/animation/AnimationAction'

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

        this._actions = new Map();

        // console.log(THREE)

        this.animations.forEach((clip) => {
            clip.optimize();
            // this.instance.clipAction(clip);
            let action = new AnimationAction(this.instance, clip);
            action.weight = 0;
            action.clampWhenFinished = true;
            this._actions.set(clip.name, action);
        });

        this._currentAction = undefined;

        this.skeleton = new THREE.SkeletonHelper(this.model);
        this.skeleton.visible = false;

        this.model.add(this.skeleton);
    }

    play(animationName, fadeDuration = .3, isLooping = false) {
        return new Promise((resolve, reject) => {
            let action = this._actions.get(animationName);

            if (!action) {
                Log.push('warn', this, `Animation action c:orange{${animationName}} hasn't been found`)
                return reject();
            };

            // console.log('play action', action._clip.name, this._currentAction ? this._currentAction._clip.name : '')

            action.setLoop(isLooping ? THREE.LoopRepeat : THREE.LoopOnce)
            
            action.enabled = true;
            action.paused = false;
            action.timeScale = 1;
            action.weight = 1;
            action.play();

            if (this._currentAction)
                action.crossFadeFrom(this._currentAction, fadeDuration, true);
            else
                action.fadeIn(fadeDuration);

            this._currentAction = action;

            this.instance.addEventListener('finished', _ => {
                resolve();
            });
        })
    }

    stop(animationName, duration) {
        let action = this._actions.get(animationName);

        if (!action) {
            Log.push('warn', this, `Animation action c:orange{${animationName}} hasn't been found`)
            return reject();
        };

        action.fadeOut(duration);
    }

    stopAll(){
        this.instance.stopAllAction();
    }

    pauseCurrent() {
        if(!this._currentAction) return;
        this._currentAction.paused = true;
    }

    continueCurrent() {
        if (!this._currentAction) return;
        this._currentAction.paused = false;
    }

    setSpeed(speed){
        this._currentAction.timeScale = speed || 1.0;
    }

    update(time, delta) {
        this.instance.update(delta / 1000)
    }

    destroy() {
        this.stop();
        this.mixer.uncacheRoot(this.model);
        this.animations = null;
        this.instance = null;
        this.parent = null;
        this.isPlaying = null;
    }
}