attribute vec3 a_position;
attribute vec3 a_normals;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
  vec4 worldPosition = u_model * vec4(a_position, 1.0);
  gl_Position = u_projection * u_view * worldPosition;
}