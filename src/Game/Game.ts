import { Lights } from "./Lights";
import { Renderer } from "./Renderer";
import { Scene } from "./Scene";
import { Entities } from "./Entities";
import { RayCaster } from "./RayCaster";
import { Clock } from "./Clock";
import { Director } from "./Director";
import { Debug } from "./Debug";
import { Operator } from "./Operator";
import { Scenographer } from "./Scenographer";

export class Game {
  screen: {
    width: number;
    height: number;
    aspectRatio: number;
  };

  debug: Debug;
  clock: Clock;
  director: Director;
  operator: Operator;
  scenographer: Scenographer;
  scene: Scene;
  lights: Lights;
  renderer: Renderer;
  entities: Entities;
  rayCaster: RayCaster;

  constructor() {
    this.screen = this.initScreen();

    this.debug = new Debug();
    this.clock = new Clock();
    this.scene = new Scene(this);
    this.director = new Director(this);
    this.operator = new Operator(this);
    this.scenographer = new Scenographer(this);
    this.lights = new Lights(this);
    this.renderer = new Renderer(this);
    this.entities = new Entities(this);
    this.rayCaster = new RayCaster(this);

    this.initListeners();
  }

  initScreen() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      aspectRatio: window.innerWidth / window.innerHeight,
    };
  }

  initListeners() {
    const { operator, renderer } = this;

    window.addEventListener("resize", () => {
      const updatedScreen = {
        width: window.innerWidth,
        height: window.innerHeight,
        aspectRatio: window.innerWidth / window.innerHeight,
      };

      this.screen = updatedScreen;

      operator.updateCameras();
      renderer.update();
    });
  }

  update() {
    const { clock, director, entities: producer, operator, rayCaster } = this;

    clock.update();
    director.update();
    producer.update();
    rayCaster.update();
    operator.update();
  }

  isPortrait() {
    const { screen } = this;

    return screen.height > screen.width;
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
