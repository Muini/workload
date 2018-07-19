#ifdef USE_FOG
// worldPosition.y
// vViewPosition.y
// mvPosition.z
    fogDepth = max(pow( 5.0 + (abs(mvPosition.z * 0.1) - worldPosition.y), 1.9), 0.01) -mvPosition.z;
#endif