
#define LUT_FLIP_Y

#pragma glslify: lut = require('glsl-lut')

uniform sampler2D tDiffuse;
uniform vec2 resolution;
varying vec2 vUv;

uniform sampler2D uLookup;

void main() {

    float dx = 1.0 / resolution.x;
    float dy = 1.0 / resolution.y;
    vec4 sum = vec4(0.0);
    sum += -1. * texture2D(tDiffuse, vUv.xy + vec2( -.1 * dx , 0.0 * dy));
    sum += -1. * texture2D(tDiffuse, vUv.xy + vec2( 0.0 * dx , -.1 * dy));
    sum += 5. * texture2D(tDiffuse, vUv.xy + vec2( 0.0 * dx , 0.0 * dy));
    sum += -1. * texture2D(tDiffuse, vUv.xy + vec2( 0.0 * dx , .1 * dy));
    sum += -1. * texture2D(tDiffuse, vUv.xy + vec2( .1 * dx , 0.0 * dy));

    gl_FragColor = sum;
    gl_FragColor.rgb = lut(gl_FragColor, uLookup).rgb;
}