import Matrix from "./matrix";
import Quaternion from "./quaternion";
import Spherical from "./spherical";

export default class Vector {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  set2D(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  
  set(x: number, y: number, z: number, w?: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    if (w !== undefined) {
      this.w = w;
    }
    return this;
  }

  /**
   * 向量克隆
   */
  clone() {
    const { x, y, z, w } = this;
    return new Vector(x, y, z, w);
  }

  /**
   * 向量复制
   */
  copy(v: Vector) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  /**
   * 向量的叉积
   * - 计算垂直向量
   */
  cross(v: Vector) {
    const { x, y, z } = this;
    return new Vector(y * v.z - z * v.y, z * v.x - x * v.z, x * v.y - y * v.x);
  }

  /**
   * 向量的点积
   * - 角度计算
   * - 投影计算
   */
  dot(v: Vector) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /**
   * 向量的加法
   */
  add(v: Vector) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  /**
   * 向量的减法1
   */
  subtract(v: Vector) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  /**
   * 向量长度
   */
  length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  /**
   * 向量单位化
   */
  normalize() {
    const len = this.length();
    if (len > 0.00001) {
      this.x /= len;
      this.y /= len;
      this.z /= len;
      return this;
    }
    this.set(0, 0, 0);
    return this;
  }

  /**
   * 向量 - 四元数乘法
   */
  applyQuaternion(quaternion: Quaternion) {
    const x = this.x, y = this.y, z = this.z;
    const qx = quaternion.x, qy = quaternion.y, qz = quaternion.z, qw = quaternion.w;

    // calculate quaternion * vector
    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = - qx * x - qy * y - qz * z;

    // calculate result * inverse quaternion

    this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
    this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
    this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

    return this;
  }

  /**
   * 球坐标转向量
   */
  setFromSpherical(spherical: Spherical) {
    const { phi, theta, p } = spherical;
    const r = p * Math.sin(phi);

    this.x = r * Math.sin(theta);
    this.y = p * Math.cos(phi);
    this.z = r * Math.cos(theta);

    return this;
  }

  /**
   * 获取矩阵中的位移
   */
  setFromMatrixPosition( m: Matrix ) {

		const e = m.elements;

		this.x = e[ 12 ];
		this.y = e[ 13 ];
		this.z = e[ 14 ];

		return this;

	}
}