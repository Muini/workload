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

        this.isFemale = false; //La patriarchie vaincra !

        this.look = {
            skinColor: new THREE.Color(),
            hairColor: new THREE.Color(),
            clothColor: new THREE.Color(),
            heightFactor: 1.0,
            hair: -1,
            facialhair: -1,
            headObject: -1,
            bodyObject: -1,
        }
        this.props = {
            all: [],
            hair: [],
            womanhair: [],
            facialhair: [],
            headObjects: [],
            bodyObjects: [],
        }
        this.fbody = undefined;
        this.mbody = undefined;

        this.isOut = true;

    }

    created() {
        return (async () => {
            await super.created();

            this.model.rotation.y += Math.PI;

            this.fbody = await this.getChildModel('Body_Female');
            this.mbody = await this.getChildModel('Body_Male');
            
            await this.getProps();

            this.generateRandomLook();

            this.updateLook();

            // let bone = await this.getChildModel('Body');
            // bone = bone.filter(item => item.type === 'Bone')[0];
            // console.log(bone);

        })();
    }

    getProps(){        
        return (async () => {

            this.props.all = await this.getChildModel('Prop');
            
            this.props.hair = await this.getChildModel('Prop_Hair_Man');

            this.props.womanhair = await this.getChildModel('Prop_Hair_Women');
            this.props.womanhair = this.props.hair.concat(this.props.womanhair);
            this.props.womanhair = this.props.womanhair.filter(prop => prop.name.indexOf('Hat') === -1 && prop.name.indexOf('Short') === -1 && prop.name.indexOf('Special') === -1);

            this.props.facialhair = await this.getChildModel('Prop_Hair_Facial');

            this.props.bodyObjects = await this.getChildModel('Prop_Body');

            this.props.headObjects = await this.getChildModel('Prop_Head');
        })();
    }

    generateRandomLook(){
        // Sex
        this.isFemale = Random.int(0, 1) ? true : false;

        // Skin color
        this.look.skinColor.setHSL(Random.float(0.075, 0.1), Random.float(0.175, 0.35), Random.float(0.1, 0.65));

        // Hair color
        if (Random.int(0, 6) === 0)
            this.look.hairColor.setHSL(Random.float(0.0, 1.0), Random.float(0.1, 0.4), Random.float(0.1, 0.7));
        else
            this.look.hairColor.setHSL(Random.float(0.075, 0.125), Random.float(0.1, 0.4), Random.float(0.1, 0.7));

        // Cloth color
        this.look.clothColor.setHSL(Random.float(0.0, 1.0), Random.float(0.2, 0.5), Random.float(0.1, 0.6));

        // Height factor, female are a bit shorter than male, sorry ladies.
        let scalar = this.isFemale ? 0.05 : 0.0;
        this.look.heightFactor = Random.float(0.95 - scalar, 1.05 - scalar);

        // What kind of hair ?
        this.look.hair = this.isFemale ? 
                        Random.int(0, this.props.womanhair.length - 1) : 
                        Random.int(-1, this.props.hair.length - 1);

        // Facial hair
        this.look.facialhair = this.isFemale ? -1 : Random.int(-1, this.props.facialhair.length - 1);

        // Body props
        this.look.bodyObject = Random.int(-1, this.props.bodyObjects.length - 1);

        // Head props
        this.look.headObject = Random.int(-1, this.props.headObjects.length - 1);
    }

    updateLook(){
        // Hide everything
        for (let index in this.props.all) {
            this.props.all[index].visible = false;
        }

        this.model.scale.setScalar(this.look.heightFactor);

        if (this.isFemale) {
            if (this.fbody[0])
                this.fbody[0].visible = true;
            if (this.mbody[0])
                this.mbody[0].visible = false;
        } else {
            if (this.fbody[0])
                this.fbody[0].visible = false;
            if (this.mbody[0])
                this.mbody[0].visible = true;
        }

        this.materials.get('Skin').params.color = this.look.skinColor.getHexString();
        this.materials.get('Hair').params.color = this.look.hairColor.getHexString();
        this.materials.get('Cloth').params.color = this.look.clothColor.getHexString();

        if(this.look.hair > -1){
            if(this.isFemale){
                this.props.womanhair[this.look.hair].visible = true;
                // console.log(this.props.womanhair[this.look.hair].name)
            } else{
                this.props.hair[this.look.hair].visible = true;
                // console.log(this.props.hair[this.look.hair].name)
            }
        }

        if (this.look.facialhair > -1) {
            this.props.facialhair[this.look.facialhair].visible = true;
        }

        if (this.look.bodyObject > -1) {
            if(!this.isFemale){
                if(this.props.bodyObjects[this.look.bodyObject].name.indexOf('Women') === -1){
                    this.props.bodyObjects[this.look.bodyObject].visible = true;
                }
            }else{
                this.props.bodyObjects[this.look.bodyObject].visible = true;
            }
        }

        if (this.look.headObject > -1) {
            this.props.headObjects[this.look.headObject].visible = true;
        }

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
            if(this.isOut)
                this.setVisibility(false);
        })();
    }

    arriveAtDesk() {
        this.setVisibility(true);
        this.isOut = false;
        //TODO: Animation In (walk in & sit)
    }

    leaveFromDesk(){
        //TODO: Animation Out (sit up & walk away)
        this.setVisibility(false);
        this.isOut = true;
    }

    update(time, delta) {
        super.update(time, delta);
    }

}