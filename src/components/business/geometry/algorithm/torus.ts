import { subtractVectors, normalize } from '../gl';

export default function torus() {
  const radius = 100, tube = 40, radialSegments = 24, tubularSegments = 48, arc = Math.PI * 2;

  const positions: number[] = [], indices: number[] = [], normals: number[] = [];

  for ( let j = 0; j <= radialSegments; j ++ ) {

    for ( let i = 0; i <= tubularSegments; i ++ ) {

      const u = i / tubularSegments * arc;
      const v = j / radialSegments * Math.PI * 2;

      // vertex

      const x = ( radius + tube * Math.cos( v ) ) * Math.cos( u );
      const y = ( radius + tube * Math.cos( v ) ) * Math.sin( u );
      const z = tube * Math.sin( v ) - 1000;

      positions.push( x, y, z );

      // normal

      const normalX = radius * Math.cos( u );
      const normalY = radius * Math.sin( u );
      const normal = normalize(subtractVectors([x, y, z], [normalX, normalY, 0]));

      normals.push( ...normal );

      // uv

      // uvs.push( i / tubularSegments );
      // uvs.push( j / radialSegments );

    }

  }

  // generate indices

  for ( let j = 1; j <= radialSegments; j ++ ) {

    for ( let i = 1; i <= tubularSegments; i ++ ) {

      // indices

      const a = ( tubularSegments + 1 ) * j + i - 1;
      const b = ( tubularSegments + 1 ) * ( j - 1 ) + i - 1;
      const c = ( tubularSegments + 1 ) * ( j - 1 ) + i;
      const d = ( tubularSegments + 1 ) * j + i;

      // faces

      indices.push( a, b, d );
      indices.push( b, c, d );

    }

  }

  return { positions, indices, normals, primitiveType: 'TRIANGLES' };
}