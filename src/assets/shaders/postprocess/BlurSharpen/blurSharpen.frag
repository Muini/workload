
uniform sampler2D tDiffuse;
uniform vec2 resolution;
varying vec2 vUv;

uniform mediump vec4 blurPos[4];

uniform float blurStrength;

uniform float sharpenStrength;

uniform float blurRgbSplitStrength;

uniform float gain;

vec2 Circle(float Start, float Points, float Point) 
{
	float Rad = (3.141592 * 2.0 * (1.0 / Points)) * (Point + Start);
	return vec2(sin(Rad), cos(Rad));
}

void main() {

    float dx = 1.0 / resolution.x;
    float dy = 1.0 / resolution.y;

    gl_FragColor = texture2D(tDiffuse, vUv);

    if(sharpenStrength > 0.0){

        vec4 sum = vec4(0.0);
        sum += -1. * texture2D(tDiffuse, vUv.xy + vec2( -sharpenStrength * dx , 0.0 * dy));
        sum += -1. * texture2D(tDiffuse, vUv.xy + vec2( 0.0 * dx , -sharpenStrength * dy));
        sum += 5. * texture2D(tDiffuse, vUv.xy + vec2( 0.0 * dx , 0.0 * dy));
        sum += -1. * texture2D(tDiffuse, vUv.xy + vec2( 0.0 * dx , sharpenStrength * dy));
        sum += -1. * texture2D(tDiffuse, vUv.xy + vec2( sharpenStrength * dx , 0.0 * dy));

        gl_FragColor.rgb = mix(gl_FragColor.rgb, sum.rgb, 1.0);
    }

    vec2 uv = vUv.xy;
    vec2 PixelOffset = 1.0 / resolution.xy;
    
    const float Sample = 12.0;
    float Start = 2.0 / Sample;
	vec2 Scale = blurStrength * Sample * 2.0 * PixelOffset.xy;
    
    float W = 1.0 / (Sample + 1.0);
    
    vec3 color = vec3(0,0,0);
    
    for (float i=0.0;i<Sample; i++) {
       color.r += texture2D(tDiffuse, uv + Circle(Start, Sample, i) * Scale  * blurRgbSplitStrength).r * W;
       color.g += texture2D(tDiffuse, uv + Circle(Start, Sample, i) * Scale).g * W;
       color.b += texture2D(tDiffuse, uv + Circle(Start, Sample, i) * Scale / blurRgbSplitStrength).b * W;
    }
    color.rgb *= gain;

    for(int i=0; i<4; i++){
        if(vUv.x > blurPos[i].x && vUv.y < blurPos[i].y && vUv.x < blurPos[i].z && vUv.y > blurPos[i].w){
            gl_FragColor.rgb = color.rgb;
        }
    }

    
    
    
}