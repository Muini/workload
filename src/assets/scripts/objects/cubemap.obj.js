import * as THREE from 'three';

import Engine from '../engine/engine';

import Object from '../engine/object';

export class Cubemap extends Object {
    constructor(opt = {}) {
        super(opt);
    }

    init(opt) {
        //Init variables
        this.name = 'cubemap';

        this.cubeCamera1 = new THREE.CubeCamera(opt.near || 1, opt.far || 100000, opt.resolution || 128);
        this.cubeCamera1.name = 'Cubemap CubeCamera1';
        this.cubeCamera1.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
        this.model.add(this.cubeCamera1);

        this.cubeCamera2 = new THREE.CubeCamera(opt.near || 1, opt.far || 100000, opt.resolution || 128);
        this.cubeCamera2.name = 'Cubemap CubeCamera1';
        this.cubeCamera2.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
        this.model.add(this.cubeCamera2);

        this.texture = this.cubeCamera2.renderTarget.texture;

        this.shouldUpdate = opt.shouldUpdate;
        this.tickRate = opt.tickRate || 2;
        this.tick = 0;

        this.hasBeenRendered = false;

        /*
        var geometry = new THREE.SphereBufferGeometry(2, 32, 32);
        this.debugMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xffffff),
            roughness: 0.2,
            metalness: 1.0,
            envMap: this.texture,
            envMapIntensity: 10.0,
        });
        var debugSphere = new THREE.Mesh(geometry, this.debugMaterial);
        this.model.add(debugSphere);
        */
        super.init(opt);
    }

    awake() {
        super.awake();

        // Is fired when the object is added to the scene
    }

    update(time, delta) {
        if (this.hasBeenRendered) return;

        super.update(time, delta);

        if (this.tick % (this.tickRate < 2 ? 2 : this.tickRate) === 0) {
            this.texture = this.cubeCamera2.renderTarget.texture;
            this.cubeCamera2.visible = false;
            this.cubeCamera1.visible = true;
            this.cubeCamera1.update(Engine.renderer, this.scene.instance);
        } else {
            this.texture = this.cubeCamera1.renderTarget.texture;
            this.cubeCamera1.visible = false;
            this.cubeCamera2.visible = true;
            this.cubeCamera2.update(Engine.renderer, this.scene.instance);
            if (!this.shouldUpdate)
                this.hasBeenRendered = true;
        }
        // this.debugMaterial.envMap = this.texture;
        this.scene.setEnvMap(this.texture);

        this.tick++;
    }

}