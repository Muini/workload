
uniform sampler2D tDiffuse;
uniform vec2 resolution;
varying vec2 vUv;

uniform mediump vec4 blurPos[4];

uniform sampler2D noiseTexture;

uniform float blurStrength;

uniform float sharpenStrength;

uniform float blurRgbSplitStrength;

uniform float gain;

#define PI 3.14159265359
#define TWO_PI 6.28318530718

vec2 Circle(float Start, float Points, float Point) 
{
    /*float Rad = (TWO_PI * (1.0 / Points)) * (Point + Start);
    float a = atan(Start,(1.0 / Points))+TWO_PI;
    float r = TWO_PI/float(3);
    float d = floor(Rad+a/r)*r-a;
    return vec2(sin(d), cos(d));*/
	float Rad = (TWO_PI * (1.0 / Points)) * (Point + Start);
	return vec2(sin(Rad), cos(Rad));
}

void main() {

    gl_FragColor = texture2D(tDiffuse, vUv);

    // Sharpen
    if(sharpenStrength > 0.0){

        float dx = 1.0 / resolution.x;
        float dy = 1.0 / resolution.y;

        vec4 sum = vec4(0.0);
        sum += -1. * texture2D(tDiffuse, vUv.xy + vec2( -sharpenStrength * dx , 0.0 * dy));
        sum += -1. * texture2D(tDiffuse, vUv.xy + vec2( 0.0 * dx , -sharpenStrength * dy));
        sum += 5. * texture2D(tDiffuse, vUv.xy + vec2( 0.0 * dx , 0.0 * dy));
        sum += -1. * texture2D(tDiffuse, vUv.xy + vec2( 0.0 * dx , sharpenStrength * dy));
        sum += -1. * texture2D(tDiffuse, vUv.xy + vec2( sharpenStrength * dx , 0.0 * dy));

        gl_FragColor.rgb = mix(gl_FragColor.rgb, sum.rgb, 1.0);
    }

    // Blur variables
    vec2 uv = vUv.xy;
    vec2 PixelOffset = 1.0 / resolution.xy;
    
    const float Sample = float(SAMPLE);
    float Start = 2.0 / Sample;
    vec2 Scale = blurStrength * Sample * 2.0 * PixelOffset.xy;
    
    float W = 1.0 / (Sample + 1.0);
    
    vec3 color = vec3(0,0,0);

    vec4 noise = texture2D(noiseTexture, mod(vUv, 0.1) / 0.1);
    float randomOffset = ((noise.r + noise.g + noise.b) / 3.0) * 0.5;

    // Blur where we need
    for(int i=0; i<4; i++){
        if(vUv.x > blurPos[i].x && vUv.y < blurPos[i].y && vUv.x < blurPos[i].z && vUv.y > blurPos[i].w){
            
            for (float i=0.0;i<Sample; i++) {
                color.r += texture2D(tDiffuse, uv + Circle(Start, Sample, i) * randomOffset * Scale * blurRgbSplitStrength).r * W;
                color.g += texture2D(tDiffuse, uv + Circle(Start, Sample, i) * randomOffset * Scale ).g * W;
                color.b += texture2D(tDiffuse, uv + Circle(Start, Sample, i) * randomOffset * Scale / blurRgbSplitStrength).b * W;
            }
            color.rgb *= gain;

            gl_FragColor.rgb = color.rgb;

            break;
        }
    }

    
    
    
}