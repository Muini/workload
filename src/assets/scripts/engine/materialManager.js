import Log from './utils/log';

class MaterialManager {
    constructor() {
        this.materials = new Map();
    }

    register(mat) {
        this.materials.set(mat.name, mat);
    }

    get(materialName) {
        const material = this.materials.get(materialName);
        if (!material) Log.push('error', this.constructor.name, `Material ${materialName} does not exist or is not registered`);
        return material;
    }
}

export default new MaterialManager();