import GLTFLoader from '../vendors/GLTFLoader';

class ModelLoader {
    constructor(opt = {}) {
        this.loader = new THREE.GLTFLoader();
    }

    load(modelUrl, callback) {
        this.loader.load(modelUrl,
            (data) => {
                // console.log(data);
                data.scene.children[0].rotation.z = 3.14 * 2;
                callback(data.scene.children[0]);
            });
    }
}

export default new ModelLoader();