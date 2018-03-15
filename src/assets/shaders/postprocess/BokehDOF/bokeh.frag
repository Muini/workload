
varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform highp sampler2D tDepth;


uniform float nearClip;
uniform float farClip;

uniform float focalLength;
uniform float focusDistance;
uniform float aperture; // aperture - bigger values for shallower depth of field
uniform float maxblur; // max blur amount

// Bokeh disc.
// by David Hoskins.
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License. (https://www.shadertoy.com/view/4d2Xzw)
// Modified by SolarLiner
// Modified by Corentin Flach for WebGL (three.js) integration with dynamic iterations & weighted layers based on this paper : https://www.jvrb.org/past-issues/10.2013/3819

// The Golden Angle is (3.-sqrt(5.0))*PI radians, which doesn't precompiled for some reason.
// The compiler is a dunce I tells-ya!!
#define GOLDEN_ANGLE 2.39996323

// #define ITERATIONS 32
#define ITERATIONS 64

#define DISTORTION_ANAMORPHIC	0.0;
#define DISTORTION_BARREL       0.3;

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
        float cameraFarPlusNear = farClip + nearClip;
        float cameraFarMinusNear = farClip - nearClip;
        float cameraCoef = 2.0 * nearClip;

        return cameraCoef / ( cameraFarPlusNear - texture2D(tDepth, coord ).r * cameraFarMinusNear );
}

// Additions by SolarLiner ------------------------------------------------------------------
vec2 GetDistOffset(vec2 uv, vec2 pxoffset)
{
        vec2 tocenter = uv.xy+vec2(-0.5,0.5);
        vec3 prep = normalize(vec3(tocenter.y, -tocenter.x, 0.0));

        float angle = length(tocenter.xy)*2.221*DISTORTION_BARREL;
        vec3 oldoffset = vec3(pxoffset,0.0);
        float anam = 1.0-DISTORTION_ANAMORPHIC; // Prevents a strange syntax error
        oldoffset.x *= anam;

        vec3 rotated = oldoffset * cos(angle) + cross(prep, oldoffset) * sin(angle) + prep * dot(prep, oldoffset) * (1.0-cos(angle));

        return rotated.xy;
}

float getFocus(float blur, float depth, float mult){
        float edge = 0.002*mult*depth; //distance based edge smoothing
        float focus = clamp(smoothstep(0.0,edge,blur),0.0,1.0);
        return focus;
}

vec3 debugFocus(vec3 col, float blur, float depth) {
        float focus = getFocus(blur, depth, 3.0);
        col = mix(col,vec3(0.0,0.5,1.0),(focus)*0.05);
        col = mix(col,vec3(1.0,0.2,0.2),(1.0-focus)*0.2);
        return col;
}

float Remap (float value, float from1, float to1, float from2, float to2) {
    return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
}

//-------------------------------------------------------------------------------------------
vec3 Bokeh(sampler2D tex, vec2 uv, float radius, float amount, float pixelDepth)
{
        vec3 acc = vec3(0.0);
        vec3 div = vec3(0.0);
        float r = 1.0;
        vec2 vangle = vec2(0.0,radius); // Start angle
        mat2 rot = rotMatrix(GOLDEN_ANGLE);
    
        amount += radius*500.0;

        //Background        
        for (int j = 0; j < ITERATIONS; j++)
        {
                if(float(j) > float(ITERATIONS) * (1.0 - radius)) break;
                r += 1. / r;
                vangle = rot * vangle;
                // (r-1.0) here is the equivalent to sqrt(0, 1, 2, 3...)
                vec2 pos = GetDistOffset(uv, uv*(r-1.)*vangle);
                
                float tapDepth = readDepth(uv + pos);
                float leakingDepthThreshold = pixelDepth * radius * 160.0;
                if (abs( tapDepth - pixelDepth ) > leakingDepthThreshold) {
                        continue;
                }
                vec3 col = texture2D(tex, uv + pos).xyz;
                // col = mix(vec3(0.0), col, vec3(pixelDepth));
                vec3 bokeh = pow(col, vec3(9.0)) * amount+.4;
                acc += col * bokeh;
                div += bokeh;
        }
        // In focus


        // Foreground


        return acc / div;
}

void main() {

        float depth = readDepth(vUv);

        float CoC = 0.029; //circle of confusion size in mm (35mm film = 0.029mm)

        // // Autofocus
        // float fDepth = 1.0;
        // vec2 focusCoords = vec2(0.5,0.5);
        // fDepth = readDepth(focusCoords);
        
        float f = focalLength / 6000.0; // focal length in mm
        float d = (focusDistance - nearClip) / farClip; // focal plane in mm
        float o = depth; // depth in mm

        float a = (o*f)/(o-f);
        float b = (d*f)/(d-f);
        float c = (d-f)/(d*aperture*CoC);

        float blur = abs(a-b)*c;
        /*
        float layerSeparatorSharpness = 1.0;
        float focusDepth = (1.0 - getFocus(blur, depth, layerSeparatorSharpness));
        float foregroundDepth = depth < d ? depth : 0.0;
        foregroundDepth -= focusDepth;
        float backgroundDepth = depth >= d ? depth : 0.0;
        backgroundDepth -= focusDepth;
        focusDepth = (1.0 - getFocus(blur, depth, layerSeparatorSharpness + 0.5));
        */
        blur = clamp(blur,0.0,1.0);
        
        vec4 col = vec4(0.0);
        
        float amount = 40.0;
        
        // vec4 backgroudColor = vec4(Bokeh(tDiffuse, vUv, blur, amount, depth), 1.0);
        // vec4 foregroudColor = vec4(Bokeh(tDiffuse, vUv, blur, amount, depth), 1.0);
        vec4 focusColor = vec4(Bokeh(tDiffuse, vUv, blur, amount, depth), 1.0);


        // gl_FragColor = vec4(focusDepth, foregroundDepth, backgroundDepth, 1.0);

        // focusColor.rgb = debugFocus(focusColor.rgb, blur, depth);

        gl_FragColor = focusColor;

        // float focus = 1.0 - getFocus(blur, depth, 3.0);
        // gl_FragColor = vec4(focus, focus, focus, 1.0);

}