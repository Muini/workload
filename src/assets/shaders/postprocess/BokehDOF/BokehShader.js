/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 */
import * as THREE from 'three';

THREE.BokehShader = {

    defines: {
        ITERATIONS: 32,
    },

    uniforms: {

        "tDiffuse": { value: null },
        "tDepth": { value: null },
        "near": { value: 1.0 },
        "far": { value: 1000.0 },
        "focalLength": { value: 50.0 },
        "focus": { value: 100.0 },
        "aperture": { value: 2.8 },
        "maxblur": { value: 1.0 },
        "threshold": { value: 0.01 },
        "noiseTexture": { value: null },

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: require('./bokeh.frag'),

};