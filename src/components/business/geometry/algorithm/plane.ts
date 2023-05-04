export default function plane(width: number, height: number, widthSegments = 1, heightSegments = 1) {
  const width_half = width / 2;
  const height_half = height / 2;

  const gridX = Math.floor( widthSegments );
  const gridY = Math.floor( heightSegments );

  const gridX1 = gridX + 1;
  const gridY1 = gridY + 1;

  const segment_width = width / gridX;
  const segment_height = height / gridY;

  //

  const indices = [];
  const positions = [];
  const normals = [];
  // const uvs = [];

  for ( let iy = 0; iy < gridY1; iy ++ ) {

    const y = iy * segment_height - height_half;

    for ( let ix = 0; ix < gridX1; ix ++ ) {

      const x = ix * segment_width - width_half;

      // positions.push( x, 0, - y );

      // normals.push( 0, 1, 0 );

      positions.push(x, 0, -y);

      normals.push(0, 1, 0);

      // uvs.push( ix / gridX );
      // uvs.push( 1 - ( iy / gridY ) );

    }

  }

  for ( let iy = 0; iy < gridY; iy ++ ) {

    for ( let ix = 0; ix < gridX; ix ++ ) {

      const a = ix + gridX1 * iy;
      const b = ix + gridX1 * ( iy + 1 );
      const c = ( ix + 1 ) + gridX1 * ( iy + 1 );
      const d = ( ix + 1 ) + gridX1 * iy;

      indices.push( a, b, d );
      indices.push( b, c, d );

    }

  }

  return {
    positions,
    indices,
    // primitiveType: 'LINE_STRIP'
    primitiveType: 'TRIANGLES',
  }
}