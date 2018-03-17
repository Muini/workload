import * as THREE from 'three';

import Engine from '../engine/engine';

import Object from '../engine/object';

export class City extends Object {
    constructor(opt = {}) {
        super(opt);
    }

    init() {
        //Init variables
        this.name = 'city';
        this.modelName = 'city.model';
        this.hasShadows = true;

        // Init materials to be overwrite by name
        this.materials['Grass'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x798B4D),
            roughness: .6,
            metalness: .0,
            dithering: true,
        });
        this.materials['Floor'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x1F241F),
            roughness: .75,
            metalness: .0,
            dithering: true,
        });
        this.materials['Leafs'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x91C55C),
            roughness: .6,
            metalness: .0,
            dithering: true,
        });
        this.materials['Concrete'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x9E9B96),
            roughness: .9,
            metalness: .0,
            dithering: true,
        });
        this.materials['Roof'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x818F8F),
            roughness: .9,
            metalness: .5,
            dithering: true,
        });
        this.materials['Metal'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x888888),
            roughness: .7,
            metalness: 1.0,
            dithering: true,
        });
        this.materials['Glass'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xC4D8D8),
            roughness: .2,
            metalness: 0.9,
            dithering: true,
            envMapIntensity: 5.,
        });
        this.materials['Glass2'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xBCCCD4),
            roughness: .2,
            metalness: 0.9,
            dithering: true,
            envMapIntensity: 5.,
        });

        super.init();

        // Define & init here custom variables
    }

    awake() {
        super.awake();

        // Is fired when the object is added to the scene
    }

    update(time, delta) {
        super.update(time, delta);
    }

}