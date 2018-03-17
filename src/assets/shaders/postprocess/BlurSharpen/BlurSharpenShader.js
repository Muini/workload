/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Vignette shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */
import * as THREE from 'three';

THREE.BlurSharpenShader = {

    defines: {
        SAMPLE: 12,
    },

    uniforms: {

        "tDiffuse": { value: null },
        "resolution": { value: new THREE.Vector2(1 / 1024, 1 / 512) },

        "blurPos": {
            type: 'v4v',
            value: [
                new THREE.Vector4(0.0, 0.0, 0.0, 0.0),
                new THREE.Vector4(0.0, 0.0, 0.0, 0.0),
                new THREE.Vector4(0.0, 0.0, 0.0, 0.0),
                new THREE.Vector4(0.0, 0.0, 0.0, 0.0)
            ]
        },

        "blurStrength": { value: 0.5 },

        "sharpenStrength": { value: 0.1 },

        "blurRgbSplitStrength": { value: 1.5 },

        "gain": { value: 1.0 },

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: require('./blurSharpen.frag'),

};