import GUI from "lil-gui";

export class Debug {
  isEnabled: boolean;
  gui: GUI;

  constructor() {
    const gui = new GUI();

    this.isEnabled = false;
    this.gui = gui;

    this.init();
  }

  init() {
    const { gui } = this;

    let paramsString = new URL(document.location.toString()).searchParams;
    let searchParams = new URLSearchParams(paramsString);

    if (!searchParams.has("debug")) {
      gui.hide();
    } else {
      this.isEnabled = true;

      const loaderEl = document.getElementById("debugContainer")!;
      loaderEl.classList.remove("hidden");
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
