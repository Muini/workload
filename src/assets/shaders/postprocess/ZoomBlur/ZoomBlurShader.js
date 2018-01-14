import * as THREE from 'three';

THREE.ZoomBlurShader = {

    uniforms: {

        "tDiffuse": { value: null },
        "center": { value: new THREE.Vector2(.5, .5) },
        "strength": { value: 1.0 },
        "resolution": { value: new THREE.Vector2(1 / 1024, 1 / 512) }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [
        `
        uniform sampler2D tDiffuse;
        uniform vec2 center;
        uniform float strength;
        uniform vec2 resolution;
        varying vec2 vUv;

        float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}

        void main(){
            vec4 color=vec4(0.0);
            float total=0.0;
            vec2 toCenter=center-vUv;
            float offset=random(vec3(12.9898,78.233,151.7182),0.0);
            for(float t=0.0;t<=3.0;t++){
                float percent = (t+offset)/5.0;
                float weight=4.0*(percent-percent*percent) ;
                vec4 sample=texture2D(tDiffuse,vUv+toCenter*percent*strength/resolution);
                sample.rgb*=sample.a;
                color+=sample*weight;
                total+=weight;
            }
            gl_FragColor=color/total;
            gl_FragColor.rgb/=gl_FragColor.a+0.00001;
        }
        `
    ].join("\n"),

};