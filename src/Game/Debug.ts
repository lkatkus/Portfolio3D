import GUI from "lil-gui";

export class Debug {
  gui: GUI;

  constructor() {
    const gui = new GUI();

    this.gui = gui;

    this.init();
  }

  init() {
    const { gui } = this;

    let paramsString = new URL(document.location.toString()).searchParams;
    let searchParams = new URLSearchParams(paramsString);

    if (!searchParams.has("debug")) {
      gui.hide();
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "h") {
        if (gui._hidden) {
          gui.show();
        } else {
          gui.hide();
        }
      }
    });
  }
}
