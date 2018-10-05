import * as THREE from 'three';

import Engine from '../../engine/core/engine';
import Quality from '../../engine/core/quality';
import Entity from '../../engine/classes/entity';

export class Light extends Entity{
    constructor(opt = {}) {
        super(opt);

        this.name = opt.name || 'unnamed light';
        this.type = opt.type ? opt.type.toLowerCase() : 'point';

        this.scene = this.parent.isScene ? this.parent : this.parent.scene;

        this.isLight = true;

        this.params = {
            color: opt.color || 'ffffff',
            colorGround: opt.colorGround || '000000', //only for ambiant
            power: opt.power || 200,
            fov: opt.fov || undefined,
            distance: opt.distance || 4.0,
            castShadow: opt.castShadow || false,
            shadowMapSize: opt.shadowMapSize || (this.type === 'point' ? 16 : 128),
            shadowCameraSize: opt.shadowCameraSize || 50,
        }

        if (Engine.renderer.physicallyCorrectLights){
            this.params.power *= 3.0;
            this.params.distance *= 3.0;
        }

        switch (this.type) {
            case 'spot':
                this.instance = new THREE.SpotLight('#' + this.params.color);
                this.instance.decay = 2;
                this.instance.penumbra = 0.5;
                this.instance.power = this.params.power;
                this.instance.castShadow = Quality.score >= 1500 ? this.params.castShadow : false;
                if(this.params.fov !== undefined) this.instance.angle = this.params.fov;
                break;

            case 'directional':
                this.instance = new THREE.DirectionalLight('#' + this.params.color, this.params.power);
                this.instance.shadow.camera.left = -this.params.shadowCameraSize; // default
                this.instance.shadow.camera.right = this.params.shadowCameraSize; // default
                this.instance.shadow.camera.top = this.params.shadowCameraSize; // default
                this.instance.shadow.camera.bottom = -this.params.shadowCameraSize; // default
                this.instance.shadow.camera.far = 1000;
                this.instance.castShadow = Quality.score >= 500 ? this.params.castShadow : false;
                break;

            case 'ambient':
                this.instance = new THREE.HemisphereLight('#' + this.params.color, '#' + this.params.colorGround, this.params.power);
                break;

            default:
            case 'point':
                this.instance = new THREE.PointLight('#' + this.params.color, 1.0, this.params.distance, 2);
                this.instance.power = this.params.power;
                this.instance.castShadow = Quality.score >= 4000 ? this.params.castShadow : false;
                break;
        }
        this.instance.name = this.name;

        if (!this.instance.isHemisphereLight){
            this.instance.shadow.mapSize.y = this.params.shadowMapSize / Quality.settings.shadows.resolutionDivider;
            this.instance.shadow.mapSize.x = this.params.shadowMapSize / Quality.settings.shadows.resolutionDivider;
        }

        if(!this.parent.isScene){
            this.parent.lights.set(this.name, this);
        }else{
            this.model.add(this.instance);
        }
    }

    created() {
        return (async () => {
            await super.created();
        })();
    }

    awake() {
        return (async () => {
            await super.awake();
        })();
    }

    setPower(newPower){
        this.params.power = newPower;
        switch (this.type) {
            case 'directional':
            case 'ambient':
                this.instance.intensity = this.params.power;
                break;

            default:
            case 'spot':
            case 'point':
                this.instance.power = this.params.power;
                break;
        }
    }

    setVisibility(visibility){
        console.log('setting visibility to', visibility, this.name)
        this.instance.visible = visibility;
    }

    setColor(newColor){
        this.params.color = newColor;
        this.instance.color.setHex('0x' + this.params.color);
    }

    setPosition(newPosition){
        this.params.position = newPosition;
        this.instance.position.set(this.params.position)
    }

    setRotation(newRotation) {
        this.params.rotation = newRotation;
        this.instance.rotation.set(this.params.rotation)
    }

    setTarget(target){
        if(this.type != 'spot' && this.type != 'directional') return;
        this.instance.target = target;
    }
}