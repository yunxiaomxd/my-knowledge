export const vertex = `
attribute vec3 a_position;
attribute vec3 a_normals;

uniform mat4 u_mvp;

varying vec4 v_fragCoord;
varying vec3 v_normals;

void main() {
  vec4 position = u_mvp * vec4(a_position, 1.0);
  gl_Position = position;
  v_fragCoord = vec4(a_position, 1.0);
  v_normals = a_normals;
}
`;

export const fragment = `precision mediump float;

uniform vec3 u_eye;
uniform vec3 u_lightColor;
struct Material {
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float shininess;
}; 

uniform Material material;

varying vec4 v_fragCoord;
varying vec3 v_normals;

float pow(float a) {
  float res = a;
  for (int i = 1; i < 32; ++i) {
    res = res * res;
  }
  return res;
}

void main() {

  vec3 objectColor = vec3(1.0, 0.5, 0.31);

  vec3 ambient = material.ambient * u_lightColor;

  vec3 FragPos = vec3(v_fragCoord);
  vec3 lightPos = vec3(.0, 1.0, .0);
  vec3 normal = normalize(v_normals);
  vec3 lightDir = normalize(lightPos - FragPos);
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 diffuse = (diff * material.diffuse) * u_lightColor;

  vec3 viewDir = normalize(u_eye - FragPos);
  vec3 reflectDir = reflect(-lightDir, normal);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0));
  vec3 specular = u_lightColor * (spec * material.specular);

  vec3 result = (ambient + diffuse + specular) * objectColor;

	gl_FragColor = vec4(result, 1.0);	
}
`;