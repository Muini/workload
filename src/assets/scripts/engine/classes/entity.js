import * as THREE from 'three';
import Engine from '../core/engine';
import Log from '../utils/log';
import UUID from '../utils/uuid';
import Data from '../utils/data';

// TODO: ECS based system : http://www.vasir.net/blog/game-development/how-to-build-entity-component-system-in-javascript
// http://aras-p.info/texts/files/2018Academy%20-%20ECS-DoD.pdf
export default class Entity {
    constructor(opt = {
        parent,
        position,
        rotation,
        active,
    }) {
        this.uuid = UUID();
        this.name = opt.name || 'unnamed entity';

        this.model = new THREE.Group();

        this.sounds = new Map();
        this.lights = new Map();
        this.data = new Data();

        this.isStatic = false;
        this.isActive = opt.active || true;
        this.isVisible = false;

        this.isEntity = true;

        this.parent = opt.parent || undefined;
        // if (!this.parent) Log.push('warn', this, `Entity parameter "parent" is mandatory and should be a Object or Scene type`);
        this.scene = this.parent ? (this.parent.isScene ? this.parent : this.parent.scene) : null;
        this._children = [];

        this.position = opt.position || new THREE.Vector3(0, 0, 0);
        this.rotation = opt.rotation || new THREE.Vector3(0, 0, 0);

        this._isUpdating = false;

        //Add object to the parent as children, and to the scene to register it
        if(this.scene) this.scene.addEntity(this);
        if(this.parent) this.parent.addChildren(this);
    }

    addChildren(child) {
        this._children.push(child);
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
            //Name it properly
            this.model.name = this.name;

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
            if(this.parent){
                if ( this.parent.isScene) {
                    this.scene.instance.add(this.model);
                } else {
                    this.parent.model.add(this.model);
                }
            }

            // Create children now
            if (this._children.length > 0){
                await Promise.all(this._children.map(async child => {
                    await child.created()
                }))
            }

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
            if (this._children.length > 0){
                await Promise.all(this._children.map(async child => {
                    await child.awake()
                }))
            }
        })();
    }

    findEntityByName(name){
        return this._children.filter(item => item.name === name)[0];
    }

    findEntityById(uuid) {
        return this._children.filter(item => item.uuid === uuid)[0];
    }

    setPosition(x = null, y = null, z = null) {
        // TODO: Create set position & rotation methods to avoid THREE implementation
        // if (x != null)
        //     this.model.position.setX(x);
        // if (y != null)
        //     this.model.position.setY(y);
        // if (z != null)
        //     this.model.position.setZ(z);
    }

    update(time, delta) {}

    destroy() {
        this.setActive(false);
        this._children.forEach(child => child.destroy());
        this.sounds.forEach((sound, index) => {
            sound.destroy();
        });
        this._children = [];
        this.name = null;
        this.model = null;
        this.lights = null;
        this.scene = null;
    }
}