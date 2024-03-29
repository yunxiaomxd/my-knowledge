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

/**
 * shape:
 * 1 - 太阳光
 * 2 - 点光源
 * 3 - 聚光灯(圆)
 * 4 - 聚光灯(矩形)
 */
// point - light
struct Light {
  vec3 position;
  vec3 color;
  vec3 direction;

  float angle;

  float shape;
};
uniform Light light;

// camera, 
uniform vec3 u_eye;
uniform float attenuationDistance;

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

//               c                  DFG
// L0 = ∫（kd * ——— + ks * —————————————————————————）Li（p, wi）* n · wi
//               pi         4 * (w0 · n) * （wi · n）
void main (){
  vec3 L = normalize(light.position - v_fragCoord);
  vec3 N = normalize(v_normals);
  vec3 V = normalize(u_eye - v_fragCoord);
  vec3 H = normalize(V + L);

  // -------------------- 聚光灯计算 --------------------
  // 计算光线方向和光线法向量之间的夹角
  float theta = dot(L, normalize(-light.direction));
  // 计算聚光灯角度的影响范围
  float thetaFactor = 0.05;

  vec3 F0 = vec3(0.02); 
  F0 = mix(F0, material.albedo, material.metallic);
  
  // -------------------- cook-torrance brdf --------------------
  float NDF = distributionGGX(N, H, material.roughness);
  float G   = geometrySmith(N, V, L, material.roughness);      
  vec3 F    = fresnelSchlick(max(dot(H, V), 0.0), F0);
  vec3 numerator    = NDF * G * F;
  float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
  vec3 specular     = numerator / denominator;

  // 使用菲涅尔等式作为镜面高光参数，由于 ks 与 G 是重复计算，所以乘法的时候省去该项操作
  vec3 kS = F;

  // -------------------- lambert -----------------
  // 漫反射 diffuse
  vec3 KD = vec3(1.0) - kS;
  KD *= 1.0 - material.metallic;
  vec3 lambert = KD * pow(material.albedo, vec3(2.2)) / PI;

  // -------------------- Li --------------------
  float NdotL = max(dot(N, L), 0.0);
  float distance    = length(light.position - v_fragCoord);
  float attenuation = attenuationDistance / (distance * distance);
  vec3 radiance     = light.color * attenuation * thetaFactor * NdotL;
  
  // 积分处理
  vec3 Lo = vec3(0.0);
  for (float i = 0.0; i < 4.0; i++) {          
    Lo += (lambert + specular) * radiance;
  }

  // 环境光
  vec3 ambient = vec3(0.03) * material.albedo * material.ao;
  vec3 color = ambient + Lo;

  // 最终的 pbr 渲染结果
  // HDR 渲染
  color = color / (color + vec3(1.0));
  // Gamma校正
  color = pow(color, vec3(1.0/2.2));  
  
  gl_FragColor = vec4(vec3(color), 1.0);
}