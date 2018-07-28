vec3 ACESToneMapping( vec3 color )
{
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
	color *= toneMappingExposure;
    return saturate((color*(a*color+b))/(color*(c*color+d)+e));
}