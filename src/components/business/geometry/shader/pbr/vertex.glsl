attribute vec3 a_position;
attribute vec3 a_normals;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

varying vec3 v_fragCoord;
varying vec3 v_normals;

void main() {
  gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);

  v_fragCoord = vec3(u_model * vec4(a_position, 1.0)).xyz;
  v_normals = a_normals;
}