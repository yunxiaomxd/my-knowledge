export default function plane(width: number, depth: number, stepWidth: number, stepDepth: number) {
  // const positions = [
  //   -100, 0, 60,
  //   100, 0, 60,
  //   -100, 0, -40,
  // ];

  // const indices = [0, 1, 2];
  // const normals = [0, 1, 0];

  // const positions: number[] = [];
  // const indices: number[] = [];
  // const normals: number[] = [];

  // const rows = Math.ceil(depth / stepDepth);
  // const cols = Math.ceil(width / stepWidth);

  // let x = -width / 2;
  // let z = -depth / 2;

  // for (let row = 0; row < rows; row++) {
  //   for (let col = 0; col < cols; col++) {
  //     positions.push(x, 0, z);
  //     normals.push(0, 1, 0);

  //     if (row < rows - 1 && col < cols - 1) {
  //       const currentIndex = row * cols + col;
  //       const neighborCol = currentIndex + 1;
  //       const nextRow = (row + 1) * cols + col;
  //       const nextRowCol = nextRow + 1;
  //       indices.push(currentIndex, nextRow, nextRowCol);
  //       indices.push(currentIndex, nextRowCol, neighborCol);
  //     }

  //     x += stepWidth;
  //   }
  //   z += stepDepth;
  // }

   const positions = [
    -width, 0, depth,
    -width, 0, -depth,
    width, 0, -depth,
    width, 0, depth,
    // -width, depth, 0,
    // -width, -depth, 0,
    // width, -depth, 0,
    // width, depth, 0,
  ],
  indices = [
    0, 1, 2,
    // 0, 2, 3
  ],
  normals = [
    0, 1, 0,
    // 0, 1, 0,
  ];

  return {
    positions,
    indices,
    normals,
    // primitiveType: 'LINE_STRIP'
    primitiveType: 'TRIANGLES',
  }
}