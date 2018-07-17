#ifdef USE_FOG
// worldPosition.y
// vViewPosition.y
// mvPosition.z
    fogDepth = max(pow((vViewPosition.y - worldPosition.y), 1.5), 0.01) -mvPosition.z;
#endif