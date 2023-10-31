import Camera from "../camera/camera";
import Quaternion from "./quaternion";
import Spherical from "./spherical";
import Vector from "./vector";

export default class SpaceControl {
  element: HTMLCanvasElement;
  elementRect: DOMRect;
  camera: Camera;

  twoPi = 2 * Math.PI;

  quaternion: Quaternion;
  quaternionInv: Quaternion;

  offset = new Vector();

  start = new Vector();
  end = new Vector();

  maxAngle = Math.PI;
  minAngle = 0;

  sphericalSum = new Spherical();
  sphericalDelta = new Spherical();

  constructor(element: HTMLCanvasElement, camera: Camera) {
    this.element = element;
    this.elementRect = element.getBoundingClientRect();
    this.camera = camera;

    this.quaternion = new Quaternion().setRotateAxisFromCamera(camera.up, new Vector(0, 1, 0));
    this.quaternionInv = this.quaternion.clone().invert();
  }

  setAngle(coord: Vector) {
    const { element, twoPi } = this;
    this.end.copy(coord);

    const moveX = this.end.x - this.start.x;
    const moveY = this.end.y - this.start.y;

    this.sphericalDelta.theta -= twoPi * moveX / element.clientHeight; // 左右
    this.sphericalDelta.phi -= twoPi * moveY / element.clientHeight; // 上下

    this.start.copy(this.end);
  }

  makeSafe() {
    const EPS = 0.00002;
    this.sphericalSum.phi = Math.max(this.minAngle + EPS, Math.min(this.maxAngle - EPS, this.sphericalSum.phi));
  }

  onMouseDown = (coord: Vector) => {
    this.start.copy(coord);
  }

  onMouseMove(coord: Vector) {
    this.setAngle(coord);

    const { camera, offset, quaternion } = this;
    const { position } = camera;

    // 相机围绕视点旋转，四元数运算 qvq
    offset.copy(position).applyQuaternion(quaternion);

    // x,y,z 转球坐标
    this.sphericalSum.getSphericalFromVector(offset);

    this.sphericalSum.phi += this.sphericalDelta.phi;
    this.sphericalSum.theta += this.sphericalDelta.theta;

    this.makeSafe();

    // 球坐标转 3D 坐标系
    offset.setFromSpherical(this.sphericalSum);

    // 四元数运算 qvq
    offset.applyQuaternion(this.quaternionInv);

    /**
     * 更新相机位置
     * 复制 target，以 target 为球心，offset 为半径完成观察点的转换
     */
    this.camera.position.copy(this.camera.target).add(offset);

    // 更新相机坐标系
    this.camera.lookAt(this.camera.target);

    // 重置临时坐标记录
    this.sphericalDelta.reset();
  }
}