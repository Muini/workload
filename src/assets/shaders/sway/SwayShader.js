/**
 * @author Muini / http://corentinflach.fr/
 *
 * Sway shader
 */
import * as THREE from 'three';

export default class SwayShader {
    constructor(parameters, uniforms) {


        var standardShader = THREE.ShaderLib['standard'];
        var swayUniforms = {
            "time": {
                value: 1.0
            },
            "swayBlend": {
                value: 0.005
            },
            "windForce": {
                value: new THREE.Vector2(0, 0)
            },
        }

        var material = new THREE.ShaderMaterial({

            uniforms: THREE.UniformsUtils.merge([standardShader.uniforms, swayUniforms, uniforms]),

            vertexShader: require('./sway.vert'),
            // vertexShader: standardShader.vertexShader,

            fragmentShader: standardShader.fragmentShader,

            skinning: true,
            lights: true,
            fog: true,

        });

        material.setValues(parameters);

        return material;

    }
}