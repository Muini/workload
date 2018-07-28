#ifdef USE_FOG
// worldPosition.y
// vViewPosition.y
// mvPosition.z
    vec4 worldPositionFog = modelMatrix * vec4( transformed, 1.0 );
    fogDepth = max(pow( 5.0 + (abs(mvPosition.z * 0.1) - worldPositionFog.y), 1.9), 0.01) -mvPosition.z;
#endif