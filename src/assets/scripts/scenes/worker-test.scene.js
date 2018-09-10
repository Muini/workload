import * as THREE from 'three';

// Engine
import Engine from '../engine/core/engine';
import MaterialManager from '../engine/core/materialManager';
import Scene from '../engine/classes/scene';
import { Ease, Tween } from '../engine/classes/tween';
import Random from '../engine/utils/random';

// Objects
import { Camera } from '../entities/default/camera.ent';
import { Light } from '../entities/default/light.ent';
import { Cubemap } from '../entities/default/cubemap.ent';
import { Bonhomme } from '../entities/bonhomme.ent';

// Create scene
export default new Scene({
    name: 'worker-test',
    data: {},
    setup: function() {
        // Create & Add camera
        this.camera = new Camera({
            parent: this,
            position: new THREE.Vector3(-1.5, 4.5, 15),
            rotation: new THREE.Vector3(0, 0, 0),
            focalLength: 50,
            focus: 42.0, //42
            aperture: 3.5,
        });
        // this.camera.model.rotation.y = (45 / 180) * 3.14;
        this.camera.instance.rotation.x = -(10 / 180) * 3.14;

        let cubemap = new Cubemap({
            parent: this,
            near: 1,
            far: 500,
            resolution: 128,
            position: new THREE.Vector3(0, 4, 0),
            shouldUpdate: false,
            tickRate: 2,
        });

        // Floor
        let floorGeometry = new THREE.PlaneGeometry(150, 150, 1, 1);
        let floorMaterial = MaterialManager.get('Floor').instance;
        let plane = new THREE.Mesh(floorGeometry, floorMaterial);
        plane.name = "Floor";
        plane.rotation.x = -3.14 / 2;
        plane.castShadow = true;
        plane.receiveShadow = true;
        this.instance.add(plane);

        // Ambient Light
        let ambiantLight = new Light({
            name: 'Ambient Light',
            parent: this,
            type: 'ambient',
            color: '2f364f',
            colorGround: '323b2e',
            power: 10.0,
        })

        this.spotLight = new Light({
            name: 'Spot Light',
            parent: this,
            type: 'spot',
            color: 'ffffff',
            power: 16.0,
            fov: Math.PI / 10,
            castShadow: true,
            shadowMapSize: 512,
            position: { x:10, y: 10, z: 10 }
        })
        this.rimLightColor = new THREE.Color(0x033ff);
        this.rimLight = new Light({
            name: 'Rim Light',
            parent: this,
            type: 'spot',
            color: '0033ff',
            power: 10.0,
            fov: Math.PI / 10,
            castShadow: true,
            shadowMapSize: 128,
            position: { x:-10, y: 2, z: -10 }
        })

        let loader = new THREE.FontLoader();
        loader.load('/static/fonts/quattrocento.json', (font) => {
            let textGeometry = new THREE.TextGeometry('Character Creation', {
                font: font,
                size: 40,
                height: 20,
                curveSegments: 4,
                bevelEnabled: false,
                bevelThickness: 10,
                bevelSize: 0.5,
                bevelSegments: 1
            });
            this.textMaterial = MaterialManager.get('Screen').instance;
            this.textMaterial.emissive = this.rimLightColor;
            this.textMaterial.emissiveIntensity = 50.0;
            let text = new THREE.Mesh(textGeometry, this.textMaterial);
            text.scale.setScalar(0.01);
            text.position.set(-6, 2, -6);
            this.instance.add(text);
        });

        this.instance.fog = new THREE.FogExp2(0x30364c, 0.001);

        // Test Bonhomme
        this.bonhomme = new Bonhomme({ parent: this });
        this.spotLight.setTarget(this.bonhomme.model);
        this.rimLight.setTarget(this.bonhomme.model);
        this.camera.setTargetMAP(this.bonhomme.model);

        // Music : Le Perv - Carpender Brut

        this.update = (time, delta) => {
            this.camera.instance.rotation.z = Math.sin(time * 0.0011) * 0.1;
            this.camera.instance.position.z = Math.sin(time * 0.001) * 0.75;

            this.spotLight.instance.position.z = Math.sin(time * 0.001) * 2.0;
            this.rimLight.instance.position.z = Math.sin(time * 0.0015) * 3.0;

            this.rimLightColor.setHSL(Math.sin(time * 0.0002), 0.8, 0.5);
            this.rimLight.setColor(this.rimLightColor.getHexString())

            if(this.textMaterial)
                this.textMaterial.emissiveIntensity = 45.0 + ((Math.sin(time * 0.005) * 5.0));
        }
        this.update(0, 0);

        Engine.addToUpdate(this.uuid, this.update.bind(this));

    },
    onStart: async function() {
        // await Engine.wait(1000)

        // this.bonhomme.animator.play('Salute')

    }
});