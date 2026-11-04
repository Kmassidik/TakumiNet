import { chooseMode } from "./mode";
import { startScene, type SceneHandle } from "./scene";

/* Starts the live scene only where it helps: a computer with WebGL, for someone
   who has not asked for less motion. Everywhere else the flat pictures of Takumi stay. */
const root = document.documentElement;
const canvas = document.getElementById("stage") as HTMLCanvasElement | null;
const phone = typeof matchMedia === "function" && matchMedia("(max-width: 599px), (max-height: 500px) and (pointer: coarse)").matches;
const calm = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglAvailable(): boolean {
  try {
    const probe = document.createElement("canvas");
    return !!(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch {
    return false;
  }
}

let handle: SceneHandle | null = null;

async function begin(): Promise<void> {
  if (!canvas || chooseMode({ phone, calm, webgl: webglAvailable() }) === "flat") {
    root.classList.add("flat-only");
    return;
  }
  try {
    handle = await startScene({
      canvas,
      modelUrl: "/landing/takumi.glb",
      onReady: () => root.classList.add("scene-ready"),
      onSlow: () => {
        root.classList.remove("scene-ready");
        root.classList.add("flat-only");
        handle?.stop();
      },
    });
  } catch {
    // A missing or damaged model, or a lost GL context: the flat pictures are already showing.
    root.classList.remove("scene-ready");
    root.classList.add("flat-only");
  }
}

void begin();
