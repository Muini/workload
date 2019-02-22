import * as THREE from 'three';

// import '../utils/GLTFLoader';
import 'three/examples/js/loaders/GLTFLoader';
import Log from '../utils/log';

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
                    Log.push('error', this, `GLTF Loader error : ${error}`);
                    console.log(error)
                },
            );
        })();
    }
}

export default new ModelLoader();