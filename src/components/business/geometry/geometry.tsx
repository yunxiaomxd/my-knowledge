import { useCallback, useEffect, useRef, useState } from "react";
import { init, createShader, createProgram, m4, degToRad } from "./gl";
import { Container, Content, Menu, MenuItem, Panel, PanelContent, PanelTitle } from "./styled";
import { torus, bezierCurve, lineNoise, surfaceNoise, cubic, plane, sphere } from "./algorithm";
import vertex from './shader/blinnPhong/vertex.glsl?raw';
import fragment from './shader/blinnPhong/fragment.glsl?raw';

enum EGeometry {
  Torus,
  BezierCurves,
  LineNoise,
  Cubic,
  Sphere
}

type TMaterialField = 'ambient' | 'diffuse' | 'specular' | 'shininess';

const worldWidth = 256, worldDepth = 256;
const geometryMap = {
  [EGeometry.Torus]: torus(),
  [EGeometry.BezierCurves]: bezierCurve(),
  [EGeometry.LineNoise]: lineNoise(),
  [EGeometry.Cubic]: cubic(100, 100, 100, [0, 0, 0]),
  [EGeometry.Sphere]: sphere([0, 0, ])
}

interface IRenderGeometry { positionBuffer: WebGLBuffer; normalBuffer?: WebGLBuffer; indexBuffer?: WebGLBuffer; primitiveType: string; positionCount: number; indexCount?: number; };

