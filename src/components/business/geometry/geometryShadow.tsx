import { createProgram, createShader, degToRad, init, m4 } from "./gl";
import vertex from './shader/shadow/vertex.glsl?raw';
import fragment from './shader/shadow/fragment.glsl?raw';
import { IBufferType, IGeometry, IRenderGeometry } from "./interface";
import { useEffect, useRef } from "react";
import { Container } from "./styled";
import { plane, sphere } from "./algorithm";

class AnimateGL {
  ref: React.RefObject<HTMLCanvasElement> | null = null;
  list: IRenderGeometry[] = [];
  gl: WebGLRenderingContext | null = null;
  program: WebGLProgram | null = null;
  positionLocation: number = 0;
  normalLocation: number = 0;
  renderList = [];

  buffer: IBufferType = {
    vertexBuffer: null,
    normalBuffer: null,
    indexBuffer: null,
  }

  position: number[] = [0, 0, 500];
  target: number[] = [0, 0, 0];
  up = [0, 1, 0];

  timer = 0;

  constructor(ref: React.RefObject<HTMLCanvasElement>) {
    this.ref = ref;
    this.init();
  }

  init = () => {
    const { ref } = this;
    if (!ref) return;
    const { gl } = init(ref);

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex) as WebGLShader;
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment) as WebGLShader;

    const program = createProgram(gl, vertexShader, fragmentShader) as WebGLProgram;
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const normalLocation = gl.getAttribLocation(program, 'a_normals');

    this.gl = gl;
    this.program = program;
    this.positionLocation = positionLocation;
    this.normalLocation = normalLocation;

    this.buffer.vertexBuffer = gl.createBuffer();
    this.buffer.normalBuffer = gl.createBuffer();
    this.buffer.indexBuffer = gl.createBuffer();
  }

  add = (geometry: IGeometry) => {
    const { list, gl, program } = this;
    if (!gl || !program || !geometry) return;

    const { positions, indices, primitiveType, normals } = geometry;

    list.push({ primitiveType, positions, indices, normals, id: Math.random().toString() });
  }

  render = () => {
    const { list, gl, program, positionLocation, normalLocation, buffer } = this;
    if (!gl || !program) return;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);

    const vertex = [], normals = [], indicies = [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      vertex.push(...item.positions);
      normals.push(...item.normals);
      indicies.push(...item.indices);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indicies), gl.STATIC_DRAW);

    const aspect = 933 / 880;
    const zNear = 1;
    const zFar = 2000;
    const fieldOfViewRadians = degToRad(60);

    const modelLocation = gl.getUniformLocation(program, 'u_model');
    const viewLocation = gl.getUniformLocation(program, 'u_view');
    const projectionLocation = gl.getUniformLocation(program, 'u_projection');

    let modelMatrix = m4.identify();
    modelMatrix = m4.xRotate(modelLocation, degToRad(90));
    const cameraMatrix = m4.lookAt(this.position, this.target, this.up);
    const viewMatrix = m4.inverse(cameraMatrix);
    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    const renderAnimate = () => {

      gl.uniformMatrix4fv(modelLocation, false, modelMatrix);
      gl.uniformMatrix4fv(viewLocation, false, viewMatrix);
      gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);

      const size = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;

      gl.enableVertexAttribArray(normalLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.normalBuffer);
      gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertexBuffer);
      gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indexBuffer);

      // gl.drawElements(gl.TRIANGLES, indicies.length, gl.UNSIGNED_SHORT, 0);

      gl.drawArrays(gl.TRIANGLES, offset, vertex.length);
      // this.timer = requestAnimationFrame(renderAnimate);
    };

    renderAnimate();
  }
}


export default function GeometryShadow() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<AnimateGL | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    glRef.current = new AnimateGL(ref);
    // const geometry = plane(100, 100, 2, 2) as IGeometry
    const geometry = sphere([0, 0, 0], 100) as IGeometry
    glRef.current.add(geometry);
    glRef.current.render();
  }, [])

  return (
    <Container>
      <canvas width={640} height={480} ref={ref} />
    </Container>
  )
}