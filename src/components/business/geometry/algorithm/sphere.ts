export default function sphere(xRadius: number, yRadius: number, zRadius: number, latitudeBands: number, longitudeBands: number, center: number[]) {
  const positions = [];
  const normals = [];
  const texCoords = [];
  const indices = [];

  // 生成顶点数据
  for (let lat = 0; lat <= latitudeBands; lat++) {
    const theta = lat * Math.PI / latitudeBands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lng = 0; lng <= longitudeBands; lng++) {
      const phi = lng * 2 * Math.PI / longitudeBands;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = xRadius * cosPhi * sinTheta + center[0];
      const y = yRadius * cosTheta + center[1];
      const z = zRadius * sinPhi * sinTheta + center[2];

      const u = 1 - (lng / longitudeBands);
      const v = 1 - (lat / latitudeBands);

      normals.push((x - center[0]) / xRadius);
      normals.push((y - center[1]) / yRadius);
      normals.push((z - center[2]) / zRadius);
      texCoords.push(u);
      texCoords.push(v);
      positions.push(x);
      positions.push(y);
      positions.push(z);
    }
  }

  // 生成索引数据
  for (let lat = 0; lat < latitudeBands; lat++) {
    for(let lng = 0; lng < longitudeBands; lng++) {
      const first = (lat * (longitudeBands + 1)) + lng;
      const second = first + longitudeBands + 1;

      indices.push(first);
      indices.push(second);
      indices.push(first + 1);

      indices.push(second);
      indices.push(second + 1);
      indices.push(first + 1);
    }
  }

  return {
    positions,
    indices,
    normals,
    primitiveType: 'TRIANGLES',
  }
}