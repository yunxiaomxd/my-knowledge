// https://cs.nyu.edu/~perlin/noise/

import plane from "./plane";

const _p = [ 151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10,
  23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87,
  174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211,
  133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208,
  89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5,
  202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119,
  248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
  178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249,
  14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205,
  93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180 ];

for ( let i = 0; i < 256; i ++ ) {

 _p[ 256 + i ] = _p[ i ];

}

function fade( t: number ) {

 return t * t * t * ( t * ( t * 6 - 15 ) + 10 );

}

function lerp( t: number, a: number, b: number ) {

 return a + t * ( b - a );

}

function grad( hash: number, x: number, y: number, z: number ) {

 const h = hash & 15;
 const u = h < 8 ? x : y, v = h < 4 ? y : h == 12 || h == 14 ? x : z;
 return ( ( h & 1 ) == 0 ? u : - u ) + ( ( h & 2 ) == 0 ? v : - v );

}

function improvedNoise( x: number, y: number, z: number ) {

  const floorX = Math.floor( x ),
        floorY = Math.floor( y ),
        floorZ = Math.floor( z );

  const X = floorX & 255,
        Y = floorY & 255,
        Z = floorZ & 255;

  x -= floorX;
  y -= floorY;
  z -= floorZ;

  const xMinus1 = x - 1,
        yMinus1 = y - 1,
        zMinus1 = z - 1;

  const u = fade( x ),
        v = fade( y ),
        w = fade( z );

  const A = _p[ X ] + Y,
        AA = _p[ A ] + Z,
        AB = _p[ A + 1 ] + Z,
        B = _p[ X + 1 ] + Y,
        BA = _p[ B ] + Z,
        BB = _p[ B + 1 ] + Z;

  return lerp( w, lerp( v, lerp( u, grad( _p[ AA ], x, y, z ),
    grad( _p[ BA ], xMinus1, y, z ) ),
  lerp( u, grad( _p[ AB ], x, yMinus1, z ),
    grad( _p[ BB ], xMinus1, yMinus1, z ) ) ),
  lerp( v, lerp( u, grad( _p[ AA + 1 ], x, y, zMinus1 ),
    grad( _p[ BA + 1 ], xMinus1, y, zMinus1 ) ),
  lerp( u, grad( _p[ AB + 1 ], x, yMinus1, zMinus1 ),
    grad( _p[ BB + 1 ], xMinus1, yMinus1, zMinus1 ) ) ) );

}

export function lineNoise() {
  const positions: number[] = [
    // -1.0, 1.0, -0.5,
    // -1.0, -1.0, -0.3,
    // 1.0, 1.0, -0.2,
    -100, 20, 0,
    -71, -20, 0,
    -50, 20, 0,
    -21, -20, 0,
    0, 20, 0,
    34, -20, 0,
    70, -20, 0,
    100, 20, 0,
  ];

  for (let i = 0; i < positions.length / 3; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    const noise = improvedNoise(x, y, z);
    positions[i * 3 + 1] += noise;
  }

  return {
    positions,
    indices: [],
    normals: [],
    primitiveType: 'LINE_STRIP',
  }
}

function generateHeight( width: number, height: number ) {

  let seed = Math.PI / 4;
  const random = function () {

    const x = Math.sin( seed ++ ) * 10000;
    return x - Math.floor( x );

  };

  const size = width * height, data = new Uint8Array( size );
  const z = random() * 100;

  let quality = 1;

  for ( let j = 0; j < 4; j ++ ) {

    for ( let i = 0; i < size; i ++ ) {

      const x = i % width, y = ~ ~ ( i / width );
      data[ i ] += Math.abs( improvedNoise( x / quality, y / quality, z ) * quality * 1.75 );

    }

    quality *= 5;

  }

  return data;

}

export function surfaceNoise() {
  const worldWidth = 8, worldDepth = 8;
  const { positions, indices, primitiveType } = plane(100, 100, worldWidth - 1, worldDepth - 1);

  const noiseData = generateHeight(worldWidth, worldDepth);
  
  const copy = [...positions];
  for ( let i = 0, j = 0, l = positions.length; i < l; i ++, j += 3 ) {
    copy[ j + 1 ] = noiseData[ i ] * 10;
  }

  // console.log(copy);

  return {
    positions,
    indices,
    primitiveType,
  }
}
