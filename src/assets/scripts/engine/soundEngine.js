import { Howl, Howler } from 'howler';

class SoundEngine {
    constructor(opt = {
        // datas
    }) {
        this.sounds = new Map();
        this.playingSounds = [];

        this.bindEvents();
    }

    register(sound){
        this.sounds.set(sound.uuid, sound);
    }

    unregister(sound){
        this.sounds.get(sound.uuid).delete();
    }

    pause() {
        this.playingSounds = [];
        Howler.mute(true);
        this.sounds.forEach(sound => {
            if(sound.isPlaying){
                this.playingSounds.push(sound);
            }
        });
    }

    resume() {
        Howler.mute(false);
        this.playingSounds.forEach(sound => {
            sound.resume();
        });
    }

    bindEvents() {
        let isActive = true
        document.addEventListener('visibilitychange', _ => {
            if (document.visibilityState == 'visible') {
                if (!isActive) {
                    isActive = true
                    this.resume();
                }
            } else {
                if (isActive) {
                    isActive = false
                    this.pause();
                }
            }
        })
        window.addEventListener('focus', _ => {
            if (!isActive) {
                isActive = true
                this.resume();
            }
        }, false)
        window.addEventListener('blur', _ => {
            if (isActive) {
                isActive = false
                this.pause();
            }
        }, false)
    }
}

export default new SoundEngine();