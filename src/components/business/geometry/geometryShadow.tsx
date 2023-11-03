// import { createProgram, createShader, degToRad, init, m4 } from "./gl";
// import vertex from './shader/shadow/vertex.glsl?raw';
// import fragment from './shader/shadow/fragment.glsl?raw';
// import { IBufferType, IGeometry, IRenderGeometry } from "./interface";
import { useEffect, useRef } from "react";
import { Container } from "./styled";
import vertex from './shader/shadow/vertex.wgsl?raw';
import fragment from './shader/shadow/fragment.wgsl?raw';
import { sphere, plane } from "./algorithm";
import PerspectiveCamera from "./camera/perspectiveCamera";
import MouseSchedule from "./utils/mouseSchedule";
import {createShader, degToRad, writeBufferData} from "./gpu";
import {IGeometry, IRenderGeometry} from "./interface";
import Matrix from "./utils/matrix";

// class AnimateGL {
//   ref: React.RefObject<HTMLCanvasElement> | null = null;
//   list: IRenderGeometry[] = [];
//   gl: WebGLRenderingContext | null = null;
//   program: WebGLProgram | null = null;
//   positionLocation: number = 0;
//   normalLocation: number = 0;
//   renderList = [];

//   buffer: IBufferType = {
//     vertexBuffer: null,
//     normalBuffer: null,
//     indexBuffer: null,
//   }

//   position = [0, 0, 500];
//   target = [0, 0, 0];
//   up = [0, 1, 0];

//   space = {
//     near: 1,
//     far: 2000,
//   }

//   camera: PerspectiveCamera = new PerspectiveCamera(degToRad(60), 640 / 480, 1, 2000);

//   mouseSchedule: MouseSchedule | null = null;

//   timer = 0;

//   constructor(ref: React.RefObject<HTMLCanvasElement>) {
//     this.ref = ref;
//     this.init();
//   }

//   init = () => {
//     const { ref } = this;
//     if (!ref) return;
//     const { gl, canvas } = init(ref);

//     const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex) as WebGLShader;
//     const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment) as WebGLShader;

//     const program = createProgram(gl, vertexShader, fragmentShader) as WebGLProgram;

//     const positionLocation = gl.getAttribLocation(program, 'a_position');
//     const normalLocation = gl.getAttribLocation(program, 'a_normals');

//     this.gl = gl;
//     this.program = program;
//     this.positionLocation = positionLocation;
//     this.normalLocation = normalLocation;

//     this.buffer.vertexBuffer = gl.createBuffer();
//     this.buffer.normalBuffer = gl.createBuffer();
//     this.buffer.indexBuffer = gl.createBuffer();

//     this.camera.position.set(0, -100, 500);
//     this.camera.target.set(0, 0, 0);
//     this.camera.updateViewMatrix();

//     this.mouseSchedule = new MouseSchedule(canvas, this.camera);
//     this.mouseSchedule.registCallback('mousemove', this.render);
//   }

//   add = (geometry: IGeometry) => {
//     const { list, gl, program } = this;
//     if (!gl || !program || !geometry) return;

//     const { positions, indices, primitiveType, normals } = geometry;

//     list.push({ primitiveType, positions, indices, normals, id: Math.random().toString() });
//   }

//   render = () => {
//     const { list, gl, program, positionLocation, normalLocation, buffer, camera } = this;
//     if (!gl || !program) return;
//     gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
//     gl.clearColor(0, 0, 0, 1);
//     gl.clear(gl.COLOR_BUFFER_BIT);
//     gl.enable(gl.CULL_FACE);
//     gl.cullFace(gl.BACK);
//     gl.enable(gl.DEPTH_TEST);

//     gl.useProgram(program);

//     const vertex = [], normals = [], indicies = [];
//     for (let i = 0; i < list.length; i++) {
//       const item = list[i];
//       vertex.push(...item.positions);
//       normals.push(...item.normals);
//       indicies.push(...item.indices);
//     }

//     gl.bindBuffer(gl.ARRAY_BUFFER, buffer.normalBuffer);
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

//     gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertexBuffer);
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.STATIC_DRAW);

//     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indexBuffer);
//     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indicies), gl.STATIC_DRAW);

//     let modelMatrix = m4.identify();

//     const modelLocation = gl.getUniformLocation(program, 'u_model');
//     const viewLocation = gl.getUniformLocation(program, 'u_view');
//     const projectionLocation = gl.getUniformLocation(program, 'u_projection');

//     const size = 3;
//     const type = gl.FLOAT;
//     const normalize = false;
//     const stride = 0;
//     const offset = 0;

//     gl.enableVertexAttribArray(positionLocation);
//     gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertexBuffer);
//     gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

//     gl.enableVertexAttribArray(normalLocation);
//     gl.bindBuffer(gl.ARRAY_BUFFER, buffer.normalBuffer);
//     gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

//     gl.uniformMatrix4fv(modelLocation, false, modelMatrix);
//     gl.uniformMatrix4fv(viewLocation, false, camera.viewMatrix.elements);
//     gl.uniformMatrix4fv(projectionLocation, false, camera.projectionMatrix.elements);
    
