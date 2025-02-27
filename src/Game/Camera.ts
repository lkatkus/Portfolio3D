import * as THREE from "three";

export class Camera {
  camera: THREE.PerspectiveCamera;
  initialPosition: THREE.Vector3;
  initialTarget: THREE.Vector3;

  constructor(
    fov: number,
    aspectRatio: number,
    position: THREE.Vector3,
    target: THREE.Vector3
  ) {
    const camera = new THREE.PerspectiveCamera(fov, aspectRatio);

    camera.position.copy(position);
    camera.lookAt(target);

    this.camera = camera;
    this.initialPosition = position;
    this.initialTarget = target;
  }

  reset() {
    const { camera, initialPosition, initialTarget } = this;

    camera.position.copy(initialPosition);
    camera.lookAt(initialTarget);
  }

  update(aspectRatio: number) {
    const { camera } = this;

    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();
  }
}
