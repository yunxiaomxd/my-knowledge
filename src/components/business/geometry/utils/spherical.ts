import { clamp } from "./util";
import Vector from "./vector";

export default class Spherical {
  phi = 0;
  theta = 0;
  p = 1;

  reset() {
    this.phi = 0;
    this.theta = 0;
    this.p = 1;
  }

  getSphericalFromVector(vector: Vector) {
    const { x, y, z } = vector;

    // theta - 上下，phi - 左右
    const p = Math.sqrt(x ** 2 + y ** 2 + z ** 2);

    this.theta = p === 0 ? 0 : Math.atan2(x, z);
    this.phi = p === 0 ? 0 : Math.acos(clamp(-1, 1, y / p));
    this.p = p;

    return this;
  }
}