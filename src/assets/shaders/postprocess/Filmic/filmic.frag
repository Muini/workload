
#include <common>

#define LUT_FLIP_Y

#pragma glslify: lookup = require('glsl-lut')

uniform sampler2D tDiffuse;
uniform vec2 resolution;
varying vec2 vUv;

uniform float time;

uniform float noiseStrength;
uniform sampler2D noiseTexture;

uniform float rgbSplitStrength;

uniform float vignetteStrength;
uniform float vignetteOffset;

uniform float contrast;

uniform sampler2D LUTtexture;
uniform float LUTstrength;

void main() {

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

        #if STATIC_NOISE
            vec2 uv = mod(vUv, 0.1) / 0.1;
            vec4 noise = texture2D(noiseTexture, uv);
            noise.r *= (.5*(1.+sin(time/50.)));
            noise.g *= (.5*(1.+sin(time/50.+0.5*PI)));
            noise.b *= (.5*(1.+sin(time/50.+1.0*PI)));
            noise.w *= (.5*(1.+sin(time/50.+1.5*PI)));
            float intensity = (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0;
            float dx = (noise.r + noise.g + noise.b + noise.w) * (1.0 - intensity);
            vec3 noiseColor = gl_FragColor.rgb + gl_FragColor.rgb * clamp( 0.1 + dx, 0.0, 1.0 );

            noiseColor = gl_FragColor.rgb + clamp( noiseStrength, 0.0,1.0 ) * ( noiseColor - gl_FragColor.rgb );

            gl_FragColor.rgb = noiseColor;
        #else
            float dx = rand( vUv + time );
            vec3 noiseColor = gl_FragColor.rgb + gl_FragColor.rgb * clamp( 0.1 + dx, 0.0, 1.0 );

            noiseColor = gl_FragColor.rgb + clamp( noiseStrength, 0.0,1.0 ) * ( noiseColor - gl_FragColor.rgb );

            gl_FragColor.rgb = noiseColor;
        #endif
    }

    gl_FragColor.rgb = ((gl_FragColor.rgb - 0.5) * max(contrast, 0.0)) + 0.5;

    vec3 lut = lookup(gl_FragColor, LUTtexture).rgb;
    gl_FragColor.rgb = mix(gl_FragColor.rgb, lut, LUTstrength);
    
}