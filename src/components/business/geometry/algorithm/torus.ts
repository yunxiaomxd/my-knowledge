export default function torus() {
  const radius = 100, tube = 40, radialSegments = 24, tubularSegments = 48, arc = Math.PI * 2;

  const positions: number[] = [], indices: number[] = [];

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

      // center.x = radius * Math.cos( u );
      // center.y = radius * Math.sin( u );
      // normal.subVectors( vertex, center ).normalize();

      // normals.push( normal.x, normal.y, normal.z );

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

  return { positions, indices, primitiveType: 'TRIANGLES' };
}