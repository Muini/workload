import * as THREE from 'three';
import Engine from '../core/engine';
import Log from '../utils/log';
import UUID from '../utils/uuid';

export default class Entity {
    constructor(opt = {
        parent,
        position,
        rotation,
        active,
    }) {
        this.uuid = UUID();
        this.name = 'unnamed entity';

        this.model = new THREE.Group();

        this.sounds = new Map();
        this.lights = new Map();

        this.isStatic = false;
        this.isActive = opt.active || true;
        this.isVisible = false;

        this.isEntity = true;

        this.parent = opt.parent || undefined;
        if (!this.parent) return Log.push('error', this.constructor.name, `Entity parameter "parent" is mandatory and should be a Object or Scene type`);
        this.scene = this.parent.isScene ? this.parent : this.parent.scene;
        this.children = [];

        this.position = opt.position || new THREE.Vector3(0, 0, 0);
        this.rotation = opt.rotation || new THREE.Vector3(0, 0, 0);

        this._isUpdating = false;

        //Add object to the parent as children, and to the scene to register it
        this.scene.addEntity(this);
        this.parent.addChildren(this);
    }

    addChildren(child) {
        this.children.push(child);
    }

    setVisibility(bool) {
        this.model.visible = bool;
        this.isVisible = bool;
    }

    setActive(bool) {
        this.isActive = bool;
        if (this.isActive) {
            if (!this._isUpdating) {
                if(!this.isStatic)
                    Engine.addToUpdate(this.uuid, this.update.bind(this));
                this._isUpdating = true;
            }
        } else {
            if (this._isUpdating) {
                if (!this.isStatic)
                    Engine.removeFromUpdate(this.uuid);
                this._isUpdating = false;
            }
        }
        this.setVisibility(bool);
    }

    stopAllSounds() {
        this.sounds.forEach((sound, index) => {
            sound.stop();
        });
    }

    created() {
        return (async () => {

            // Set original coord
            this.model.position.x += this.position.x;
            this.model.position.y += this.position.y;
            this.model.position.z += this.position.z;
            this.model.rotation.x += this.rotation.x;
            this.model.rotation.y += this.rotation.y;
            this.model.rotation.z += this.rotation.z;

            if (this.isStatic)
                this.model.matrixAutoUpdate = false;

            // Add mesh instance to scene or parent
            if (this.parent.isScene) {
                this.scene.instance.add(this.model);
            } else {
                this.parent.model.add(this.model);
            }

            // Create children now
            if (this.children.length > 0)
                await Promise.all(this.children.map(async child => {
                    await child.created()
                }))

            // Awake
            if (this.scene && this.scene.isPlaying) {
                await this.awake();
            }
        })();
    }

    // Awake happen when the scene is loaded into the engine & started to be used
    awake() {
        return (async() => {
            this.setActive(this.isActive);
            // Awake children now
            if (this.children.length > 0){
                await Promise.all(this.children.map(async child => {
                    await child.awake()
                }))
            }
        })();
    }

    findEntityByName(name){
        return this.children.filter(item => item.name === name)[0];
    }

    findEntityById(uuid) {
        return this.children.filter(item => item.uuid === uuid)[0];
    }

    update(time, delta) {
    }

    onClicked() {
        if (!this.isActive) return;
    }

    destroy() {
        this.setActive(false);
        this.children.forEach(child => child.destroy());
        this.sounds.forEach((sound, index) => {
            sound.destroy();
        });
        this.children = [];
        this.name = null;
        this.model = null;
        this.lights = null;
        this.scene = null;
    }
}