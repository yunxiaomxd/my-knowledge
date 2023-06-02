import { normalize, subtractVectors } from "../gl";

export default function sphere(center: number[], radius = 1, widthSegments = 64, heightSegments = 64, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const grid = [];
  let index = 0;

  widthSegments = Math.max( 3, Math.floor( widthSegments ) );
  heightSegments = Math.max( 2, Math.floor( heightSegments ) );

  const thetaEnd = Math.min( thetaStart + thetaLength, Math.PI );

  // 生成顶点数据
  for ( let iy = 0; iy <= heightSegments; iy ++ ) {
    const verticesRow = [];
    const v = iy / heightSegments;

    let uOffset = 0;
    if ( iy == 0 && thetaStart == 0 ) {
      uOffset = 0.5 / widthSegments;
    } else if ( iy == heightSegments && thetaEnd == Math.PI ) {
      uOffset = - 0.5 / widthSegments;
    }

    for ( let ix = 0; ix <= widthSegments; ix ++ ) {
      const u = ix / widthSegments;

      // vertex
      const x = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength ) + center[0];
      const y = radius * Math.cos( thetaStart + v * thetaLength ) + center[1];
      const z = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength ) + center[2];
      const pos = [x, y, z];
      positions.push(...pos);

      // normal
      const distance = subtractVectors(pos, center);
      const normal = normalize(distance);
      normals.push(...normal);

      // uv
      uvs.push( u + uOffset, 1 - v );

      verticesRow.push( index ++ );
    }
    grid.push( verticesRow );

  }

  // indices

  for ( let iy = 0; iy < heightSegments; iy ++ ) {
    for ( let ix = 0; ix < widthSegments; ix ++ ) {
      const a = grid[ iy ][ ix + 1 ];
      const b = grid[ iy ][ ix ];
      const c = grid[ iy + 1 ][ ix ];
      const d = grid[ iy + 1 ][ ix + 1 ];

      if ( iy !== 0 || thetaStart > 0 ) indices.push( a, b, d );
      if ( iy !== heightSegments - 1 || thetaEnd < Math.PI ) indices.push( b, c, d );
    }
  }

  return {
    positions,
    indices,
    normals,
    primitiveType: 'TRIANGLES',
  }
}