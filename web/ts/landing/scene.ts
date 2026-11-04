import {
  ACESFilmicToneMapping, AdditiveBlending, CanvasTexture, Color, DirectionalLight, Fog, HemisphereLight, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, Object3D, PerspectiveCamera, PMREMGenerator, PointLight, Scene, SphereGeometry, Sprite, SpriteMaterial, SRGBColorSpace, Vector2, Vector3, WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { FrameGuard, cameraAt, loopDistance, routeAt, routeLength, scrollProgress, type CameraKey, type V3 } from "./path";

/* The live landing scene: the devices exported from Blender (tools/landing/build_scene.py),
   one packet crossing them, and a camera that follows the page scroll. Colours come
   from the page's tokens, not from this file. */

export interface SceneHandle {
  stop(): void;
}

export interface SceneOptions {
  canvas: HTMLCanvasElement;
  modelUrl: string;
  onReady(): void;
  onSlow(): void;
}

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/* Blender is Z-up and the exporter turns that into Y-up: (x, y, z) becomes (x, z, -y). */
const fromBlender = (x: number, y: number, z: number): V3 => ({ x, y: z, z: -y });

const ROUTE: V3[] = [
  fromBlender(-9, 3, 0.55),
  fromBlender(-4.5, 0, 0.55),
  fromBlender(0, -3, 0.55),
  fromBlender(4.5, 0, 0.55),
  fromBlender(9, 3, 0.55),
];

export const KEYS: CameraKey[] = [
  { at: 0.0, position: { x: 8, y: 14, z: 21 }, look: { x: -6.6, y: 0, z: 0.5 } },
  { at: 0.25, position: { x: -8.5, y: 3.4, z: 5.2 }, look: { x: -5.4, y: 0.4, z: -0.6 } },
  { at: 0.5, position: { x: 3.2, y: 3.6, z: 9.5 }, look: { x: 0.2, y: 0.4, z: 2.2 } },
  { at: 0.75, position: { x: 0, y: 15.5, z: 6 }, look: { x: 0, y: 0, z: 0 } },
  { at: 1.0, position: { x: 0, y: 9, z: 19 }, look: { x: 0, y: 0.2, z: -1 } },
];

export async function startScene(options: SceneOptions): Promise<SceneHandle> {
  const { canvas } = options;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const stage = new Color(css("--stage") || "#05080d");
  const scene = new Scene();
  scene.background = stage;
  scene.fog = new Fog(stage, 28, 62);

  const camera = new PerspectiveCamera(36, 1, 0.1, 120);
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.2;

  scene.add(new HemisphereLight(new Color("#9db8e8"), stage, 0.35));
  const key = new DirectionalLight(new Color("#cfe0ff"), 2.1);
  key.position.set(-6, 12, 8);
  scene.add(key);
  const rim = new PointLight(new Color(css("--packet") || "#e8590c"), 16, 26, 1.8);
  rim.position.set(9, 6, -7);
  scene.add(rim);

  const gltf = await new GLTFLoader().loadAsync(options.modelUrl);
  scene.add(gltf.scene);
  gltf.scene.traverse((o: Object3D) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    // The stage floor is only there to catch light: keep it dark and matte so nothing glares off it.
    if (mesh.name === "floor") {
      const floor = mesh.material as MeshStandardMaterial;
      floor.color.multiplyScalar(0.3);
      floor.roughness = 0.75;
      floor.metalness = 0.1;
    }
  });

  // The travelling light: a bright core plus a wide soft halo that the bloom pass spreads further.
  const packetColor = new Color(css("--packet") || "#e8590c");
  const packet = new Mesh(new SphereGeometry(0.26, 24, 16), new MeshBasicMaterial({ color: packetColor.clone().multiplyScalar(3.2) }));
  // The halo is a soft round gradient drawn here in code (no image file), so it has no hard edge.
  const glow = document.createElement("canvas");
  glow.width = glow.height = 128;
  const g = glow.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,0.95)");
    grad.addColorStop(0.18, "rgba(255,255,255,0.45)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.1)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
  }
  const halo = new Sprite(new SpriteMaterial({ map: new CanvasTexture(glow), color: packetColor, blending: AdditiveBlending, depthWrite: false, transparent: true }));
  halo.scale.set(3.4, 3.4, 1);
  packet.add(halo);
  scene.add(packet);
  const packetLight = new PointLight(packetColor, 14, 7, 1.8);
  packet.add(packetLight);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new Vector2(1, 1), 0.5, 0.55, 0.72);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const resize = () => {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  const pointer = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const length = routeLength(ROUTE);
  const guard = new FrameGuard(34, 150);
  const eye = new Vector3();
  const target = new Vector3();
  let progress = 0;
  let smoothProgress = 0;
  let running = true;
  let last = performance.now();
  const start = last;
  let first = true;

  const frame = (now: number) => {
    if (!running) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    if (guard.add(now - last)) {
      running = false;
      options.onSlow();
      return;
    }
    last = now;

    progress = scrollProgress(window.scrollY, document.documentElement.scrollHeight, window.innerHeight);
    smoothProgress += (progress - smoothProgress) * Math.min(1, dt * 5);
    const cam = cameraAt(KEYS, smoothProgress);
    eye.set(cam.position.x + pointer.x * 0.5, cam.position.y - pointer.y * 0.3, cam.position.z);
    target.set(cam.look.x, cam.look.y, cam.look.z);
    camera.position.copy(eye);
    camera.lookAt(target);

    const p = routeAt(ROUTE, loopDistance((now - start) / 1000, 2.6, length, 1.4));
    packet.position.set(p.x, p.y, p.z);

    composer.render();
    if (first) {
      first = false;
      options.onReady();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  return {
    stop() {
      running = false;
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      composer.dispose();
      renderer.dispose();
      pmrem.dispose();
    },
  };
}
