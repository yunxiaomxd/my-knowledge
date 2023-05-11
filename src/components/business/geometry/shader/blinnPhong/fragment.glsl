precision mediump float;

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

void main() {

  vec3 objectColor = vec3(1.0, 0.5, 0.31);

  vec3 ambient = material.ambient * u_lightColor;

  vec3 FragPos = vec3(v_fragCoord);
  vec3 lightPos = vec3(1.2, 1.0, -2.0);
  vec3 normal = normalize(v_normals);
  vec3 lightDir = normalize(lightPos - FragPos);
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 diffuse = (diff * material.diffuse) * u_lightColor;

  vec3 viewDir = normalize(u_eye - FragPos);
  vec3 reflectDir = reflect(-lightDir, normal);
  vec3 halfwayDir = normalize(lightDir + viewDir);
  float maxDir = max(dot(normal, halfwayDir), .0);
  float spec = pow(maxDir, material.shininess);
  vec3 specular = u_lightColor * (spec * material.specular);

  vec3 result = (ambient + diffuse + specular) * objectColor;

	gl_FragColor = vec4(result, 1.0);	
}