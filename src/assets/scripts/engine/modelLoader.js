import * as THREE from 'three';

import '../vendors/GLTFLoader';
import Log from './utils/log';

class ModelLoader {
    constructor(opt = {}) {
        this.loader = new THREE.GLTFLoader();
    }

    load(modelUrl, onFinished, onUpdate) {
        return (async() => {
            return this.loader.load(modelUrl,
                (gltf) => {
                    // console.log(modelUrl, gltf);
                    onFinished(gltf);
                },
                (xhr) => {
                    onUpdate(xhr.loaded, xhr.total);
                },
                (error) => {
                    Log.push('error', this.constructor.name, `GLTF Loader error : ${error}`);
                },
            );
        })();
    }
}

export default new ModelLoader();