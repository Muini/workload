import { Howl, Howler } from 'howler';

class SoundManager {
    constructor(opt = {
        // datas
    }) {
        this.sounds = new Map();
        this.playingSounds = [];
    }

    register(sound){
        this.sounds.set(sound.uuid, sound);
    }

    unregister(sound){
        this.sounds.delete(sound.uuid);
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
}

export default new SoundManager();