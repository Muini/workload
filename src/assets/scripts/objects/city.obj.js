import * as THREE from 'three';

import Engine from '../engine/engine';

import Object from '../engine/object';

import SwayShader from '../../shaders/sway/SwayShader';

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
        this.materials['Leafs'] = new SwayShader({
            dithering: true,
        }, {
            "diffuse": { value: new THREE.Color(0x91C55C) },
            "roughness": { value: .7 },
            "metalness": { value: .0 },
            "time": { value: 1.0 },
            "swaySpeed": { value: 1.0 },
            "swayDirection": { value: new THREE.Vector3(30, -20) },
            "swayAngle": { value: 5.0 },
        });
        // console.log(this.materials['Leafs']);
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
            envMapIntensity: 5.,
        });
        this.materials['Glass'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xC4D8D8),
            roughness: .2,
            metalness: 0.9,
            dithering: true,
            envMapIntensity: 6.,
        });
        this.materials['Glass2'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xBCCCD4),
            roughness: .15,
            metalness: 0.95,
            dithering: true,
            envMapIntensity: 6.,
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

        this.materials['Leafs'].uniforms['time'].value = time;
    }

}