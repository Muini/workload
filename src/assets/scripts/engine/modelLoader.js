import GLTFLoader from '../vendors/GLTFLoader';

class ModelLoader {
    constructor(opt = {}) {
        this.loader = new THREE.GLTFLoader();
    }

    load(modelUrl, callback) {
        this.loader.load(modelUrl,
            (gltf) => {
                console.log(modelUrl, gltf);
                callback(gltf);
            });
    }
}

export default new ModelLoader();