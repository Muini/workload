class MaterialManager{
    constructor(){
        this.materials = new Map();
    }

    register(mat){
        this.materials.set(mat.name, mat);
    }
}

export default new MaterialManager();