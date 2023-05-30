import { normalize } from "../gl";

export default function sphere(center, radius = 1, widthSegments = 32, heightSegments = 16, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI ) {
  widthSegments = Math.max( 3, Math.floor( widthSegments ) );
  heightSegments = Math.max( 2, Math.floor( heightSegments ) );

  const thetaEnd = Math.min( thetaStart + thetaLength, Math.PI );

  let index = 0;
  const grid = [];

  // buffers

  const indices = [];
  const positions = [];
  const normals = [];
  // const uvs = [];

  // generate vertices, normals and uvs

  for ( let iy = 0; iy <= heightSegments; iy ++ ) {

    const verticesRow = [];

    const v = iy / heightSegments;

    // special case for the poles

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

      positions.push( x, y, z );

      // normal

      const normal = normalize([x, y, z]);
      normals.push( ...normal );

      // uv

      // uvs.push( u + uOffset, 1 - v );

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

  // build geometry

  // this.setIndex( indices );
  // this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
  // this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
  // this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );
  return { positions, indices, normals, primitiveType: 'TRIANGLES' };
}