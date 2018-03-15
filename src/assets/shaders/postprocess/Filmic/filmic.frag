
#include <common>

#define LUT_FLIP_Y

#pragma glslify: lut = require('glsl-lut')

uniform sampler2D tDiffuse;
uniform vec2 resolution;
varying vec2 vUv;

uniform float time;

uniform float noiseStrength;

uniform float rgbSplitStrength;

uniform float vignetteStrength;
uniform float vignetteOffset;

uniform sampler2D LUTtexture;
uniform float LUTstrength;

void main() {

    float dx = 1.0 / resolution.x;
    float dy = 1.0 / resolution.y;

    gl_FragColor = texture2D(tDiffuse, vUv);
    
    if(rgbSplitStrength > 0.0){
        
        vec2 dir = vUv - vec2( .5 );
        float d = .7 * length( dir );
        normalize( dir );
        vec2 value = d * dir * rgbSplitStrength;

        vec4 c1 = texture2D( tDiffuse, vUv - value / resolution.x );
        vec4 c2 = texture2D( tDiffuse, vUv );
        vec4 c3 = texture2D( tDiffuse, vUv + value / resolution.y );

        vec4 rgbSplitColor = vec4( c1.r, c2.g, c3.b, c1.a + c2.a + c3.b );

        gl_FragColor.rgb = mix(gl_FragColor.rgb, rgbSplitColor.rgb, 1.0);
    }

    if(vignetteStrength > 0.0){

        vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( vignetteOffset );
        gl_FragColor.rgb = mix( gl_FragColor.rgb, vec3( 1.0 - vignetteStrength ), dot( uv, uv ) );
    }
    
    if(noiseStrength > 0.0){
        float dx = rand( vUv + time );
        vec3 noiseColor = gl_FragColor.rgb + gl_FragColor.rgb * clamp( 0.1 + dx, 0.0, 1.0 );

        noiseColor = gl_FragColor.rgb + clamp( noiseStrength, 0.0,1.0 ) * ( noiseColor - gl_FragColor.rgb );

        gl_FragColor.rgb = noiseColor;
    }
    
    vec3 lut = lut(gl_FragColor, LUTtexture).rgb;
    gl_FragColor.rgb = mix(gl_FragColor.rgb, lut, LUTstrength);
    
}