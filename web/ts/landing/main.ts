import { chooseMode } from "./mode";
import { startScene, type SceneHandle } from "./scene";

/* Starts the live scene only where it helps: a computer with WebGL, for someone
   who has not asked for less motion. Everywhere else the poster stays. */
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
  if (!canvas || chooseMode({ phone, calm, webgl: webglAvailable() }) === "poster") {
    root.classList.add("poster-only");
    return;
  }
  try {
    handle = await startScene({
      canvas,
      modelUrl: "/landing/network.glb",
      onReady: () => root.classList.add("scene-ready"),
      onSlow: () => {
        root.classList.remove("scene-ready");
        root.classList.add("poster-only");
        handle?.stop();
      },
    });
  } catch {
    // A missing or damaged model, or a lost GL context: the poster is already showing.
    root.classList.remove("scene-ready");
    root.classList.add("poster-only");
  }
}

void begin();
