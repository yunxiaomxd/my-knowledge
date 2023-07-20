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
  vec3 direction;
  float angle;
};

uniform Light light;
uniform Material material;

varying vec3 v_fragCoord;
varying vec3 v_normals;

void main() {

  vec3 objectColor = vec3(1.0, 0.5, 0.31);

  // 聚光灯照射到物体的方向计算
  vec3 lightDirection = normalize(light.position - v_fragCoord);

  // 光线衰减能量
  float distance = length(light.position - v_fragCoord);
  float attenuation = 1.0 / (1.0 + 0.1 * distance + 0.01 * distance * distance);

  // 计算聚光灯影响因子，限制角度
  float angleDot = dot(-light.direction, normalize(lightDirection));
  float angleFactor = smoothstep(light.angle, light.angle + 0.1, acos(angleDot));

  // 环境光
  vec3 ambient = material.ambient * light.color;

  // 漫反射
  vec3 normal = normalize(v_normals);
  float diff = max(dot(normal, light.direction), 0.0);
  vec3 diffuse = (diff * material.diffuse) * light.color;

  // 高光
  vec3 viewDir = normalize(u_eye - v_fragCoord);
  vec3 reflectDir = reflect(-lightDirection, normal);
  vec3 halfwayDir = normalize(lightDirection + viewDir);
  float maxDir = max(dot(normal, halfwayDir), .0);
  float spec = pow(maxDir, material.shininess);
  vec3 specular = light.color * (spec * material.specular);

  vec3 result = (ambient + diffuse + specular) * objectColor * 0.3;

	gl_FragColor = vec4(result, 1.0);	
}