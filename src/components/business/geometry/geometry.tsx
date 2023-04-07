import { useEffect, useRef, useState } from "react";
import { init, createShader, createProgram, m4, degToRad } from "./gl";
import { vertex, fragment } from "./shader";
import { Container, Content, Menu, MenuItem } from "./styled";
import { torus } from "./algorithm";

enum EGeometry {
  Torus,
}

const Geometry = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [geometryData, setGeometryData] = useState<{ positions: number[]; indices: number[] }>({
    positions: [],
    indices: [],
  });

  const toggleGeometry = (type: EGeometry) => {
    if (type === EGeometry.Torus) {
      const data = torus();
      setGeometryData(data);
    }
  }

  useEffect(() => {
    if (ref.current && geometryData.positions.length > 0) {
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
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometryData.positions), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionLocation);

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometryData.indices), gl.STATIC_DRAW);

      const mvpLocation = gl.getUniformLocation(program, "u_mvp");

      let matrix = m4.identify();

      let x = 0;
      let y = 1;
      let z = 0;

      const render = () => {
        gl.useProgram(program);

        matrix = m4.xRotate(matrix, degToRad(x));
        matrix = m4.yRotate(matrix, degToRad(y));
        matrix = m4.zRotate(matrix, degToRad(z));
        gl.uniformMatrix4fv(mvpLocation, false, matrix);
        // uniforms.u_time += 0.01;
    
        // gl.uniform1f(uTimeLocation, uniforms.u_time);
        // gl.uniform2fv(uResolutionLocation, uniforms.u_resolution);
        // gl.uniform2fv(uMouseLocation, uniforms.u_mouse);
    
        const size = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
      
        const primitiveType = gl.TRIANGLES;
        const count = geometryData.indices.length;
        gl.drawElements(primitiveType, count, gl.UNSIGNED_SHORT, 0);
        // gl.drawArrays(primitiveType, offset, count);
    
        requestAnimationFrame(render);
      };
    
      render();
    }
  }, [ref, geometryData]);

  return (
    <Container>
      <div>几何绘制</div>
      <Content>
        <Menu>
          <MenuItem onClick={() => toggleGeometry(EGeometry.Torus)}>圆环</MenuItem>
        </Menu>
        <canvas width={640} height={480} ref={ref} />
      </Content>
    </Container>
  );
};

export default Geometry;