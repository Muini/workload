import * as THREE from 'three';

import Engine from '../engine/core/engine';
import Random from '../engine/utils/random';

import Model from '../engine/classes/model';

export class Bonhomme extends Model {
    constructor(opt = {}) {
        super(opt);

        //Init variables
        this.name = 'bonhomme';
        this.modelName = 'bonhomme.model';
        this.hasShadows = true;

        // Init materials to be overwrite by name, second argument is 'isInstancedMaterial'
        this.addMaterial('Skin', false);
        this.addMaterial('Suit', true);
        this.addMaterial('Boots', true);
        this.addMaterial('Cloth', false);
        this.addMaterial('Hair', false);
        this.addMaterial('Metal', true);

        this.timeElapsed = 0;

        this.isFemale = false;

        this.skinColor = new THREE.Color();
        this.hairColor = new THREE.Color();
        this.clothColor = new THREE.Color();
    }

    created() {
        return (async () => {
            await super.created();

            await this.generateRandomLook();

        })();
    }

    generateRandomLook(){
        return (async () => {
            this.isFemale = Random.int(0, 1) ? true : false;

            this.skinColor.setHSL(Random.float(0.075, 0.1), Random.float(0.175, 0.35), Random.float(0.1, 0.65));
            if (Random.int(0, 6) === 0)
                this.hairColor.setHSL(Random.float(0.0, 1.0), Random.float(0.1, 0.4), Random.float(0.1, 0.7));
            else
                this.hairColor.setHSL(Random.float(0.075, 0.125), Random.float(0.1, 0.4), Random.float(0.1, 0.7));
            this.clothColor.setHSL(Random.float(0.0, 1.0), Random.float(0.2, 0.5), Random.float(0.1, 0.6));

            let scalar = this.isFemale ? 0.05 : 0.0
            this.model.scale.setScalar(Random.float(0.95 - scalar, 1.05 - scalar));

            this.materials.get('Skin').params.color = this.skinColor.getHexString();
            this.materials.get('Hair').params.color = this.hairColor.getHexString();
            this.materials.get('Cloth').params.color = this.clothColor.getHexString();

            let fbody = await this.getChildModel('Body_Female');
            let mbody = await this.getChildModel('Body_Male');
            if(this.isFemale){
                fbody[0].visible = true;
                mbody[0].visible = false;
            }else{
                fbody[0].visible = false;
                mbody[0].visible = true;
            }

            let props = await this.getChildModel('Prop');
            for (let index in props) {
                props[index].visible = false;
            }
            
            let hairs = await this.getChildModel(this.isFemale ? 'Prop_Hair_Woman' : 'Prop_Hair_Man');
            this.setRandomItemFromListVisible(hairs, true);

            if(!this.isFemale){
                let facialhairs = await this.getChildModel('Prop_Hair_Facial');
                this.setRandomItemFromListVisible(facialhairs, true);
            }

            let bodyitems = await this.getChildModel('Prop_Body');
            this.setRandomItemFromListVisible(bodyitems, true);

            let headitems = await this.getChildModel('Prop_Head');
            this.setRandomItemFromListVisible(headitems, true);
        })();
    }

    setRandomItemFromListVisible(list, canBeNothing) {
        const randomIndex = Random.int(canBeNothing ? -1 : 0, list.length - 1);
        if(randomIndex === -1) return false;
        return list[randomIndex].visible = true;
    }

    awake() {
        return (async () => {
            await super.awake();
            // Is fired when the scene is starting
        })();
    }

    update(time, delta) {
        super.update(time, delta);

        this.timeElapsed += delta;

        if(this.timeElapsed > 500){
            this.generateRandomLook();
            this.timeElapsed = 0;
        }
    }

}