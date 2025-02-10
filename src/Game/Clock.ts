import * as THREE from "three";

export class Clock {
  clock: THREE.Clock;

  previousTime: number;
  elapsedTime: number;
  deltaTime: number;

  constructor() {
    this.previousTime = 0;
    this.elapsedTime = 0;
    this.deltaTime = 0;

    this.clock = new THREE.Clock();
  }

  update() {
    const { clock } = this;

    this.elapsedTime = clock.getElapsedTime();
    this.deltaTime = this.elapsedTime - this.previousTime;
    this.previousTime = this.elapsedTime;
  }
}
