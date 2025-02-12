import { Lights } from "./Lights";
import { Renderer } from "./Renderer";
import { Scene } from "./Scene";
import { Camera } from "./Camera";
import { Entities } from "./Entities";
import { RayCaster } from "./RayCaster";
import { Clock } from "./Clock";
import { Director } from "./Director";

export class Game {
  screen: { width: number; height: number };

  clock: Clock;
  director: Director;
  scene: Scene;
  lights: Lights;
  renderer: Renderer;
  camera: Camera;
  entities: Entities;
  rayCaster: RayCaster;

  constructor() {
    this.screen = this.initScreen();

    this.director = new Director(this);
    this.clock = new Clock();
    this.scene = new Scene(this);
    this.lights = new Lights(this);
    this.renderer = new Renderer(this);
    this.camera = new Camera(this);
    this.entities = new Entities(this);
    this.rayCaster = new RayCaster(this);

    this.initListeners();
  }

  initScreen() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  initListeners() {
    const { camera, renderer } = this;

    window.addEventListener("resize", () => {
      const updatedScreen = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      this.screen = updatedScreen;

      camera.update();
      renderer.update();
    });
  }

  update() {
    const { clock, director, rayCaster } = this;

    clock.update();
    director.update();
    rayCaster.update();
  }

  render() {
    const { renderer } = this;

    renderer.render();
  }

  draw() {
    this.update();
    this.render();

    window.requestAnimationFrame(this.draw.bind(this));
  }

  start() {
    window.requestAnimationFrame(this.draw.bind(this));
  }
}
