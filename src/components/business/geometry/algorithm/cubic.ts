export default function cubic(width: number, height: number, depth: number, center: number[]) {
  const [x, y, z] = center;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const halfDepth = depth / 2;

  /**
   *     4 -------  5
   *    /|         /|
   *   0 -------  1 |
   *   | |        | |
   *   | 6 -------| 7
   *   |/         |/ 
   *   2 -------  3
   */

  const positions = [
    x - halfWidth, y + halfHeight, z + halfDepth,
    x + halfWidth, y + halfHeight, z + halfDepth,
    x - halfWidth, y - halfHeight, z + halfDepth,
    x + halfWidth, y - halfHeight, z + halfDepth,

    x - halfWidth, y + halfHeight, z - halfDepth,
    x + halfWidth, y + halfHeight, z - halfDepth,
    x - halfWidth, y - halfHeight, z - halfDepth,
    x + halfWidth, y - halfHeight, z - halfDepth,
  ];

  const indices = [
    // 前
    0, 2, 1,
    1, 2, 3,

    // 右
    1, 3, 5,
    5, 3, 7,

    // 后
    5, 7, 4,
    4, 7, 6,

    // 左
    4, 6, 0,
    0, 6, 2,

    // 上
    0, 1, 4,
    1, 5, 4,

    // 下
    3, 2, 7,
    2, 6, 7,
  ];

  const normals: number[] = [
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,

    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,

    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,

    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
  ];

  return {
    positions,
    indices,
    normals,
    primitiveType: 'TRIANGLES',
  }
}