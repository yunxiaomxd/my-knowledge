export default function plane(width: number, depth: number, stepWidth: number, stepDepth: number) {
  const positions = [
    -100, 0, 60,
    100, 0, 60,
    -100, 0, -40,
  ];

  const indices = [0, 1, 2];
  const normals = [0, 1, 0];

  // const positions: number[] = [];
  // const normals: number[] = [];
  // const indices: number[] = [];

  // // 先取多少份，然后逆置精确的步进尺寸
  // const widthSegments = Math.floor(width / stepWidth);
  // const depthSegments = Math.floor(depth / stepDepth);
  // const segmentWidth = width / widthSegments;
  // const segmentDepth = depth / depthSegments;

  // const halfWidth = width / 2;
  // const halfDepth = depth / 2;


  // // 行 - 列，获取每一行的点
  // let rowIndex = 0;
  // for (let z = -halfDepth; z < halfDepth; z += segmentDepth) {
  //   let colIndex = 0;
  //   for (let x = -halfWidth; x < halfWidth; x += segmentWidth) {
  //     positions.push(x, 0, z);

  //     // 每个顶点的法线
  //     normals.push(0, 1, 0);

  //     // 索引
  //     if (rowIndex < widthSegments && colIndex < depthSegments) {
  //       const currentIndex = rowIndex * widthSegments + colIndex;
  //       const neighborRightColIndex = currentIndex + 1;
  //       const neighborDownRowIndex = (rowIndex + 1) * widthSegments + colIndex;
  //       const neighborDownRowColIndex = neighborDownRowIndex + 1;
  //       indices.push(currentIndex, neighborDownRowIndex, neighborRightColIndex);
  //       indices.push(currentIndex, neighborDownRowColIndex, neighborRightColIndex);
  //     }
  //     colIndex++;
  //   }
  //   rowIndex++;
  // }

  console.log(positions);
  // const segmentWidth = width / widthSegments;
  // const segmentHeight = height / heightSegments;

  // const positions = [];
  // const normals = [];
  // const indices = [];

  // const halfWidth = width / 2;
  // const halfHeight = height / 2;

  // let index = 0;

  // // 生成顶点、法线和索引
  // for (let y = -halfHeight; y < halfHeight; y += segmentHeight) {
  //   for (let x = -halfWidth; x < halfWidth; x += segmentWidth) {
  //     // 生成当前顶点的坐标，并进行小数点处理
  //     const vertexX = parseFloat(x.toFixed(2));
  //     const vertexY = parseFloat(y.toFixed(2));
  //     positions.push(vertexX, vertexY, 0);

  //     // 生成当前顶点的法线
  //     normals.push(0, 0, 1);

  //     // 生成索引
  //     const rowLength = widthSegments;
  //     const currentRow = Math.floor(index / widthSegments);
  //     const nextRow = currentRow + 1;
  //     const currentCol = index % widthSegments;

  //     // 生成当前顶点和下一行顶点之间的三角形索引
  //     if (currentCol < rowLength && nextRow < heightSegments) {
  //       const segmentIndex = index / (segmentWidth / segmentHeight);
  //       indices.push(segmentIndex, segmentIndex + 1, segmentIndex + widthSegments);
  //       indices.push(segmentIndex + 1, segmentIndex + widthSegments + 1, segmentIndex + widthSegments);
  //     }

  //     index++;
  //   }
  // }

  return {
    positions,
    indices,
    normals,
    // primitiveType: 'LINE_STRIP'
    primitiveType: 'TRIANGLES',
  }
}