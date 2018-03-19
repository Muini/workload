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
            color: new THREE.Color(0x505D2A),
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
            "diffuse": { value: new THREE.Color(0x557436) },
            "roughness": { value: .9 },
            "metalness": { value: .0 },
            "emissive": { value: new THREE.Color(0xABCC45) }, //Fake SSS
            "time": { value: 1.0 },
            "swayBlend": { value: 0.005 },
            "windForce": { value: new THREE.Vector3(20, -15) },
        });
        // console.log(this.materials['Leafs']);
        this.materials['Concrete'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x9E9691),
            roughness: .95,
            metalness: .0,
            dithering: true,
        });
        this.materials['Roof'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x818F8F),
            roughness: .8,
            metalness: .5,
            dithering: true,
            envMapIntensity: 2.,
        });
        this.materials['Metal'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x888888),
            roughness: .7,
            metalness: 1.0,
            dithering: true,
            envMapIntensity: 5.,
        });
        this.materials['White Metal'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xD1D1D1),
            roughness: .6,
            metalness: 1.0,
            dithering: true,
            envMapIntensity: 6.,
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
            roughness: .25,
            metalness: 0.9,
            dithering: true,
            envMapIntensity: 6.,
        });
        this.materials['Clouds'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xE7E7E7),
            emissive: new THREE.Color(0xC1D1DA),
            transparent: true,
            opacity: 0.4,
            fog: false,
            // lights: false,
            emissiveIntensity: 5
        })

        super.init();

        // Define & init here custom variables
    }

    awake() {
        super.awake();

        this.eoMotors = [];
        this.clouds = [];
        this.model.traverse((child) => {
            if (child.name.indexOf('Eolienne_motor') > -1) {
                this.eoMotors.push(child)
            }
            if (child.name.indexOf('Cloud') > -1) {
                this.clouds.push(child)
            }
        });
        for (let i = 0; i < this.eoMotors.length; i++) {
            this.eoMotors[i].rotation.x += Math.random() * 3.14;
        }

        // Is fired when the object is added to the scene
    }

    update(time, delta) {
        super.update(time, delta);

        this.materials['Leafs'].uniforms['time'].value = time;
        for (let i = 0; i < this.eoMotors.length; i++) {
            this.eoMotors[i].rotation.x += 0.005 * 3.14;
        }
        for (let i = 0; i < this.clouds.length; i++) {
            this.clouds[i].position.x += Math.cos(time * .000001) / 20.;
        }
    }

}