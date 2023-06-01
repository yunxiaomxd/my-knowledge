import { useCallback, useEffect, useRef, useState } from "react";
import { init, createShader, createProgram, m4, degToRad } from "./gl";
import vertex from "./shader/pbr/vertex.glsl?raw";
import fragment from "./shader/pbr/fragment.glsl?raw";
import { Container, Content, Menu, MenuItem, Panel, PanelContent, PanelTitle } from "./styled";
import { torus, bezierCurve, lineNoise, surfaceNoise, cubic, plane, sphere } from "./algorithm";

enum EGeometry {
  Torus,
  BezierCurves,
  LineNoise,
  // SurfaceNoise,
  // Plane,
  Cubic,
  Sphere,
}

type TMaterialNumberField = 'metallic' | 'roughness' | 'ao';
type TMaterialField = 'albedo' | TMaterialNumberField;

const geometryMap = {
  [EGeometry.Torus]: torus(),
  [EGeometry.BezierCurves]: bezierCurve(),
  [EGeometry.LineNoise]: lineNoise(),
  // [EGeometry.SurfaceNoise]: surfaceNoise(),
  // [EGeometry.Plane]: plane(7500, 7500, worldWidth - 1, worldDepth - 1),
  [EGeometry.Cubic]: cubic(300, 300, 300, [0, 0, -1000]),
  [EGeometry.Sphere]: sphere([0, 0, -1000], 150),
}

interface IRenderGeometry { positionBuffer: WebGLBuffer; normalBuffer?: WebGLBuffer; indexBuffer?: WebGLBuffer; primitiveType: string; positionCount: number; indexCount?: number; };

interface IGeometry { positions: number[]; indices: number[]; normals?: number[]; primitiveType: string };

const defaultZ = 0;
const targetZ = -2000;

class AnimateGL {
  ref: React.RefObject<HTMLCanvasElement> | null = null;
  list: IRenderGeometry[] = [];
  gl: WebGLRenderingContext | null = null;
  program: WebGLProgram | null = null;
  positionLocation: number = 0;
  normalLocation: number = 0;
  renderList = [];

  rotate = {
    x: 0,
    y: 0,
    z: 0,
  };

  position: number[] = [0, 0, defaultZ];
  target: number[] = [0, 0, targetZ];
  up = [0, 1, 0];

  material = {
    // 反射率
    albedo: [0.5, 0, 0],
    // 光泽度
    metallic: 0,
    // 粗糙度
    roughness: 0.2,
    ao: 1,
  }

  light = {
    color: [1.0, 0.5, 1.0],
    position: [0, 0, 0],
  }

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

    const { positions, indices, primitiveType, normals } = geometry;

    const positionBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    list.push({ positionBuffer, primitiveType: primitiveType, positionCount: positions.length / 3 });
    if (indices.length > 0) {
      const indexBuffer = gl.createBuffer() as WebGLBuffer;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

      list[list.length - 1].indexBuffer = indexBuffer;
      list[list.length - 1].indexCount = indices.length;
    }

    if (normals) {
      const normalBuffer = gl.createBuffer() as WebGLBuffer;
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
      list[list.length - 1].normalBuffer = normalBuffer;
    }
  }

  render = () => {
    const { list, gl, program, positionLocation, normalLocation, material, light, rotate } = this;
    if (!gl || !program) return;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform2fv(resolutionLocation, new Float32Array([gl.canvas.width, gl.canvas.height]));

    const eyeLocation = gl.getUniformLocation(program, 'u_eye');
    gl.uniform3fv(eyeLocation, new Float32Array(this.position));

    const albedoLocation = gl.getUniformLocation(program, 'material.albedo');
    const metallicLocation = gl.getUniformLocation(program, 'material.metallic');
    const roughnessLocation = gl.getUniformLocation(program, 'material.roughness');
    const aoLocation = gl.getUniformLocation(program, 'material.ao');

    gl.uniform3fv(albedoLocation, new Float32Array(material.albedo));
    gl.uniform1f(metallicLocation, material.metallic);
    gl.uniform1f(roughnessLocation, material.roughness);
    gl.uniform1f(aoLocation, material.ao);

    const lightColorLocation = gl.getUniformLocation(program, 'light.color');
    const lightPoistionLocation = gl.getUniformLocation(program, 'light.position');
    gl.uniform3fv(lightColorLocation, new Float32Array(light.color));
    gl.uniform3fv(lightPoistionLocation, new Float32Array(light.position));
    
    const mvpLocation = gl.getUniformLocation(program, "u_mvp");

    const aspect = gl.canvas.width / gl.canvas.height;
    const zNear = 1;
    const zFar = 2000;

    var fieldOfViewRadians = degToRad(30);

    let modelMatrix = m4.identify();
    modelMatrix = m4.xRotate(modelMatrix, degToRad(rotate.x));
    modelMatrix = m4.yRotate(modelMatrix, degToRad(rotate.y));
    modelMatrix = m4.zRotate(modelMatrix, degToRad(rotate.z));

    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    const cameraMatrix = m4.lookAt(this.position, this.target, this.up);
    const viewMatrix = m4.inverse(cameraMatrix);

    let matrix = m4.multiply(projectionMatrix, viewMatrix);
    matrix = m4.multiply(matrix, modelMatrix);

    const renderAnimate = () => {

      gl.uniformMatrix4fv(mvpLocation, false, matrix);

      const size = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;

      gl.enableVertexAttribArray(normalLocation);
      for (let i = 0; i < list.length; i++) {
        const { normalBuffer } = list[i];
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer as WebGLBuffer);
        gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);
      }

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

    };

    renderAnimate();
  }
}

