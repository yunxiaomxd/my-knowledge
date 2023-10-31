import Camera from "../camera/camera";
import SpaceControl from "./spaceControl";
import Vector from "./vector";

export type TMouseCallbackEventType = 'mousedown' | 'mousemove' | 'mouseup';
export type TMouseCallbackEvent = () => void;
export type TMouseCallbackEventMap = Partial<Record<TMouseCallbackEventType, TMouseCallbackEvent[]>>;

export default class MouseSchedule {
  canvas: HTMLCanvasElement;
  canvasRect: DOMRect;
  spaceControl: SpaceControl;
  camera: Camera;
  coord = new Vector();

  eventMap: TMouseCallbackEventMap = {};

  flag = false;

  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    this.canvas = canvas;
    this.canvasRect = canvas.getBoundingClientRect();
    this.camera = camera;
    this.spaceControl = new SpaceControl(canvas, camera);

    this.registNativeEvent();
  }

  registNativeEvent = () => {
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
  }

  registCallback = (type: TMouseCallbackEventType, cb: TMouseCallbackEvent) => {
    if (this.eventMap[type]) {
      this.eventMap[type]?.push(cb);
    } else {
      this.eventMap[type] = [cb];
    }
  }

  updateCamera = (camera: Camera) => {
    this.camera = camera;
  }

  doCallback = (type: TMouseCallbackEventType) => {
    const eventList = this.eventMap[type];
    if (eventList?.length) {
      for (let i = 0; i < eventList.length; i++) {
        eventList[i]();
      }
    }
  }

  transformScreen2Canvas = (e: MouseEvent) => {
    const { top, left, height, width } = this.canvasRect;
    const x = (e.clientX - left) / width * 2 - 1;
    const y = - ( (e.clientY - top) / height ) * 2 + 1;
    this.coord.set2D(x, y);

  }

  /**
   * 鼠标点击
   * @description 需要判断鼠标落下的点的的情况
   *  - step1: 使用 rayCaster 遍历物体
   *  - step2: 遍历物体使用包围盒计算
   *  - step3: 若非物体则判断为空间
   *  - step4: 读取配置是否允许鼠标操作
   *  - step5: 取出回调事件
   */
  handleMouseDown = (e: MouseEvent) => {
    const { transformScreen2Canvas, spaceControl } = this;
    this.flag = true;
    transformScreen2Canvas(e);
    // todo 需要判断当前是是否存在已选中的物体
    // rayCaster.setFromCamera(coords, camera);
    // const result = rayCaster.getIntersectObjects(list);
    // this.mouseControlType = result ? MouseControlType.TransformControl : MouseControlType.SpaceControl;
    // if (this.mouseControlType === MouseControlType.SpaceControl) {
      spaceControl.onMouseDown(this.coord);
    //   return;
    // }
    // transformControl.setRayCaster(rayCaster);
    // transformControl.attach(result.geometry);
    // transformControl.onMouseDown(coords);
    this.doCallback('mousedown');
  }

  handleMouseMove = (e: MouseEvent) => {
    if (!this.flag) {
      return;
    }
    const { spaceControl, transformScreen2Canvas } = this;
    transformScreen2Canvas(e);
    spaceControl.onMouseMove(this.coord);
    // const { schedules, getCanvasSize } = this;
    // const { spaceControl, transformControl } = schedules;
    // if (this.mouseControlType === MouseControlType.None) {
    //   return;
    // }
    // const coords = getCanvasSize(e);
    // if (this.mouseControlType === MouseControlType.SpaceControl) {
    //   spaceControl.onMouseMove(coords);
    // } else {
    //   transformControl.onMouseMove(coords);
    // }
    // this.callEvent('mousemove', e, this.mouseControlType);
    this.doCallback('mousemove');

  }

  handleMouseUp = () => {
    this.flag = false;
    // const { schedules: { transformControl } } = this;
    // transformControl.onMouseUp();
    // this.mouseControlType = MouseControlType.None;
  }
}