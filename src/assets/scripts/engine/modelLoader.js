import ColladaLoader from '../vendors/ColladaLoader';

class ModelLoader {
    constructor(opt = {}) {
        this.loader = new THREE.ColladaLoader();
    }

    load(modelUrl, materials, callback) {
        this.loader.load(modelUrl,
            (collada) => {
                // console.log(collada);
                for (let c = 0; c < collada.scene.children.length; c++) {
                    let child = collada.scene.children[c];
                    // Update lights to fit blender setup
                    this.updateLights(child);
                    // Replace materials
                    this.updateMaterials(child, materials);
                }

                callback(collada.scene);
            }, (xhr) => {});
    }

    updateLights(child) {
        if (child.type != 'PointLight') {
            child.castShadow = true;
            child.receiveShadow = true;
        }
        // console.log(child.type)
        if (child.type == 'SpotLight' || child.type == 'PointLight') {
            child.decay = 2;
            child.penumbra = 0.8;
            child.angle /= 2.;
            // child.intensity /= 1.5;
            // child.distance /= 2.0;
            if (child.type == 'PointLight') {
                child.distance = 5.0;
            }
        }
    }

    updateMaterials(child, materials) {
        if (child.type !== 'Mesh') return
        for (let n = 0; n < materials.length; n++) {

            if (child.material.length) {
                for (let m = 0; m < child.material.length; m++) {
                    // console.log(child.material[m].name)
                    if (materials[n].name == child.material[m].name) {
                        child.material[m] = materials[n];
                    }
                }
            } else {
                // console.log(child.material.name)
                if (materials[n].name == child.material.name) {
                    child.material = materials[n];
                }
            }

        }
    }
}

export default new ModelLoader();