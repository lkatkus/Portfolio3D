import * as THREE from "three";

export class Track {
  curve: THREE.CatmullRomCurve3;
  mesh: THREE.Mesh;

  constructor(points: THREE.Vector3[]) {
    this.curve = this.initCurve(points);
    this.mesh = this.initMesh();
  }

  private initCurve(points: THREE.Vector3[]) {
    const curve = new THREE.CatmullRomCurve3(points);

    return curve;
  }

  private initMesh() {
    const { curve } = this;

    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, curve.points.length, 0.01, 8, false),
      new THREE.MeshBasicMaterial({
        color: "red",
        wireframe: true,
      })
    );

    return mesh;
  }
}
