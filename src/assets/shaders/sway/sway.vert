// https://mtnphil.wordpress.com/2011/10/18/wind-animations-for-vegetation/

#define PHYSICAL
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform float time;
uniform float swaySpeed;
uniform vec2 swayDirection;
uniform float swayAngle;

void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>

	float dx = 0.0;
	float dz = 0.0;
	vec3 displacedVertex = vec3(0.0);
	float fBendScale = 0.01;

	float fLength = length(transformed);

	float fBF = transformed.z * fBendScale * fLength;
	fBF += 1.0;
	fBF *= fBF;
	fBF = fBF * fBF - fBF;

	// dx = (swayDirection.x / 10.0) * cos( time * 0.01 * swaySpeed) * fBF;
	dx = (swayDirection.x / 10.0) * cos( time * 0.001 * swaySpeed ) * fBF;
	// dz = (swayDirection.y / 10.0) * sin( time * 0.01 * swaySpeed * (normalize(abs(transformed.y)) * 0.0001) ) * fBF;
	dz = (swayDirection.y / 10.0) * sin( time * 0.001 * swaySpeed ) * fBF;

	displacedVertex.x = dx;
	displacedVertex.z = dz;

	// transformed *= displacedVertex;

	vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 ) + vec4( displacedVertex, 0.0 );

	gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
	
}