struct Uniforms {
  modelMatrix: mat4x4<f32>,
  viewMatrix: mat4x4<f32>,
  projectionMatrix: mat4x4<f32>
}
@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexOutput {
  @builtin(position) Position: vec4<f32>,
}

@vertex
fn main(
  @location(0) position: vec4<f32>,
) -> VertexOutput {
  var output : VertexOutput;
  const modelPosition = uniforms.modelMatrix * position;
  output.Position = uniforms.projectionMatrix * uniforms.viewMatrix * modelPosition;
  return output;
}