interface IGeometry { positions: number[]; indices: number[]; normals?: number[]; primitiveType: string };

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

  position: number[] = [0, 0, 500];
  target: number[] = [0, 0, 0];
  up = [0, 1, 0];

  material = {
    ambient: [1.0, 0.5, 0.31],
    diffuse: [1.0, 0.5, 0.31],
    specular: [0.5, 0.5, 0.5],
    shininess: 150,
    color: [0.6, 0.2, 0.7],
  }

  light = {
    position: [40, 60, 120],
    color: [1.0, 1.0, 1.0],
    innerAngle: Math.cos(degToRad(10)),
    outerAngle: Math.cos(degToRad(20)),
    direction: [],
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
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);

    
    let directionMatrix = m4.identify();
    directionMatrix = m4.lookAt(light.position, this.target, this.up);

    const ambientLocation = gl.getUniformLocation(program, 'material.ambient');
    const diffuseLocation = gl.getUniformLocation(program, 'material.diffuse');
    const specularLocation = gl.getUniformLocation(program, 'material.specular');
    const shininessLocation = gl.getUniformLocation(program, 'material.shininess');
    const colorLocation = gl.getUniformLocation(program, 'material.color');
    gl.uniform3fv(ambientLocation, new Float32Array(material.ambient));
    gl.uniform3fv(diffuseLocation, new Float32Array(material.diffuse));
    gl.uniform3fv(specularLocation, new Float32Array(material.specular));
    gl.uniform1f(shininessLocation, material.shininess);
    gl.uniform3fv(colorLocation, new Float32Array(material.color));

    const lightPositionLocation = gl.getUniformLocation(program, 'light.position');
    const lightColorLocation = gl.getUniformLocation(program, 'light.color');
    const lightDirectionLocation = gl.getUniformLocation(program, 'light.direction');
    const lightInnerAngleLocation = gl.getUniformLocation(program, 'light.innerAngle');
    const lightOuterAngleLocation = gl.getUniformLocation(program, 'light.outerAngle');
    gl.uniform3fv(lightPositionLocation, new Float32Array(light.position));
    gl.uniform3fv(lightColorLocation, new Float32Array(light.color));
    gl.uniform3fv(lightDirectionLocation, new Float32Array([-directionMatrix[8], -directionMatrix[9], -directionMatrix[10]]));
    gl.uniform1f(lightInnerAngleLocation, light.innerAngle);
    gl.uniform1f(lightOuterAngleLocation, light.outerAngle);

    const eyeLocation = gl.getUniformLocation(program, 'u_eye');
    gl.uniform3fv(eyeLocation, new Float32Array(this.position));

    const mvpLocation = gl.getUniformLocation(program, "u_mvp");

    const aspect = 933 / 880;
    const zNear = 1;
    const zFar = 2000;

    var fieldOfViewRadians = degToRad(60);

    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    const cameraMatrix = m4.lookAt(this.position, this.target, this.up);
    const cameraInverseMatrix = m4.inverse(cameraMatrix);

    let modelMatrix = m4.identify();
    modelMatrix = m4.xRotate(modelMatrix, degToRad(rotate.x));
    modelMatrix = m4.yRotate(modelMatrix, degToRad(rotate.y));
    modelMatrix = m4.zRotate(modelMatrix, degToRad(rotate.z));
    
    let matrix = m4.multiply(projectionMatrix, cameraInverseMatrix);
    matrix = m4.multiply(matrix, modelMatrix);

    const modelLocation = gl.getUniformLocation(program, 'u_model');

    const renderAnimate = () => {

      gl.uniformMatrix4fv(mvpLocation, false, matrix);
      gl.uniformMatrix4fv(modelLocation, false, modelMatrix);

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

  const handleChangeMaterial = (type: TMaterialField, index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = +e.target.value;
    if (type === 'shininess') {
      instance!.material.shininess = value;
    } else {
      instance!.material[type][index] = value;
    }
    instance?.render();
  }

  const handleChangeLight = (type: any, index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = +e.target.value;
    (instance!.light as any)[type][index] = value;
    instance?.render();
  }

  useEffect(() => {
    if (ref.current) {
      const animateGL = new AnimateGL(ref);
      setInstance(animateGL);
      animateGL.add(geometryMap[EGeometry.Cubic]);
      animateGL.render();
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
          <MenuItem onClick={() => toggleGeometry(EGeometry.Cubic)}>正方体</MenuItem>
        </Menu>
        <div style={{ display: 'flex' }}>
          <canvas width={640} height={480} ref={ref} />
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
                x: <input defaultValue={instance.position[0]} type="range" min={-1000} max={1000} onChange={(e) => {
                  instance!.position[0] = +e.target.value;
                  instance?.render();
                }} />
                <br />
                y: <input defaultValue={instance.position[1]} type="range" min={-1000} max={1000} onChange={(e) => {
                  instance!.position[1] = +e.target.value;
                  instance?.render();
                }} />
                <br />
                z: <input defaultValue={instance.position[2]} type="range" min={-1000} max={1000} onChange={(e) => {
                  instance!.position[2] = +e.target.value;
                  instance?.render();
                }} />
              </PanelContent>
            </Panel>
            <Panel>
              <PanelTitle>材质</PanelTitle>
              <PanelContent>
                {
                  ['ambient', 'diffuse', 'specular'].map((v) => {
                    const arr = instance?.material[v as TMaterialField] as number[] || [];
                    return (
                      <div key={v}>
                        {v}:
                        <br />
                        <input type="range" min={0} max={1} step={0.01} defaultValue={arr[0]} onChange={(e) => handleChangeMaterial(v as TMaterialField, 0, e)} />
                        <input type="range" min={0} max={1} step={0.01} defaultValue={arr[1]} onChange={(e) => handleChangeMaterial(v as TMaterialField, 1, e)} />
                        <input type="range" min={0} max={1} step={0.01} defaultValue={arr[2]} onChange={(e) => handleChangeMaterial(v as TMaterialField, 2, e)} />
                        <br />
                      </div>
                    )
                  })
                }
                shininess: <br />
                <input type="text" defaultValue={instance?.material.shininess} onBlur={(e) => handleChangeMaterial('shininess', -1, e)} />
              </PanelContent>
            </Panel>
            <Panel>
              <PanelTitle>灯光 color</PanelTitle>
              <PanelContent>
                <input type="range" min={0} max={1} step={0.01} defaultValue={instance?.light.color[0]} onChange={(e) => handleChangeLight('color', 0, e)} />
                <input type="range" min={0} max={1} step={0.01} defaultValue={instance?.light.color[1]} onChange={(e) => handleChangeLight('color', 1, e)} />
                <input type="range" min={0} max={1} step={0.01} defaultValue={instance?.light.color[2]} onChange={(e) => handleChangeLight('color', 2, e)} />
              </PanelContent>
            </Panel>
            <Panel>
              <PanelTitle>灯光 direction</PanelTitle>
              <PanelContent>
                <input type="range" min={-1000} max={-1} step={1} defaultValue={instance?.light.direction[0]} onChange={(e) => handleChangeLight('direction', 0, e)} />
                <input type="range" min={-1000} max={-1} step={1} defaultValue={instance?.light.direction[1]} onChange={(e) => handleChangeLight('direction', 1, e)} />
                <input type="range" min={-1000} max={-1} step={1} defaultValue={instance?.light.direction[2]} onChange={(e) => handleChangeLight('direction', 2, e)} />
              </PanelContent>
            </Panel>
            <Panel>
              <PanelTitle>灯光 position</PanelTitle>
              <PanelContent>
                <input type="range" min={-1000} max={1000} step={1} defaultValue={instance?.light.position[0]} onChange={(e) => handleChangeLight('position', 0, e)} />
                <input type="range" min={-1000} max={1000} step={1} defaultValue={instance?.light.position[1]} onChange={(e) => handleChangeLight('position', 1, e)} />
                <input type="range" min={-1000} max={1000} step={1} defaultValue={instance?.light.position[2]} onChange={(e) => handleChangeLight('position', 2, e)} />
              </PanelContent>
            </Panel>
          </div>}
        </div>
      </Content>
    </Container>
  );
};

export default Geometry;