export const vertex = `
attribute vec3 a_position;
varying vec4 v_fragCoord;
uniform mat4 u_mvp;

void main() {
  vec4 position = u_mvp * vec4(a_position, 1.0);
  gl_Position = position;
  v_fragCoord = position;
}
`;

export const fragment = `precision mediump float;

varying vec4 v_fragCoord;

void main() {
	gl_FragColor = vec4(0.3, 0.9, 0.45, 1.);	
}
`;