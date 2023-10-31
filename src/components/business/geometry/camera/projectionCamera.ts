import Camera from "./camera";
import { ECameraType } from "./const";
import { IProjectionCameraState } from "./interface";

/**
 * 正交相机
 */
export default class ProjectionCamera extends Camera {
  type = ECameraType.Projection;
  
  state: IProjectionCameraState = {
    width: 0,
    height: 0,
    depth: 0,
  };

  constructor(width: number, height: number, depth: number) {
    super();
    this.state = { width, height, depth };
    this.updateProjectionMatrix();
  }

  updateCameraState(state: Partial<IProjectionCameraState>) {
    this.state = { ...this.state, ...state };
    this.updateProjectionMatrix();
  }

  updateProjectionMatrix() {
    const { width, height, depth } = this.state;
    this.projectionMatrix.projection(width, height, depth);
  }
}