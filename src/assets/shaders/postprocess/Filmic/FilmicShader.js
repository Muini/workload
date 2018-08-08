/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Vignette shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */
import * as THREE from 'three';

THREE.FilmicShader = {

    defines: {
        STATIC_NOISE: 1,
    },

    uniforms: {

        "tDiffuse": { value: null },
        "resolution": { value: new THREE.Vector2(1 / 1024, 1 / 512) },

        "blurPoints": { value: [] },

        "time": { value: 0.0 },

        "sharpenStrength": { value: 0.1 },

        "noiseStrength": { value: 0.05 },
        "noiseTexture": { value: null },

        "rgbSplitStrength": { value: 5.0 },

        "vignetteStrength": { value: 1.0 },
        "vignetteOffset": { value: 1.0 },

        "brightness": { value: 1.0 },
        "contrast": { value: 1.0 },
        "gamma": { value: 1.0 },
        "vibrance": { value: 1.0 },

        "LUTtexture": { value: null },
        "LUTstrength": { value: 1.0 },

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: require('./filmic.frag'),

};