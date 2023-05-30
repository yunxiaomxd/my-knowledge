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

// D 函数，Normal Distribution Function
//       a*a
//  ___________________________________
//   pi * ((n·h) ^ 2 (a * a - 1) + 1)^2
float distributionGGX(vec3 N, vec3 H, float a) {
  float a2 = a * a;
  float NDotH = max(dot(N, H), 0.0);
  float NDotH2 = NDotH * NDotH;
  
  float denom = NDotH2 * (a2 - 1.0) + 1.0;
  denom = PI * denom * denom;

  return a2 / denom;
}

//    n·v
// ——————————————————————————————
// (n·v)(1-k) + k
float GeometrySchlickGGX(float NdotV, float k) {
  float nom   = NdotV;
  float denom = NdotV * (1.0 - k) + k;

  return nom / denom;
}
  
// G 函数，Geometry Function
float geometrySmith(vec3 N, vec3 V, vec3 L, float k) {
  float NdotV = max(dot(N, V), 0.0);
  float NdotL = max(dot(N, L), 0.0);
  float ggx1 = GeometrySchlickGGX(NdotV, k);
  float ggx2 = GeometrySchlickGGX(NdotL, k);

  return ggx1 * ggx2;
}

// F 等式，菲涅尔等式
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

//               c                  DFG
// L0 = ∫（kd * ——— + ks * —————————————————————————）Li（p, wi）* n · wi
//               pi         4 * (w0 · n) * （wi · n）
void main() {
  vec3 N = normalize(v_normals);
  vec3 V = normalize(u_eye - v_fragCoord);
  vec3 L = normalize(light.position - v_fragCoord);
  vec3 H = normalize(V + L);
  
  vec3 F0 = vec3(0.04); 
  F0 = mix(F0, material.albedo, material.metallic);

  // -------------------- cook-torrance brdf --------------------
  float NDF = distributionGGX(N, H, material.roughness);
  float G = geometrySmith(N, V, L, material.roughness);
  vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
  vec3 DFG = NDF * F * G;
  float denom = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
  vec3 specular = DFG / max(denom, 0.001);

  // 使用菲涅尔等式作为镜面高光参数，由于 ks 与 G 是重复计算，所以乘法的时候省去该项操作
  vec3 KS = F;
  vec3 KD = vec3(1.0) - KS;
  // 漫反射 diffuse
  KD *= 1.0 - material.metallic;

  // -------------------- lambert -----------------
  vec3 lambert = KD * pow(material.albedo, vec3 (2.2)) / PI;

  // -------------------- Li --------------------
  float cosTheta = max(dot(N, L), 0.0);
  float distance = length(light.position - v_fragCoord);
  float attenuation = 1.0 / (distance * distance);
  vec3 radiance = light.color * attenuation;

  // 积分处理
  vec3 Lo = vec3(0.0);
  for (float x = 0.0; x <= 2.0; x += 1.) {
    for (float y = 0.0; y <= 2.0; y += 1.) {
      Lo += (lambert + specular) * cosTheta * radiance;
    }
  }

  // 环境光
  vec3 ambient = vec3(0.03) * material.albedo * material.ao;

  // 最终的 pbr 渲染结果
  vec3 color = ambient + Lo;

  color = color / (color + vec3(1.0));
  color = pow(color, vec3(1.0/2.2));  
  
  gl_FragColor = vec4(color, 1.0);
}