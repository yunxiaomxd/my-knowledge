precision mediump float;

uniform vec3 u_eye;

struct Material {
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float shininess;
};

struct Light {
  vec3 position;
  vec3 color;
  vec3 direction; // 光线法线方向

  float innerAngle;
  float outerAngle;
};

uniform Light light;
uniform Material material;

varying vec3 v_fragCoord;
varying vec3 v_normals;

// vec3 normal = normalize(v_normal);

//   // 光线 -> 物体方向
// vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
// // 观察 -> 物体方向
// vec3 surfaceToViewDirection = normalize(v_surfaceToView);
// // 计算方半程向量
// vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

// // 光线衰减能量
// float distance = length(v_surfaceToLight);
// float attenuation = 150.0 / (1.0 + 0.1 * distance + 0.01 * distance * distance);

// // 环境光
// vec3 ambient = vec3(0.3, 0.2, 0.1);

// // 漫反射
// float diff = max(dot(normal, u_lightDirection), 0.0);
// vec3 diffuse = (diff * vec3(0.8, 0.9, 0.3));

// // 高光
// float maxDir = max(dot(normal, halfVector), 0.0);
// float specularValue = pow(maxDir, 2.0);
// vec3 specular = u_color.rgb * specularValue;

// // 计算夹角，对半径范围内的值进行线性插值，最后根据衰减值计算光照强度值
// float angle = dot(surfaceToLightDirection, -u_lightDirection);
// float inLight = smoothstep(u_outerLimit, u_innerLimit, angle);
// float light = inLight * dot(normal, surfaceToLightDirection) * attenuation;

// vec3 color = (ambient + diffuse + specular) * light;

// gl_FragColor = u_color;

// gl_FragColor.rgb *= color;

void main() {

  vec3 objectColor = vec3(1.0, 0.5, 0.31);

  // 观察者方向
  vec3 surfaceToView = normalize(u_eye - v_fragCoord);
  // 聚光灯照射到物体的方向计算
  vec3 surfaceToLight = normalize(light.position - v_fragCoord);

  // 光线衰减能量
  float distance = length(light.position - v_fragCoord);
  float attenuation = 1000.0 / (1.0 + 0.1 * distance + 0.01 * distance * distance);

  // 环境光
  vec3 ambient = material.ambient;

  // 漫反射
  vec3 normal = normalize(v_normals);
  float diff = max(dot(normal, light.direction), 0.0);
  vec3 diffuse = (diff * material.diffuse);

  // 高光
  vec3 halfwayDir = normalize(surfaceToLight + surfaceToView);
  float maxDir = max(dot(normal, halfwayDir), .0);
  float specularValue = pow(maxDir, material.shininess);
  vec3 specular = specularValue * material.specular;

  // 计算夹角，对半径范围内的值进行线性插值，最后根据衰减值计算光照强度值
  float angle = dot(surfaceToLight, -light.direction);
  float inLight = smoothstep(light.outerAngle, light.innerAngle, angle);
  float radiance = inLight * dot(normal, surfaceToLight) * attenuation;

  vec3 color = (specular + diffuse + ambient) * light.color * objectColor;

  gl_FragColor = vec4(color, 1.0);
}