import * as THREE from "three";

export class Track {
  curve: THREE.CatmullRomCurve3;
  mesh: THREE.Mesh;

  constructor(model: any) {
    this.curve = this.initCurve(model);
    this.mesh = this.initMesh();
  }

  private initCurve(model: any) {
    const positions = model.geometry.attributes.position.array;
    const curvePoints = [];

    for (let i = 0; i < positions.length; i += 3) {
      curvePoints.push(
        new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2])
      );
    }

    const curve = new THREE.CatmullRomCurve3(curvePoints);

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