//     // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indexBuffer);
//     // gl.drawElements(gl.TRIANGLES, indicies.length, gl.UNSIGNED_SHORT, 0);
//     gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertexBuffer);
//     gl.drawArrays(gl.TRIANGLES, 0, 3);
//   }
// }

class AnimateGPU {
  element: HTMLCanvasElement;
  device: GPUDevice | null = null;
  adapter: GPUAdapter | null = null;

  renderPipeline: GPURenderPipeline | null = null;
  vertexBuffer: GPUBuffer | null = null;
  indicesBuffer: GPUBuffer | null = null;
  matrixBuffer: GPUBuffer | null = null;

  list: IRenderGeometry[] = [];

  camera: PerspectiveCamera = new PerspectiveCamera(degToRad(60), 640 / 480, 1, 2000);

  mouseSchedule: MouseSchedule | null = null;

  constructor(element: HTMLCanvasElement) {
    this.element = element;
  }

  async initGpu() {
    const ctx = this.element.getContext('webgpu')!;
    this.element.width = 640;
    this.element.height = 480;

    const adapter = (await navigator.gpu.requestAdapter())!;
    const device = await adapter.requestDevice();
    const format = navigator.gpu.getPreferredCanvasFormat();

    ctx.configure({
      device,
      format,
      alphaMode: 'opaque',
    });

    const vertexShader = createShader(device, vertex);
    const fragmentShader =createShader(device, fragment);

    const vertexBuffer = device.createBuffer({
      size: 0,
      usage: GPUBufferUsage.COPY_DST,
    });
    const indicesBuffer = device.createBuffer(({
      size: 0,
      usage: GPUBufferUsage.COPY_DST,
    }));
    const matrixBuffer = device.createBuffer(({
      size: 0,
      usage: GPUBufferUsage.COPY_DST,
    }));

    this.device = device;
    this.adapter = adapter;
    this.vertexBuffer = vertexBuffer;
    this.indicesBuffer = indicesBuffer;
    this.matrixBuffer = matrixBuffer;
    this.renderPipeline = await device.createRenderPipelineAsync({
      layout: 'auto',
      vertex: {
        module: vertexShader,
        entryPoint: 'main',
        buffers: [
          {
            arrayStride: 3 * 4,
            attributes: [
              {
                shaderLocation: 0,
                offset: 0,
                format: 'float32x3',
              }
            ]
          }
        ]
      },
      fragment: {
        module: fragmentShader,
        entryPoint: 'main',
        targets: [{ format }],
      },
      primitive: {
        topology: 'triangle-strip',
        cullMode: 'back',
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus',
      }
    });

    this.camera.position.set(0, -100, 500);
    this.camera.target.set(0, 0, 0);
    this.camera.updateViewMatrix();

    this.mouseSchedule = new MouseSchedule(this.element, this.camera);
    this.mouseSchedule.registCallback('mousemove', this.render);
  }

  add = (geometry: IGeometry) => {
    const { positions, indices, primitiveType, normals } = geometry;

    this.list.push({ primitiveType, positions, indices, normals, id: Math.random().toString() });
  }

  render() {
    const {
      list,
      camera,
      device,
      indicesBuffer,
      vertexBuffer,
      matrixBuffer,
      renderPipeline,
    } = this;
    
    if (!device) {
      return;
    }

    const vertex = [], normals = [], indicies = [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      vertex.push(...item.positions);
      normals.push(...item.normals);
      indicies.push(...item.indices);
    }

    const modelMatrix = new Matrix();
    const matrix = [...modelMatrix.elements, ...camera.viewMatrix.elements, ...camera.projectionMatrix.elements];
    writeBufferData({ device, buffer: matrixBuffer!, offset: 0, array: new Float32Array(matrix) });
  }
}

export default function GeometryShadow() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const gpuRef = useRef<AnimateGPU | null>(null);
  // const glRef = useRef<AnimateGL | null>(null);

  // useEffect(() => {
  //   if (!ref.current) return;
  //   glRef.current = new AnimateGL(ref);
  //   const geometry = plane(200, 120, 100, 60) as IGeometry;
  //   // const geometry = sphere([0, 0, 0], 100) as IGeometry;
  //   console.log(geometry);
  //   glRef.current.add(geometry);
  //   glRef.current.render();
  // }, [])

  useEffect(() => {
      if (!ref.current) return;
      gpuRef.current = new AnimateGPU(ref.current);
      const geometry = plane(200, 120, 100, 60) as IGeometry;
      // gpuRef.current.add(geometry);
  }, []);

  const handleAdd = () => {
    if (!gpuRef.current?.device) {
      return;
    }
    const geometry = plane(200, 120, 100, 60) as IGeometry;
    gpuRef.current.add(geometry);
    gpuRef.current.render();
  }

  return (
    <Container>
      <button onClick={handleAdd}>add</button>
      <canvas width={640} height={480} ref={ref} />
    </Container>
  )
}