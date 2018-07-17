#ifdef USE_FOG

	#ifdef FOG_EXP2

		float fogFactor = min( whiteCompliment( exp2( - fogDensity * fogDensity * fogDepth * fogDepth * LOG2 ) ), 0.9);

	#else

		float fogFactor = smoothstep( fogNear, fogFar, fogDepth );

	#endif

	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );

#endif