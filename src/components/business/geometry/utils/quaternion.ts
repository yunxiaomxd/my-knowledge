import Matrix from "./matrix";
import Vector from "./vector";

/**
 * 四元数
 * @description 应用于旋转
 * @example```
 * 四元数应用
 * v' = q v q^-1
 * 复数的旋转（2D）:
 * 4 + 1i 旋转 30° 后的公式应用 v' = (cos 30 + sin 30)(4 + 1i)
 * 复数的旋转（3D）:
 * xi + yj + zk 旋转 30° 后的公式应用 v' = (cos 30/2 + sin 30/2)(xi + yj + zk)
 * 三个虚部对应x，y，z的旋转角信息，
 * 按照四元数的旋转公式
 * 1、构造一个四元数和他的逆
 * 2、2d 坐标转球坐标计算旋转值
 * 3、通过四元数逆运算转换为旋转后的 3d 坐标
 * ```
 */
export default class Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;

  EPS = 0.000001;

  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  /**
   * 设置旋转轴
   * @param cameraUp camera up
   * @param axis 旋转轴
   */
  setRotateAxisFromCamera(cameraUp: Vector, axis: Vector) {
    let w = cameraUp.dot(axis);
    if (w < this.EPS) {
      w = 0;
      if (Math.abs(cameraUp.x) > Math.abs(axis.z)) {
        this.x = -cameraUp.y;
        this.y = cameraUp.x;
        this.z = 0;
      } else {
        this.x = 0;
        this.y = -cameraUp.z;
        this.z = cameraUp.y;
      }
    } else {
      const v = cameraUp.cross(axis);

      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
    }

    this.w = w;
    return this.normalize();
  }

  /**
   * 四元数的长度
   */
  length() {
    return Math.sqrt( this.x ** 2 + this.y ** 2 + this.z ** 2 + this.w ** 2 );
  }

  /**
   * 四元数单位化
   */
  normalize() {
    let l = this.length();

    if (l === 0) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 1;
    } else {
      l = 1 / l;
      this.x *= l;
      this.y *= l;
      this.z *= l;
      this.w *= l;
    }

    return this;
  }

  /**
   * 四元数的逆
   */
  invert() {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;

    return this;
  }

  /**
   * 克隆四元数
   */
  clone() {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  /**
   * 矩阵转四元数
   */
  setFromRotationMatrix( m: Matrix ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		const te = m.elements,

			m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ],
			m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ],
			m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ],

			trace = m11 + m22 + m33;

		if ( trace > 0 ) {

			const s = 0.5 / Math.sqrt( trace + 1.0 );

			this.w = 0.25 / s;
			this.x = ( m32 - m23 ) * s;
			this.y = ( m13 - m31 ) * s;
			this.z = ( m21 - m12 ) * s;

		} else if ( m11 > m22 && m11 > m33 ) {

			const s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

			this.w = ( m32 - m23 ) / s;
			this.x = 0.25 * s;
			this.y = ( m12 + m21 ) / s;
			this.z = ( m13 + m31 ) / s;

		} else if ( m22 > m33 ) {

			const s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

			this.w = ( m13 - m31 ) / s;
			this.x = ( m12 + m21 ) / s;
			this.y = 0.25 * s;
			this.z = ( m23 + m32 ) / s;

		} else {

			const s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

			this.w = ( m21 - m12 ) / s;
			this.x = ( m13 + m31 ) / s;
			this.y = ( m23 + m32 ) / s;
			this.z = 0.25 * s;

		}

		return this;

	}
}