import GLTFLoader from '../vendors/GLTFLoader';

class ModelLoader {
    constructor(opt = {}) {
        this.loader = new THREE.GLTFLoader();
    }

    load(modelUrl, materials, lights, hasShadows, callback) {
        this.loader.load(modelUrl,
            (data) => {
                console.log(data);
                data.scene.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = hasShadows;
                        child.receiveShadow = true;
                        this.updateMaterials(child, materials);
                    } else {
                        this.updateLights(child, lights);
                    }
                });
                data.scene.children[0].rotation.z = 3.14 * 2;
                callback(data.scene.children[0]);
            });
    }

    updateLights(child, lights) {
        if (child.type != 'SpotLight' && child.type != 'PointLight' && child.type != 'DirectionalLight') return;

        child.decay = 2;
        child.penumbra = 0.8;
        child.angle /= 2.;

        if (child.type == 'PointLight') {
            child.distance = 5.0;
        }
        console.log(child.name);
        //Overwrite lights
        for (let light in lights) {
            if (child.name == light) {
                child.color = lights[light].color;
                child.intensity = lights[light].intensity;
                child.castShadow = lights[light].castShadow;
                if (child.type == 'PointLight') {
                    child.distance = lights[light].distance;
                }
                lights[light] = child;
                child = lights[light];
            }
        }

    }

    updateMaterials(child, materials) {
        if (child.type !== 'Mesh') return

        //Overwrite materials
        for (let material in materials) {
            if (child.material.length) {
                for (let m = 0; m < child.material.length; m++) {
                    // console.log(child.material[m].name)
                    if (material == child.material[m].name) {
                        child.material[m] = materials[material];
                    }
                }
            } else {
                // console.log(child.material.name)
                if (material == child.material.name) {
                    child.material = materials[material];
                }
            }
        }
    }
}

export default new ModelLoader();