varying vec2 vUv;
varying vec4 vPos;
varying vec3 vNormal;

void main() {

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    vUv = uv;
    vNormal = normal;
    vPos = vec4( position, 1.0 );

    gl_PointSize = 1.0;
    gl_Position = projectionMatrix * mvPosition;

}
