import * as THREE from "three";
import type { Game } from "./Game";

export class Scene {
  game: Game;
  currentScene: THREE.Scene;

  constructor(game: Game) {
    const scene = new THREE.Scene();

    scene.background = new THREE.Color("#e2e4e7");

    this.game = game;
    this.currentScene = scene;

    this.createPointsGrid();
  }

  createPointsGrid() {
    const rows = 50;
    const cols = 50;
    const spacing = 0.5;
    const positions = [];

    for (let x = -cols / 2; x < cols / 2; x++) {
      for (let y = -rows / 2; y < rows / 2; y++) {
        positions.push(x * spacing, y * spacing, -5);
      }
    }

    const material = new THREE.PointsMaterial({
      color: "#b3b7bd",
      size: 0.035,
      // sizeAttenuation: true,
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );

    const points = new THREE.Points(geometry, material);
    this.currentScene.add(points);

    return points;
  }
}
