precision highp float;

// vertex parameters
varying vec2 v_texCoords;
varying vec3 v_fragCoord;
varying vec3 v_normals;

// material parameters
struct Material {
  vec3  albedo;
  float metallic;
  float roughness;
  float ao;
};
uniform Material material;

// lights
struct Light {
  vec3 position;
  vec3 color;
};
uniform Light light;

// camera, resultion
uniform vec3 u_eye;
uniform vec2 u_resolution;

const float PI = 3.14159265359;

float distributionGGX (vec3 N, vec3 H, float roughness){
  float a2    = roughness * roughness * roughness * roughness;
  float NdotH = max (dot (N, H), 0.0);
  float denom = (NdotH * NdotH * (a2 - 1.0) + 1.0);
  return a2 / (PI * denom * denom);
}

float geometrySchlickGGX (float NdotV, float roughness){
  float r = (roughness + 1.0);
  float k = (r * r) / 8.0;
  return NdotV / (NdotV * (1.0 - k) + k);
}

float geometrySmith (vec3 N, vec3 V, vec3 L, float roughness){
  return geometrySchlickGGX (max (dot (N, L), 0.0), roughness) * 
          geometrySchlickGGX (max (dot (N, V), 0.0), roughness);
}

vec3 fresnelSchlick (float cosTheta, vec3 F0){
  return F0 + (1.0 - F0) * pow (1.0 - cosTheta, 5.0);
}

void main (){
  vec3 totColor = vec3(0.0);
  
  vec3 ro = vec3(0.0, 0.0, -2.0);

  vec3 N = normalize(v_normals);
  vec3 V = normalize(u_eye - v_fragCoord);

  for (float x = 0.0; x <= 1.0; x += 1.) {
    for (float y = 0.0; y <= 1.0; y += 1.) {
      // vec3 rd = normalize(vec3(v_fragCoord.xy + vec2(x, y) / u_resolution.y, 1.2));
      // float d = sphereIntersect(ro, rd, vec4(0,0,0,1));
      
      // if (d > 0.) {
        vec3 L = normalize (light.position - v_fragCoord);
        vec3 H = normalize (V + L);
        
        // Cook-Torrance BRDF
        vec3  F0 = mix (vec3 (0.04), pow(material.albedo, vec3 (2.2)), material.metallic);
        float NDF = distributionGGX(N, H, material.roughness);
        float G   = geometrySmith(N, V, L, material.roughness);
        vec3  F   = fresnelSchlick(max(dot(H, V), 0.0), F0);        
        vec3  kD  = vec3(1.0) - F;
        kD *= 1.0 - material.metallic;	  
        
        vec3  numerator   = NDF * G * F;
        float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
        vec3  specular    = numerator / max(denominator, 0.001);  
            
        float NdotL = max(dot(N, L), 0.0);                
        vec3  color = light.color * (kD * pow(material.albedo, vec3 (2.2)) / PI + specular) * 
                      (NdotL / dot(light.position - v_fragCoord, light.position - v_fragCoord));
        
        totColor += color;
      // }
    }
  }
    
  // HDR tonemapping gamma correct
  gl_FragColor = vec4(pow(totColor/(totColor + 1.0), vec3 (1.0/2.2)), 1.0);
}