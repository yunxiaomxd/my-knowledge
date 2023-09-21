attribute vec3 a_position;
attribute vec3 a_normals;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_mvp;

varying vec3 v_fragCoord;
varying vec3 v_normals;

void main() {
  vec4 model_position = u_model * vec4(a_position, 1.0);
  gl_Position = u_projection * u_view * model_position;
  v_fragCoord = model_position.xyz;
  v_normals = a_normals;
}