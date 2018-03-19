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
uniform float swayBlend;
uniform vec2 windForce;

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

	vec3 displacedVertex = vec3(0.0);

	float fBF = transformed.z * swayBlend * length(transformed);
	fBF += 1.0;
	fBF *= fBF;
	fBF = fBF * fBF - fBF;

	displacedVertex.x = (windForce.x / 10.0) * cos( time * 0.00005 * length(windForce) + transformed.x ) * fBF;
	displacedVertex.z = (windForce.y / 10.0) * sin( time * 0.00005 * length(windForce) + transformed.y ) * fBF;

	transformed -= displacedVertex;

	vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 ) + vec4( displacedVertex, 0.0 );

	gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
	
}