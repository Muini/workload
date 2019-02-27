import * as THREE from 'three';

import Entity from '../engine/classes/entity';
import Input from '../engine/core/input';
import Log from '../engine/utils/log';

export class RTSCameraMovement extends Entity {
    constructor(opt) {
        super(opt);
        //Init variables
        this.name = 'RTSCameraMovement';

        this.camera = opt.camera || undefined;
        if (!this.camera) return Log.push('error', this, `RTS camera movement must have a camera has parameter`);

        this.target = {
            fov: this.camera.instance.fov,
            position: new THREE.Vector3().copy(this.camera.model.position)
        }
        this.lastPos = {
            x: Input.mouse.x,
            y: Input.mouse.y
        }

        this.isDown = false;

        this.easeFactor = opt.easeFactor || 0.5;
        this.sensitivity = opt.sensitivity || 1.0;

        this.canMove = false;

        this.offsetVector = new THREE.Vector3();
    }

    setActive(bool) {
        return (async _ => {
            await super.setActive(bool);
            this.canMove = bool;
            this.target.position = new THREE.Vector3().copy(this.camera.model.position);
            this.target.fov = this.camera.instance.fov;
            this.lastPos.x = Input.mouse.x;
            this.lastPos.y = Input.mouse.y;
        })();
    }

    enableControls() {
        this.canMove = true;
    }

    disableControls() {
        this.canMove = false;
    }

    moveTo(newPosition) {
        this.target.position = newPosition;
    }
    setFovTo(newFov){
        this.target.fov = newFov;
    }

    created() {
        return (async _ => {
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

        if(this.canMove){
            this.target.fov -= Input.mouse.wheelDelta * this.sensitivity / 100;
            if(this.target.fov <= 12) this.target.fov = 12;
            if(this.target.fov >= 20) this.target.fov = 20;
            if(this.isDown){
                this.target.position.z += (Input.mouse.y - this.lastPos.y) * this.sensitivity / 10
                this.target.position.x += (Input.mouse.x - this.lastPos.x) * this.sensitivity / 10
            }
        }

        this.camera.model.position.z = THREE.Math.lerp(this.camera.model.position.z, this.target.position.z, this.easeFactor);
        this.camera.model.position.x = THREE.Math.lerp(this.camera.model.position.x, this.target.position.x, this.easeFactor);
        this.camera.instance.fov = THREE.Math.lerp(this.camera.instance.fov, this.target.fov, this.easeFactor / 2);
        this.camera.instance.updateProjectionMatrix();
        
        this.isDown = Input.mouse.isDown;

        this.lastPos.x = Input.mouse.x;
        this.lastPos.y = Input.mouse.y;
    }

}