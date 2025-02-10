import * as THREE from "three";
import type { Game } from "./Game";

export class Scene {
  game: Game;
  currentScene: THREE.Scene;

  constructor(game: Game) {
    const scene = new THREE.Scene();

    this.game = game;
    this.currentScene = scene;
  }
}
