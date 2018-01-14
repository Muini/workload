import * as THREE from 'three';

export default class Object {
    constructor(opt = {
        name,
        modelUrl,
    }) {
        this.name = opt.name;
        this.modelUrl = opt.modelUrl || undefined;
        this.model = undefined;

        this.preload(_ => {
            this.init();
        });
    }

    preload(callback) {
        callback();
    }

    init() {

    }

    setParent() {

    }

    update(time) {

    }

    onClicked() {

    }
}