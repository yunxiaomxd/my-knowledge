import Matrix from "../utils/matrix";
import Quaternion from "../utils/quaternion";
import Vector from "../utils/vector";
import { ECameraType } from "./const";
import { TCameraState } from "./interface";

export default abstract class Camera {
  abstract type: ECameraType;

  /** 相机缩放因子 */
  scale = new Vector(1, 1, 1);

  /** 相机四元数 - 用于相机坐标旋转 */
  quaternion = new Quaternion();

  /** 相机坐标 */
  position = new Vector();
  /** 相机目标 */
  target = new Vector();
  /** 上分量 */
  up = new Vector(0, 1, 0);

  /** 投影矩阵 */
  projectionMatrix = new Matrix();

  /** 相机矩阵 */
  cameraMatrix = new Matrix();

  /** 观察矩阵 */
  viewMatrix = new Matrix();

  /** 矩阵 */
  matrix = new Matrix();

  /** 更新相机状态 */
  abstract updateCameraState(state: TCameraState): void;

  /** 更新投影矩阵 */
  abstract updateProjectionMatrix(): void;

  /** 设置观察 */
  lookAt(target: Vector) {
    this.target.copy(target);
    this.matrix.compose(this.position, this.quaternion, this.scale);
    this.position.setFromMatrixPosition(this.matrix);
    this.updateViewMatrix();
    this.quaternion.setFromRotationMatrix(this.cameraMatrix);
  }

  /** 更新观察矩阵 */
  updateViewMatrix() {
    const { position, target, up } = this;
    this.cameraMatrix.lookAt(position, target, up);
    this.viewMatrix = this.cameraMatrix.invert();
  }
}