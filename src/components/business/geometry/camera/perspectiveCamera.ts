import Camera from "./camera";
import { ECameraType } from "./const";
import { IPerspectiveCameraState } from "./interface";

/**
 * 透视相机
 */
export default class PerspectiveCamera extends Camera {
  type = ECameraType.Perspective;

  state: IPerspectiveCameraState = {
    fieldOfViewInRadians: 0,
    aspect: 0,
    near: 0,
    far: 0
  };

  /**
   * @param fieldOfViewInRadians 视野角度
   * @param aspect 宽高比
   * @param near 视景体近距离裁切面
   * @param far 视景体远距离裁切面
   */
  constructor(fieldOfViewInRadians: number, aspect: number, near: number, far: number) {
    super();
    this.state = { fieldOfViewInRadians, aspect, near, far };
    this.updateProjectionMatrix();
  }

  updateCameraState(state: Partial<IPerspectiveCameraState>) {
    this.state = { ...this.state, ...state };
    this.updateProjectionMatrix();
  }

  updateProjectionMatrix() {
    const { fieldOfViewInRadians, aspect, near, far } = this.state;
    this.projectionMatrix.perspective(fieldOfViewInRadians, aspect, near, far);
  }

}