const GeometryPBR = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [instance, setInstance] = useState<AnimateGL>();

  const toggleGeometry = useCallback((type: EGeometry) => {
    let geometry: IGeometry = geometryMap[type];
    console.log(geometry);
    instance?.add(geometry as IGeometry);
    instance?.render();
  }, [instance]);

  const handleChangeMaterial = (type: TMaterialField, index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = +e.target.value;
    if (type !== 'albedo') {
      instance!.material[type] = value;
    } else {
      instance!.material.albedo[index] = value;
    }
    instance?.render();
  }

  const handleChangeLight = (index: number, e: React.ChangeEvent<HTMLInputElement>, type: 'color' | 'position' = 'color') => {
    const value = +e.target.value;
    instance!.light[type][index] = value;
    instance?.render();
  }

  useEffect(() => {
    if (ref.current) {
      const animateGL = new AnimateGL(ref);
      setInstance(animateGL);
      // animateGL.add(geometryMap[EGeometry.Torus]);
      // animateGL.render();
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
          {/* <MenuItem onClick={() => toggleGeometry(EGeometry.SurfaceNoise)}>模拟地形</MenuItem>
          &nbsp;&nbsp;
          <MenuItem onClick={() => toggleGeometry(EGeometry.Plane)}>网格平面</MenuItem>
          &nbsp;&nbsp; */}
          <MenuItem onClick={() => toggleGeometry(EGeometry.Cubic)}>正方体</MenuItem>
          &nbsp;&nbsp;
          <MenuItem onClick={() => toggleGeometry(EGeometry.Sphere)}>球</MenuItem>
        </Menu>
        <div style={{ display: 'flex' }}>
          <canvas width={640} height={640} ref={ref} />
          {instance && <div>
            <Panel>
              <PanelTitle>旋转</PanelTitle>
              <PanelContent>
                x: <input defaultValue={0} type="range" min={0} max={360} onChange={(e) => {
                  instance!.setRotateX(+e.target.value)
                  instance?.render();
                }} />
                <br />
                y: <input defaultValue={0} type="range" min={0} max={360} onChange={(e) => {
                  instance!.setRotateY(+e.target.value)
                  instance?.render();
                }} />
                <br />
                z: <input defaultValue={0} type="range" min={0} max={360} onChange={(e) => {
                  instance!.setRotateZ(+e.target.value)
                  instance?.render();
                }} />
              </PanelContent>
            </Panel>
            <Panel>
              <PanelTitle>相机位置</PanelTitle>
              <PanelContent>
                x: <input  type="range" min={-2000} max={2000} onChange={(e) => {
                  instance!.position[0] = +e.target.value;
                  instance?.render();
                }} />
                <br />
                y: <input type="range" min={-2000} max={2000} onChange={(e) => {
                  instance!.position[1] = +e.target.value;
                  instance?.render();
                }} />
                <br />
                z: <input defaultValue={defaultZ} type="range" min={-2000} max={0} onChange={(e) => {
                  instance!.position[2] = +e.target.value;
                  instance?.render();
                }} />
              </PanelContent>
            </Panel>
            <Panel>
              <PanelTitle>材质</PanelTitle>
              <PanelContent>
                albedo: <br />
                <input type="range" min={0} max={1} step={0.01} defaultValue={instance.material.albedo[0]} onChange={(e) => handleChangeMaterial('albedo', 0, e)} />
                <input type="range" min={0} max={1} step={0.01} defaultValue={instance.material.albedo[1]} onChange={(e) => handleChangeMaterial('albedo', 1, e)} />
                <input type="range" min={0} max={1} step={0.01} defaultValue={instance.material.albedo[2]} onChange={(e) => handleChangeMaterial('albedo', 2, e)} />
                {
                  ['metallic', 'roughness', 'ao'].map((v: string) => {
                    const key = v as TMaterialNumberField;
                    return (
                      <div key={v}>
                        {v}:
                        <br />
                        <input type="range" min={0} max={1} step={0.01} defaultValue={instance.material[key]} onChange={(e) => handleChangeMaterial(key, -1, e)} />
                        <br />
                      </div>
                    )
                  })
                }
              </PanelContent>
            </Panel>
            <Panel>
              <PanelTitle>灯光颜色</PanelTitle>
              <PanelContent>
                <input type="range" min={0} max={1} step={0.01} defaultValue={instance.light.color[0]} onChange={(e) => handleChangeLight(0, e)} />
                <input type="range" min={0} max={1} step={0.01} defaultValue={instance.light.color[1]} onChange={(e) => handleChangeLight(1, e)} />
                <input type="range" min={0} max={1} step={0.01} defaultValue={instance.light.color[2]} onChange={(e) => handleChangeLight(2, e)} />
              </PanelContent>
            </Panel>
            <Panel>
              <PanelTitle>灯光位置</PanelTitle>
              <PanelContent>
                <input type="range" min={-2000} max={2000} step={0.01} defaultValue={instance?.light.position[0]} onChange={(e) => handleChangeLight(0, e, 'position')} />
                <input type="range" min={-2000} max={2000} step={0.01} defaultValue={instance?.light.position[1]} onChange={(e) => handleChangeLight(1, e, 'position')} />
                <input type="range" min={-2000} max={2000} step={0.01} defaultValue={instance?.light.position[2]} onChange={(e) => handleChangeLight(2, e, 'position')} />
              </PanelContent>
            </Panel>
          </div>}
        </div>
      </Content>
    </Container>
  );
};

export default GeometryPBR;