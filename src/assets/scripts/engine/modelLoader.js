import * as THREE from 'three';

import GLTFLoader from '../vendors/GLTFLoader';

class ModelLoader {
    constructor(opt = {}) {
        this.loader = new THREE.GLTFLoader();
    }

    load(modelUrl, onFinished, onUpdate) {
        this.loader.load(modelUrl,
            (gltf) => {
                // console.log(modelUrl, gltf);
                onFinished(gltf);
            },
            (xhr) => {
                onUpdate(xhr.loaded, xhr.total);
            },
            (error) => {
                console.error('GLTF Loader error :', error);
            },
        );
    }
}

export default new ModelLoader();