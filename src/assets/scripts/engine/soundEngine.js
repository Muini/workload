import { Howl, Howler } from 'howler';

class SoundEngine {
    constructor(opt = {
        // datas
    }) {
        this.sounds = {};

        // this.registerSounds();

        this.bindEvents();
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

export default new SoundEngine();