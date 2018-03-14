/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 */
import * as THREE from 'three';

THREE.BokehShader = {

    uniforms: {

        "tDiffuse": { value: null },
        "tDepth": { value: null },
        "nearClip": { value: 1.0 },
        "farClip": { value: 1000.0 },
        "focalLength": { value: 50.0 },
        "focusDistance": { value: 10.0 },
        "aperture": { value: 1.4 },
        "maxblur": { value: 1.0 },

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