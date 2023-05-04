import { useCallback, useEffect, useRef, useState } from "react";
import { init, createShader, createProgram, m4, degToRad } from "./gl";
import { vertex, fragment } from "./shader";
import { Container, Content, Menu, MenuItem } from "./styled";
import { torus, bezierCurve, lineNoise, surfaceNoise, plane } from "./algorithm";

enum EGeometry {
  Torus,
  BezierCurves,
  LineNoise,
  SurfaceNoise,
  Plane
}

const worldWidth = 256, worldDepth = 256;
const geometryMap = {
  [EGeometry.Torus]: torus(),
  [EGeometry.BezierCurves]: bezierCurve(),
  [EGeometry.LineNoise]: lineNoise(),
  // [EGeometry.SurfaceNoise]: surfaceNoise(),
  [EGeometry.Plane]: plane(7500, 7500, worldWidth - 1, worldDepth - 1),
}

interface IRenderGeometry { positionBuffer: WebGLBuffer, indexBuffer?: WebGLBuffer, primitiveType: string; positionCount: number; indexCount?: number; };

interface IGeometry { positions: number[]; indices: number[], primitiveType: string };

const defaultZ = -1;
const targetZ = -1000

class AnimateGL {
  ref: React.RefObject<HTMLCanvasElement> | null = null;
  list: IRenderGeometry[] = [];
  gl: WebGLRenderingContext | null = null;
  program: WebGLProgram | null = null;
  positionLocation: number = 0;
  renderList = [];

  rotate = {
    x: 0,
    y: 0,
    z: 0,
  };

  
  position: number[] = [0, 0, defaultZ];
  target: number[] = [0, 0, targetZ];
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

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex) as WebGLShader;
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment) as WebGLShader;

    const program = createProgram(gl, vertexShader, fragmentShader) as WebGLProgram;
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');

    this.gl = gl;
    this.program = program;
    this.positionLocation = positionLocation;
  }

  setRotateX = (value: number) => {
    this.rotate.x = value;
  }

  setRotateY = (value: number) => {
    this.rotate.y = value;
  }

  setRotateZ = (value: number) => {
    this.rotate.z = value;
  }

  add = (geometry: IGeometry) => {
    const { list, gl, program } = this;
    if (!gl || !program || !geometry) return;

    const positionBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions), gl.STATIC_DRAW);

    list.push({ positionBuffer, primitiveType: geometry.primitiveType, positionCount: geometry.positions.length / 3 });
    if (geometry.indices.length > 0) {
      const indexBuffer = gl.createBuffer() as WebGLBuffer;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);

      list[list.length - 1].indexBuffer = indexBuffer;
      list[list.length - 1].indexCount = geometry.indices.length;
    }
  }

  render = () => {
    const { list, gl, program, positionLocation } = this;
    if (!gl || !program) return;

    const mvpLocation = gl.getUniformLocation(program, "u_mvp");

    const aspect = gl.canvas.width / gl.canvas.height;
    const zNear = 1;
    const zFar = 2000;

    var fieldOfViewRadians = degToRad(60);

    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    const cameraMatrix = m4.lookAt(this.position, this.target, this.up);
    const matrix = m4.multiply(projectionMatrix, cameraMatrix);

    const renderAnimate = () => {

      gl.uniformMatrix4fv(mvpLocation, false, matrix);

      const size = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;

      gl.enableVertexAttribArray(positionLocation);

      for (let i = 0; i < list.length; i++) {
        const { primitiveType, positionCount, indexCount, indexBuffer, positionBuffer } = list[i];
        const geometryPrimitiveType = (gl as any)[primitiveType];
        if (indexCount) {
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer as WebGLBuffer);
          gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer as WebGLBuffer);
          gl.drawElements(geometryPrimitiveType, indexCount, gl.UNSIGNED_SHORT, 0);
        } else {
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer as WebGLBuffer);
          gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
          gl.drawArrays(geometryPrimitiveType, offset, positionCount);
        }
      }

      // this.timer = requestAnimationFrame(renderAnimate);
    };

    renderAnimate();
  }
}

const Geometry = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [instance, setInstance] = useState<AnimateGL>();

  const toggleGeometry = useCallback((type: EGeometry) => {
    let geometry: IGeometry = geometryMap[type];
    // console.log(geometry);
    instance?.add(geometry as IGeometry);
    instance?.render();
  }, [instance]);

  useEffect(() => {
    if (ref.current) {
      const animateGL = new AnimateGL(ref);
      setInstance(animateGL);
    }
  }, [ref]);

  return (
    <Container>
      <div>几何绘制</div>
      <Content>
        <Menu>
          <MenuItem onClick={() => toggleGeometry(EGeometry.Torus)}>圆环</MenuItem>
          &nbsp;&nbsp;
          <MenuItem onClick={() => toggleGeometry(EGeometry.BezierCurves)}>贝塞尔曲线</MenuItem>
          &nbsp;&nbsp;
          <MenuItem onClick={() => toggleGeometry(EGeometry.LineNoise)}>线条噪音</MenuItem>
          &nbsp;&nbsp;
          <MenuItem onClick={() => toggleGeometry(EGeometry.SurfaceNoise)}>模拟地形</MenuItem>
          &nbsp;&nbsp;
          <MenuItem onClick={() => toggleGeometry(EGeometry.Plane)}>网格平面</MenuItem>
        </Menu>
        <input type="range" min={-2000} max={2000} onChange={(e) => {
          instance!.position[0] = +e.target.value;
          instance?.render();
        }} />
        <input type="range" min={-2000} max={2000} onChange={(e) => {
          instance!.position[1] = +e.target.value;
          instance?.render();
        }} />
        <input defaultValue={defaultZ} type="range" min={-2000} max={0} onChange={(e) => {
          instance!.position[2] = +e.target.value;
          instance?.render();
        }} />
        <br />
        <canvas width={640} height={480} ref={ref} />
      </Content>
    </Container>
  );
};

export default Geometry;