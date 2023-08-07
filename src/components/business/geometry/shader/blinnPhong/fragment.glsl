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

  // 计算照射的范围，对于 inner 与 outer 进行平滑过渡计算
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
  float attenuationFactor = 250.0 / (1.0 + 0.1 * distance + 0.01 * distance * distance);

  vec3 color = light.color * (specular + diffuse + ambient) * material.color;

  gl_FragColor = vec4(color, 1.0);

  gl_FragColor.rgb *= intensity * attenuationFactor;
}

