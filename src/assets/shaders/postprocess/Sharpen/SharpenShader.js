/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Vignette shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */
import * as THREE from 'three';

THREE.SharpenShader = {

    uniforms: {

        "tDiffuse": { value: null },
        "resolution": { value: new THREE.Vector2(1 / 1024, 1 / 512) }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [
        `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        varying vec2 vUv;

        void main() {

            float dx = 1.0 / resolution.x;
            float dy = 1.0 / resolution.y;
            vec4 sum = vec4(0.0);
            sum += -1. * texture2D(tDiffuse, vUv.xy + vec2( -.05 * dx , 0.0 * dy));
            sum += -1. * texture2D(tDiffuse, vUv.xy + vec2( 0.0 * dx , -.05 * dy));
            sum += 5. * texture2D(tDiffuse, vUv.xy + vec2( 0.0 * dx , 0.0 * dy));
            sum += -1. * texture2D(tDiffuse, vUv.xy + vec2( 0.0 * dx , .05 * dy));
            sum += -1. * texture2D(tDiffuse, vUv.xy + vec2( .05 * dx , 0.0 * dy));

            gl_FragColor = sum;
        }

        `
    ].join("\n"),

};