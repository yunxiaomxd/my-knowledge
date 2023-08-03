attribute vec3 a_position;
attribute vec3 a_normals;

uniform mat4 u_mvp;
uniform mat4 u_model;

varying vec3 v_fragCoord;
varying vec3 v_normals;

void main() {
  vec4 position = u_mvp * vec4(a_position, 1.0);
  gl_Position = position;
  v_fragCoord = vec3(u_model * vec4(a_position, 1.0)).xyz;
  v_normals = a_normals;
}