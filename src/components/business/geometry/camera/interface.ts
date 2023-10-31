/** 正交投影相机状态 */
export interface IProjectionCameraState {
  width: number;
  height: number;
  depth: number;
}

/** 透视投影相机状态 */
export interface IPerspectiveCameraState {
  fieldOfViewInRadians: number;
  aspect: number;
  near: number;
  far: number;
}

/** 相机状态 */
export type TCameraState = IProjectionCameraState & IPerspectiveCameraState;