// https://mtnphil.wordpress.com/2011/10/18/wind-animations-for-vegetation/

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
