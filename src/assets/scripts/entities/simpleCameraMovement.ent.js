import * as THREE from 'three';

import Entity from '../engine/classes/entity';
import Input from '../engine/core/input';
import Log from '../engine/utils/log';

export class SimpleCameraMovement extends Entity {
    constructor(opt) {
        super(opt);
        //Init variables
        this.name = 'simpleCameraMovement';

        this.camera = opt.camera || undefined;
        if(!this.camera) return Log.push('error', this, `Simple camera movement must have a camera has parameter`);

        this.pos = {
            lon: 0,
            lat: 0,
            phi: 0,
            theta: 0,
        }

        this.easeFactor = opt.easeFactor || 0.06;
        this.amplitude = opt.amplitude || 20.0;

        this.target = opt.target || new THREE.Vector3();

        this.canMove = false;

        this.offsetVector = new THREE.Vector3();

    }

    setActive(bool){
        return (async () => {
            await super.setActive(bool);
            this.canMove = bool;
        })();
    }

    enableControls(){
        this.canMove = true;
    }

    disableControls(){
        this.canMove = false;
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

    update(time, delta) {
        super.update(time, delta);

        const posX = this.canMove ? Input.mouse.relX : 0.0;
        const posY = this.canMove ? Input.mouse.relY : 0.0;
        
        this.pos.lon += ((posX * this.amplitude) - this.pos.lon) * this.easeFactor;
        this.pos.lat += ((-posY * this.amplitude) - this.pos.lat) * this.easeFactor;

        this.pos.lat = Math.max(-90, Math.min(90, this.pos.lat));
        this.pos.phi = THREE.Math.degToRad(90 - this.pos.lat);
        this.pos.theta = THREE.Math.degToRad(this.pos.lon - 90);
        this.offsetVector.x = THREE.Math.lerp(this.offsetVector.x, this.amplitude * Math.sin(this.pos.phi) * Math.cos(this.pos.theta), this.easeFactor);
        this.offsetVector.y = THREE.Math.lerp(this.offsetVector.y, this.amplitude * Math.cos(this.pos.phi), this.easeFactor);
        this.offsetVector.z = THREE.Math.lerp(this.offsetVector.z, this.amplitude * Math.sin(this.pos.phi) * Math.sin(this.pos.theta), this.easeFactor);

        const newTarget = new THREE.Vector3().addVectors(this.target, this.offsetVector);

        this.camera.instance.lookAt(newTarget);
    }

}