/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

import * as THREE from 'three';

THREE.RGBShiftShader = {

    uniforms: {

        "tDiffuse": { value: null },
        "delta": { value: new THREE.Vector2() },
        "resolution": { value: new THREE.Vector2() }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform vec2 delta;",
        "uniform vec2 resolution;",

        "varying vec2 vUv;",

        "void main() {",

        "vec2 dir = vUv - vec2( .5 );",
        "float d = .7 * length( dir );",
        "normalize( dir );",
        "vec2 value = d * dir * delta;",

        "vec4 c1 = texture2D( tDiffuse, vUv - value / resolution.x );",
        "vec4 c2 = texture2D( tDiffuse, vUv );",
        "vec4 c3 = texture2D( tDiffuse, vUv + value / resolution.y );",

        "gl_FragColor = vec4( c1.r, c2.g, c3.b, c1.a + c2.a + c3.b );",

        "}"

    ].join("\n")

};