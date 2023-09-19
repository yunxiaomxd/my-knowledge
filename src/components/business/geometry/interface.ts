export enum EPrimitiveType {
  LINE_STRIP = 'LINE_STRIP',
  TRIANGLES = 'TRIANGLES',
} 

export interface IRenderGeometry {
  // positionBuffer: WebGLBuffer;
  // normalBuffer?: WebGLBuffer;
  // indexBuffer?: WebGLBuffer;
  primitiveType: EPrimitiveType;
  positions: number[];
  indices: number[];
  normals: number[];
  id: string;
};

export interface IGeometry {
  positions: number[];
  indices: number[];
  normals: number[];
  primitiveType: EPrimitiveType;
};

export interface IBufferType {
  vertexBuffer: WebGLBuffer | null;
  indexBuffer: WebGLBuffer | null;
  normalBuffer: WebGLBuffer | null;
}