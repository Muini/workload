

#if defined( TONE_MAPPING )

  gl_FragColor.rgb = ACESToneMapping( gl_FragColor.rgb );

#endif