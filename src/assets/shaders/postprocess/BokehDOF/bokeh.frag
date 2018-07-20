
varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform highp sampler2D tDepth;


uniform float near;
uniform float far;

uniform float focalLength;
uniform float focus;
uniform float aperture; // aperture - bigger values for shallower depth of field
uniform float maxblur; // max blur amount
uniform sampler2D noiseTexture;

// Bokeh disc.
// by David Hoskins.
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License. (https://www.shadertoy.com/view/4d2Xzw)
// Modified by SolarLiner
// Modified by Corentin Flach for WebGL (three.js) integration with dynamic iterations & weighted layers based on this paper : https://www.jvrb.org/past-issues/10.2013/3819

// The Golden Angle is (3.-sqrt(5.0))*PI radians, which doesn't precompiled for some reason.
// The compiler is a dunce I tells-ya!!
#define GOLDEN_ANGLE 2.39996323

// #define ITERATIONS 64

#define DISTORTION_ANAMORPHIC	0.0;
#define DISTORTION_BARREL       0.5;

// Helpers-----------------------------------------------------------------------------------
vec2 rotate(vec2 vector, float angle)
{
    float s = sin(angle);
    float c = cos(angle);
    
    return vec2(c*vector.x-s*vector.y, s*vector.x+c*vector.y);
}

mat2 rotMatrix(float angle)
{
        return mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
}

float readDepth( const in vec2 coord ) {
        float cameraFarPlusNear = far + near;
        float cameraFarMinusNear = far - near;
        float cameraCoef = 2.0 * near;

        return cameraCoef / ( cameraFarPlusNear - texture2D(tDepth, coord ).r * cameraFarMinusNear );
}

// Additions by SolarLiner ------------------------------------------------------------------
vec2 GetDistOffset(vec2 uv, vec2 pxoffset)
{
        vec2 tocenter = uv.xy+vec2(-0.5,-0.5);
        vec3 prep = normalize(vec3(tocenter.y, -tocenter.x, 0.0));

        float angle = length(tocenter.xy)*2.221*DISTORTION_BARREL;
        vec3 oldoffset = vec3(pxoffset,0.0);
        float anam = 1.0-DISTORTION_ANAMORPHIC; // Prevents a strange syntax error
        oldoffset.x *= anam;

        vec3 rotated = oldoffset * cos(angle) + cross(prep, oldoffset) * sin(angle) + prep * dot(prep, oldoffset) * (1.0-cos(angle));

        return rotated.xy;
}

float getFocus(float blur, float depth, float mult){
        float edge = 0.5*mult*depth; //distance based edge smoothing
        float focusColor = clamp(smoothstep(0.0,edge,blur),0.0,1.0);
        return focusColor;
}

vec3 debugFocus(vec3 col, float blur, float depth) {
        float focusColor = getFocus(blur, depth, 3.0);
        col = mix(col,vec3(0.0,0.5,1.0),(focusColor)*0.1);
        col = mix(col,vec3(1.0,0.2,0.2),(1.0-focusColor)*0.2);
        return col;
}

float Remap (float value, float from1, float to1, float from2, float to2) {
    return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
}

//-------------------------------------------------------------------------------------------
vec3 Bokeh(sampler2D tex, vec2 uv, float radius, float highlightBokehAmount, float pixelDepth)
{
        vec3 acc = vec3(0.0);
        vec3 div = vec3(0.0);
        float r = 1.0;
        vec2 vangle = vec2(0.0,radius / (float(ITERATIONS) / 2.0) / 128.0); // Start angle
        mat2 rot = rotMatrix(GOLDEN_ANGLE);
        
        highlightBokehAmount *= radius*100.0;

        //Background        
        for (int j = 0; j < ITERATIONS; j++)
        {
                if(float(j) > float(ITERATIONS) * radius) break; //Optimisation: More sample the blurier the object is
                r += 1. / r;
                vangle = rot * vangle;
                // (r-1.0) here is the equivalent to sqrt(0, 1, 2, 3...)
                vec2 pos = GetDistOffset(uv, (radius / 2.0)*(r-1.)*vangle);
                
                float tapDepth = readDepth(uv + pos);
                float leakingDepthThreshold = 0.2;
                if (abs( tapDepth - pixelDepth ) > leakingDepthThreshold && tapDepth < pixelDepth) {
                        continue;
                }
                vec3 col = vec3(0.0);
                // col = texture2D(tex, uv + pos).rgb;
                col.r = texture2D(tex, uv + pos + vec2(0.1 * pos.y)).r;
                col.g = texture2D(tex, uv + pos).g;
                col.b = texture2D(tex, uv + pos - vec2(0.1 * pos.y)).b;

                // col = mix(vec3(0.0), col, vec3(pixelDepth));
                vec3 bokeh = pow(col, vec3(9.0)) * highlightBokehAmount +.4;
                acc += col * bokeh;
                div += bokeh;
        }

        return acc / div;
}

void main() {

        float depth = readDepth(vUv);

        float CoC = 0.029; //circle of confusion size in mm (35mm film = 0.029mm)

        float fDepth = ((focus - near) / far) * 2.0;

        float blur = clamp(((abs(depth - fDepth) / (aperture * aperture) * CoC ) * focalLength * focalLength) / (focus / 100.0), -maxblur * 2.0, maxblur * 2.0);
        /*
        float layerSeparatorSharpness = 1.0;
        float focusDepth = (1.0 - getFocus(blur, depth, layerSeparatorSharpness));
        float foregroundDepth = depth < d ? depth : 0.0;
        foregroundDepth -= focusDepth;
        float backgroundDepth = depth >= d ? depth : 0.0;
        backgroundDepth -= focusDepth;
        focusDepth = (1.0 - getFocus(blur, depth, layerSeparatorSharpness + 0.5));
        */
        
        // vec4 backgroudColor = vec4(Bokeh(tDiffuse, vUv, blur, highlightBokehAmount, depth), 1.0);
        // vec4 foregroudColor = vec4(Bokeh(tDiffuse, vUv, blur, highlightBokehAmount, depth), 1.0);
        if(blur < 0.02){
                gl_FragColor = texture2D(tDiffuse, vUv);
        }else{
                float highlightBokehAmount = 40.0;
                vec4 noise = texture2D(noiseTexture, mod(vUv, 0.1) / 0.1);
                float randomOffset = ((noise.r + noise.g + noise.b) / 3.0);
                vec4 bokehDOF = vec4(Bokeh(tDiffuse, vUv + (randomOffset * blur * 0.0015), blur, highlightBokehAmount, depth), 1.0);
                // bokehDOF.rgb = debugFocus(bokehDOF.rgb, blur, depth);
                gl_FragColor = bokehDOF;
        }

        // gl_FragColor = vec4(focusDepth, foregroundDepth, backgroundDepth, 1.0);



        // float focus = 1.0 - getFocus(blur, depth, 3.0);
        // gl_FragColor = vec4(1.0 - blur, 1.0 - blur, 1.0 - blur, 1.0);

}