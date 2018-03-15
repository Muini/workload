
varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform highp sampler2D tDepth;

uniform float nearClip;
uniform float farClip;

bool uUseAutofocus = true; // disable if you use external uFocalDepth value
float uFocalDepth; // external focal point value, but you may use autofocus option below
vec2 uAutofocusCenter = vec2(0.7, 0.2); // (0.0,0.0 - left lower corner, 1.0,1.0 - upper right)

uniform float aperture; // controls the focal range
uniform float maxblur;

const int uNumRings = 6;
const int ringSamples = 6;
const int uNumSamples = 6;
float uHighlightThreshold = 0.5;
float uHighlightGain = 20.0;
float uBokehEdgeBias = 0.8;
float uBokehFringe = 0.75; // bokeh chromatic aberration/fringing

const bool useNoiseDithering = true; // use noise instead of pattern for sample dithering
const float ditherAmount = 0.0001;
const bool useBdepth = true; // blur the depth buffer?
const float depthBufferBlurSize = 0.0;

#define PI 3.14159265

const bool useLinearDepth = false;

float linearDepth(float depthSample) {
  depthSample = 2.0 * depthSample - 1.0;
  float zLinear = 2.0 * nearClip * farClip / (farClip + nearClip - depthSample * (farClip - nearClip));
  return zLinear;
}

float bdepth(vec2 coord) {
  float d = 0.0;
  float kernel[9];
  vec2 offset[9];

  vec2 wh = vec2(vUv.x, vUv.y) * depthBufferBlurSize;

  offset[0] = vec2(-wh.x,-wh.y);
  offset[1] = vec2( 0.0, -wh.y);
  offset[2] = vec2( wh.x -wh.y);

  offset[3] = vec2(-wh.x,  0.0);
  offset[4] = vec2( 0.0,   0.0);
  offset[5] = vec2( wh.x,  0.0);

  offset[6] = vec2(-wh.x, wh.y);
  offset[7] = vec2( 0.0,  wh.y);
  offset[8] = vec2( wh.x, wh.y);

  kernel[0] = 1.0 / 16.0;   kernel[1] = 2.0 / 16.0;   kernel[2] = 1.0 / 16.0;
  kernel[3] = 2.0 / 16.0;   kernel[4] = 4.0 / 16.0;   kernel[5] = 2.0 / 16.0;
  kernel[6] = 1.0 / 16.0;   kernel[7] = 2.0 / 16.0;   kernel[8] = 1.0 / 16.0;

  for (int i = 0; i < 9; i++) {
    float tmp = texture2D(tDepth, coord + offset[i]).r;
    d += tmp * kernel[i];
  }

  return d;
}

// processing the sample
vec3 color(vec2 coord, float blurAmount) {
  vec3 col = vec3(0.0);

  col.r = texture2D(tDiffuse, coord + vec2(0.0, 1.0) * vUv * uBokehFringe * blurAmount).r;
  col.g = texture2D(tDiffuse, coord + vec2(-0.866, -0.5) * vUv * uBokehFringe * blurAmount).g;
  col.b = texture2D(tDiffuse, coord + vec2(0.866, -0.5) * vUv * uBokehFringe * blurAmount).b;

  vec3 lumcoeff = vec3(0.299, 0.587, 0.114);
  float lum = dot(col.rgb, lumcoeff);
  float thresh = max((lum - uHighlightThreshold) * uHighlightGain, 0.0);
  return col + mix(vec3(0.0), col, thresh * blurAmount);
}

// generating noise/pattern texture2D for dithering
vec2 rand(in vec2 coord) {
  float noiseX;
  float noiseY;

  if (useNoiseDithering) {
    noiseX = clamp(fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453), 0.0, 1.0) * 2.0 - 1.0;
    noiseY = clamp(fract(sin(dot(coord, vec2(12.9898, 78.233) * 2.0)) * 43758.5453), 0.0, 1.0) * 2.0 - 1.0;
  } else {
    noiseX = ((fract(1.0 - coord.s * (vUv.x / 2.0)) * 0.25) + (fract(coord.t * (vUv.y / 2.0)) * 0.75)) * 2.0 - 1.0;
    noiseY = ((fract(1.0 - coord.s * (vUv.x / 2.0)) * 0.75) + (fract(coord.t * (vUv.y / 2.0)) * 0.25)) * 2.0 - 1.0;
  }

  return vec2(noiseX, noiseY);
}

void main() {
  float pixelDepth;
  float focalDepth;
  float blurAmount;

  if (useBdepth) {
    pixelDepth = bdepth(vUv.xy);
  } else {
    pixelDepth = texture2D(tDepth, vUv.xy).x;
  }

  if (uUseAutofocus) {
    focalDepth = texture2D(tDepth, uAutofocusCenter).x;
  } else {
    focalDepth = uFocalDepth;
    if (useLinearDepth) {
      pixelDepth = linearDepth(pixelDepth);
    }
  }
  
  // TODO: use real dof formula to correct
  blurAmount = clamp((abs(pixelDepth - focalDepth) / aperture / 10000.0) * 100.0, -maxblur, maxblur);

  vec2 noise = rand(vUv.xy) * ditherAmount * blurAmount;

  float w = (1.0 / vUv.x) * blurAmount + noise.x;
  float h = (1.0 / vUv.y) * blurAmount + noise.y;

  vec3 col = texture2D(tDiffuse, vUv.xy).rgb;
  float s = 1.0;

  bool leaking = false;
  const float leakingDepthThreshold = 0.2;
  
  for (int j = 0; j < uNumRings; j++) {
    float step = PI * 2.0 / float(uNumRings);
    float pw = (cos(float(j) * step) * float(uNumSamples));
    float ph = (sin(float(j) * step) * float(uNumSamples));
    float tapDepth = texture2D(tDepth, vUv.xy + vec2(pw * w, ph * h)).x;
    if (abs(tapDepth - pixelDepth) > leakingDepthThreshold) {
      leaking = true;
      break;
    }
  }
  
  for (int i = 1; i <= uNumRings; i++) {
    for (int j = 0; j < ringSamples ; j++) {
      float step = PI * 2.0 / float(ringSamples);
      float pw = (cos(float(j) * step) * float(i));
      float ph = (sin(float(j) * step) * float(i));
      float p = 1.0;
      if (leaking) {
        float tapDepth = texture2D(tDepth, vUv.xy + vec2(pw * w, ph * h)).x;
        if (abs(tapDepth - pixelDepth) > leakingDepthThreshold) {
          continue;
        }
      }
      col += color(vUv.xy + vec2(pw * w, ph * h), blurAmount) * mix(1.0, (float(i)) / (float(uNumRings)), uBokehEdgeBias) * p;
      s += 1.0 * mix(1.0, (float(i)) / (float(uNumRings)), uBokehEdgeBias) * p;
    }
  }

  col /= s;

  gl_FragColor.rgb = col;
  gl_FragColor.a = 1.0;

  // DEBUG show depth buffer
//  oColor.rgb = texture(tDepth, vUv.xy).rgb;
}