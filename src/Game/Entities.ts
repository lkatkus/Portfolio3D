import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Game } from "./Game";
import { Entity } from "./Entity";
import { ENTITIES_CONFIG } from "./Entities.constants";

export class Entities {
  game: Game;
  group: THREE.Group;
  gltfLoader: GLTFLoader;
  textureLoader: THREE.TextureLoader;
  entities: Entity[];

  constructor(game: Game) {
    this.game = game;
    this.textureLoader = new THREE.TextureLoader();
    this.gltfLoader = new GLTFLoader();
    this.group = this.initGroup();
    this.entities = [];

    this.initModels();
  }

  initGroup() {
    const { game } = this;
    const { scene } = game;

    const group = new THREE.Group();

    scene.currentScene.add(group);

    return group;
  }

  async initModels() {
    const loadedEntities = await Promise.all(
      ENTITIES_CONFIG.map(([name, src, onBeforeAdd]) =>
        new Entity(name, src).load(onBeforeAdd)
      )
    );

    this.entities = loadedEntities;

    this.onInitEntities();
  }

  onInitEntities() {
    const { game, entities, group } = this;

    entities.forEach((entity) => {
      group.add(entity.group);
    });

    game.director.setReady("producer");
  }

  getEntityByName(name: string) {
    const { entities } = this;

    const entity = entities.find((entity) => entity.name === name);

    if (entity) {
      return entity;
    }

    throw new Error(`Missing Entity: ${name}`);
  }

  update() {
    const { game, entities } = this;
    const { clock } = game;

    entities.forEach((entity) => {
      const mixer = entity.mixer;

      // @TODO fix any
      const hasActiveActions = (mixer as any)._actions.some((action: any) =>
        action.isRunning()
      );

      if (hasActiveActions) {
        mixer.update(clock.deltaTime);
      }
    });
  }
}
