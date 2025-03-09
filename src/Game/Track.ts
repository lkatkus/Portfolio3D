import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

export class Track {
  curve: THREE.CatmullRomCurve3;
  mesh: Line2;

  constructor(points: THREE.Vector3[]) {
    this.curve = this.initCurve(points);
    this.mesh = this.initMesh(points);
  }

  private initCurve(points: THREE.Vector3[]) {
    const curve = new THREE.CatmullRomCurve3(points);

    return curve;
  }

  private initMesh(points: THREE.Vector3[]) {
    const mesh = new Line2(
      new LineGeometry().setFromPoints(points),
      new LineMaterial({
        color: "red",
        linewidth: 5,
      })
    );

    return mesh;
  }
}
