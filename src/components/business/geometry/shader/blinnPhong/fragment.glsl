precision mediump float;

uniform vec3 u_eye;

struct Material {
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float shininess;

  vec3 color;
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

void main() {
  vec3 normal = normalize(v_normals);

  vec3 surfaceToLight = light.position - v_fragCoord;
  vec3 surfaceToView = u_eye - v_fragCoord;

  vec3 surfaceToLightDirection = normalize(surfaceToLight);
  vec3 surfaceToViewDirection = normalize(surfaceToView);
  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

  float dotFromDirection = dot(surfaceToLightDirection, -light.direction);
  float inLight = smoothstep(light.outerAngle, light.innerAngle, dotFromDirection);
  float intensity = inLight * dot(normal, surfaceToLightDirection);
  
  // 高光
  float specularValue = inLight * pow(dot(normal, halfVector), material.shininess);
  vec3 specular = specularValue * material.specular;

  // 漫反射
  float diff = max(dot(normal, vec3(0., 0., 0.)), 0.0);
  vec3 diffuse = diff * material.diffuse;

  // 环境光
  vec3 ambient = material.ambient;

  // 光源衰减计算
  float distance = length(surfaceToLight);
  float attenuationFactor = 150.0 / (1.0 + 0.1 * distance + 0.01 * distance * distance);

  vec3 color = light.color * (specular + diffuse + ambient) * material.color;

  gl_FragColor = vec4(color, 1.0);

  gl_FragColor.rgb *= intensity * attenuationFactor;

  // vec3 normal = normalize(v_normals);

  // // 观察者方向
  // vec3 surfaceToView = normalize(u_eye - v_fragCoord);
  // // 聚光灯照射到物体的方向计算
  // vec3 surfaceToLight = normalize(light.position - v_fragCoord);
  // // 半程向量
  // vec3 halfwayDir = normalize(surfaceToLight + surfaceToView);

  // // 光线衰减能量
  // float distance = length(light.position - v_fragCoord);
  // float attenuation = 150.0 / (1.0 + 0.1 * distance + 0.01 * distance * distance);

  // // 环境光
  // vec3 ambient = material.ambient;

  // // 漫反射
  // float diff = max(dot(normal, light.direction), 0.0);
  // vec3 diffuse = (diff * material.diffuse);

  // // 高光
  // float maxDir = max(dot(normal, halfwayDir), 0.0);
  // float specularValue = pow(maxDir, material.shininess);
  // vec3 specular = specularValue * material.specular;

  // // 计算夹角，对半径范围内的值进行线性插值，最后根据衰减值计算光照强度值
  // float angle = dot(surfaceToLight, -light.direction);
  // float inLight = smoothstep(light.outerAngle, light.innerAngle, angle);
  // float radiance = inLight * dot(normal, surfaceToLight);

  // vec3 color = material.color;

  // gl_FragColor = vec4(color, 1.0);

  // gl_FragColor.rgb *= color;
}

