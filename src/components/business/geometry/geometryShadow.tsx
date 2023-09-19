import { createProgram, createShader, degToRad, init, m4 } from "./gl";
import vertex from './shader/shadow/vertex.glsl?raw';
import fragment from './shader/shadow/fragment.glsl?raw';
import { EPrimitiveType, IBufferType, IGeometry, IRenderGeometry } from "./interface";

class AnimateGL {
  ref: React.RefObject<HTMLCanvasElement> | null = null;
  list: IRenderGeometry[] = [];
  gl: WebGLRenderingContext | null = null;
  program: WebGLProgram | null = null;
  positionLocation: number = 0;
  normalLocation: number = 0;
  renderList = [];

  position: number[] = [0, 0, 500];
  target: number[] = [0, 0, 0];
  up = [0, 1, 0];

  timer = 0;

  buffer: IBufferType = {
    vertexBuffer: null,
    indexBuffer: null,
    normalBuffer: null,
  }

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
    this.buffer.indexBuffer = gl.createBuffer();
    this.buffer.normalBuffer = gl.createBuffer();
  }

  add = (geometry: IGeometry) => {
    const { list, gl, program } = this;
    if (!gl || !program || !geometry) return;

    const { positions, indices, primitiveType, normals } = geometry;

    list.push({ primitiveType, indices, normals, positions, id: Math.random().toString() });
  }

  render = () => {
    const { list, gl, program, positionLocation, normalLocation, buffer } = this;
    if (!gl || !program) return;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);

    const size = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    const vertex = [];
    const indices = [];
    const normals = [];

    /*************  批量合并处理  *************/
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      vertex.push(...item.positions);
      indices.push(...item.indices);
      normals.push(...item.normals);
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    /*************  激活成员属性  *************/
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(normalLocation);
    gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

    /*************  MVP 矩阵设置  *************/
    const modelLocation = gl.getUniformLocation(program, 'u_model');
    const viewLocation = gl.getUniformLocation(program, 'u_view');
    const projectionLocation = gl.getUniformLocation(program, 'u_projection');

    const aspect = 933 / 880;
    const zNear = 1;
    const zFar = 2000;

    var fieldOfViewRadians = degToRad(60);

    const modelMatrix = m4.identify();
    const cameraMatrix = m4.lookAt(this.position, this.target, this.up);
    const viewMatrix = m4.inverse(cameraMatrix);
    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    const renderAnimate = () => {

      gl.uniformMatrix4fv(modelLocation, false, modelMatrix);
      gl.uniformMatrix4fv(viewLocation, false, viewMatrix);
      gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);

      let offset = 0;

      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (item.primitiveType === EPrimitiveType.TRIANGLES) {
          gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, offset);
          offset += 3;
          continue;
        }
      }

      // this.timer = requestAnimationFrame(renderAnimate);
    };

    renderAnimate();
  }
}