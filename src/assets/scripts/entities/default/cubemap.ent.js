import * as THREE from 'three';

import Engine from '../../engine/core/engine';
import Quality from '../../engine/core/quality';
import Entity from '../../engine/classes/entity';

export class Cubemap extends Entity {
    constructor(opt = {}) {
        super(opt);

        //Init variables
        this.name = 'cubemap';

        let resolution = opt.resolution || 128;
        let shouldUpdate = opt.shouldUpdate;
        let tickRate = opt.tickRate || 2;

        resolution /= Quality.settings.cubemaps.resolutionDivider;
        tickRate *= Quality.settings.cubemaps.resolutionDivider;
        shouldUpdate = Quality.settings.cubemaps.canBeRealtime ? shouldUpdate : false;

        this.debug = opt.debug || false;

        this.cubeCamera1 = new THREE.CubeCamera(opt.near || 1, opt.far || 100000, resolution);
        this.cubeCamera1.name = 'Cubemap CubeCamera1';
        this.cubeCamera1.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
        this.cubeCamera1.rotation.x = -3.14 / 2;
        this.model.add(this.cubeCamera1);

        this.cubeCamera2 = new THREE.CubeCamera(opt.near || 1, opt.far || 100000, resolution);
        this.cubeCamera2.name = 'Cubemap CubeCamera1';
        this.cubeCamera2.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
        this.cubeCamera2.rotation.x = -3.14 / 2;
        this.model.add(this.cubeCamera2);


        this.texture = this.cubeCamera1.renderTarget.texture;

        this.shouldUpdate = shouldUpdate;
        this.tickRate = tickRate;
        this.tick = 0;

        this.hasBeenRendered = false;

        if(this.debug){
            let geometry = new THREE.SphereBufferGeometry(1, 16, 16);
            this.debugMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xffffff),
                roughness: 0.2,
                metalness: 1.0,
                envMap: this.texture,
                envMapIntensity: 10.0,
            });
            let debugSphere = new THREE.Mesh(geometry, this.debugMaterial);
            this.model.add(debugSphere);
        }
    }

    awake() {
        return (async() => {
            await super.awake();
        })();
    }

    update(time, delta) {
        if (this.hasBeenRendered) return;

        super.update(time, delta);

        if (this.tick % (this.tickRate < 2 ? 2 : this.tickRate) === 0) {
            this.cubeCamera2.visible = false;
            this.cubeCamera1.visible = true;
            this.cubeCamera2.update(Engine.renderer, this.scene.instance);
            this.texture = this.cubeCamera2.renderTarget.texture;
            if (!this.shouldUpdate) {
                this.hasBeenRendered = true;
            }
        } else {
            this.cubeCamera1.visible = false;
            this.cubeCamera2.visible = true;
            this.cubeCamera1.update(Engine.renderer, this.scene.instance);
            this.texture = this.cubeCamera1.renderTarget.texture;
        }
        if(this.debug)
            this.debugMaterial.envMap = this.texture;
        this.scene.setEnvMap(this.texture);

        this.tick++;
    }

}