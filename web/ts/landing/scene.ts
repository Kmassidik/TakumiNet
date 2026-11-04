import {
  AmbientLight, Box3, CanvasTexture, Color, DirectionalLight, Group, HemisphereLight, Mesh, MeshPhysicalMaterial, NeutralToneMapping,
  Object3D, PerspectiveCamera, PMREMGenerator, RepeatWrapping, Scene, Sprite, SpriteMaterial, SRGBColorSpace, Vector3, WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FrameGuard, blinkScale, damp, gaze, pickSlot, poseAt, stand, type Slot } from "./motion";

/* Takumi, the mascot, as a live 3D model. He is built in Blender (tools/landing/build_takumi.py)
   and stands in whichever page slot is nearest the middle of the window, strikes that slot's
   pose, looks at the pointer and blinks. */

export interface SceneHandle {
  stop(): void;
}

export interface SceneOptions {
  canvas: HTMLCanvasElement;
  modelUrl: string;
  onReady(): void;
  onSlow(): void;
}

const DEPTH = 1400; // distance of the camera, in pixels, so one world unit is one pixel at the mascot
const NODES = ["body", "head", "earL", "earR", "eyeL", "eyeR", "armL", "armR", "legL", "legR", "scarf"] as const;
type NodeName = (typeof NODES)[number];

function softBlob(size: number, stops: Array<[number, string]>): CanvasTexture {
  // Drawn here in code, so there is no image file and no hard edge.
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (const [at, color] of stops) grad.addColorStop(at, color);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  return new CanvasTexture(c);
}

function furBump(): CanvasTexture {
  // Fine random grey speckle: it makes the plush surface catch the light unevenly, like fur.
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  if (g) {
    const img = g.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 110 + Math.floor(Math.random() * 90);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(7, 7);
  return t;
}

export async function startScene(options: SceneOptions): Promise<SceneHandle> {
  const { canvas } = options;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(new Color("#ffffff"), 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 10, DEPTH * 3);
  camera.position.set(0, 0, DEPTH);
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  scene.add(new AmbientLight(new Color("#ffffff"), 0.35));
  scene.add(new HemisphereLight(new Color("#ffffff"), new Color("#cdd5df"), 0.9));
  const key = new DirectionalLight(new Color("#fff6ec"), 2.3);
  key.position.set(-300, 500, 700);
  scene.add(key);
  const fill = new DirectionalLight(new Color("#dbe8ff"), 0.9);
  fill.position.set(500, 100, 500);
  scene.add(fill);

  const gltf = await new GLTFLoader().loadAsync(options.modelUrl);
  const model = gltf.scene;
  const bump = furBump();
  model.traverse((o: Object3D) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    const m = mesh.material as MeshPhysicalMaterial;
    if (m && (m.name === "fur" || m.name === "fur_shade")) {
      m.bumpMap = bump;
      m.bumpScale = 0.9;
      m.needsUpdate = true;
    }
  });

  const parts = {} as Record<NodeName, Object3D>;
  for (const name of NODES) {
    const part = model.getObjectByName(name);
    if (!part) throw new Error(`the model has no "${name}"`);
    parts[name] = part;
  }
  const eyeHome = { L: parts.eyeL.position.clone(), R: parts.eyeR.position.clone() };

  const box = new Box3().setFromObject(model);
  const modelHeight = Math.max(0.001, box.max.y - box.min.y);
  model.position.y -= box.min.y; // feet on the ground of the group
  const mascot = new Group();
  mascot.add(model);
  scene.add(mascot);

  const shadow = new Sprite(new SpriteMaterial({ map: softBlob(128, [[0, "rgba(20,28,40,0.34)"], [0.55, "rgba(20,28,40,0.14)"], [1, "rgba(20,28,40,0)"]]), transparent: true, depthWrite: false }));
  scene.add(shadow);

  const resize = () => {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = (2 * Math.atan(h / 2 / DEPTH) * 180) / Math.PI;
    camera.updateProjectionMatrix();
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  const pointer = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  let reactUntil = 0;
  let hopStart = -10;
  const onDown = (e: Event) => {
    if ((e.target as HTMLElement | null)?.closest?.("[data-takumi-slot]")) {
      reactUntil = performance.now() / 1000 + 1.6;
      hopStart = performance.now() / 1000;
    }
  };
  window.addEventListener("pointerdown", onDown, { passive: true });

  const guard = new FrameGuard(34, 150);
  const cur = { x: 0, y: 0, scale: 1, armL: 0.12, armR: 0.12, headTilt: 0, headNod: 0, bob: 0.01, lean: 0, yaw: 0 };
  let activeSlot = -1;
  let running = true;
  let first = true;
  let last = performance.now();
  const start = last / 1000;
  const probe = new Vector3();

  const frame = (now: number) => {
    if (!running) return;
    const rawDt = (now - last) / 1000;
    const dt = Math.min(0.1, rawDt);
    if (guard.add(now - last)) {
      running = false;
      options.onSlow();
      return;
    }
    last = now;
    const t = now / 1000 - start;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const nodes = [...document.querySelectorAll<HTMLElement>("[data-takumi-slot]")];
    const slots: Slot[] = nodes.map((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, width: r.width, height: r.height, pose: el.dataset.pose ?? "idle", side: (el.dataset.side as Slot["side"]) ?? "center" };
    });
    const pick = pickSlot(slots, vh);
    if (pick >= 0) {
      if (pick !== activeSlot) {
        if (activeSlot >= 0) hopStart = now / 1000;
        activeSlot = pick;
      }
      const slot = slots[pick]!;
      const target = stand(slot, vw, vh, modelHeight);
      const snap = first ? 1000 : 7;
      cur.x = damp(cur.x, target.x, snap, dt);
      cur.y = damp(cur.y, target.y, snap, dt);
      cur.scale = damp(cur.scale, target.scale, snap, dt);

      // a wave to say hello on arrival, then the slot's own pose; a click makes him jump for joy
      const intro = slot.pose === "wave" && t > 4.5 ? "idle" : slot.pose;
      const name = now / 1000 < reactUntil ? "happy" : intro;
      const pose = poseAt(name, t);
      cur.armL = damp(cur.armL, pose.armL, 9, dt);
      cur.armR = damp(cur.armR, pose.armR, 9, dt);
      cur.headTilt = damp(cur.headTilt, pose.headTilt, 7, dt);
      cur.headNod = damp(cur.headNod, pose.headNod, 7, dt);
      cur.bob = damp(cur.bob, pose.bob, 5, dt);
      const turn = slot.side === "left" ? 0.4 : slot.side === "right" ? -0.4 : 0;
      cur.lean = damp(cur.lean, turn, 5, dt);
    }

    // the pointer, measured from where Takumi's face is on screen
    const faceX = cur.x + vw / 2;
    const faceY = vh / 2 - (cur.y + cur.scale * modelHeight * 0.68);
    const lookX = gaze((pointer.x - faceX) / (vw / 2));
    const lookY = gaze((pointer.y - faceY) / (vh / 2));

    const hopAge = now / 1000 - hopStart;
    const hop = hopAge >= 0 && hopAge < 0.55 ? Math.sin((hopAge / 0.55) * Math.PI) * 0.16 : 0;
    const bobY = (Math.sin(t * 2.4) * cur.bob + hop) * modelHeight * cur.scale;

    mascot.position.set(cur.x, cur.y + bobY, 0);
    mascot.scale.setScalar(cur.scale);
    mascot.rotation.y = cur.lean + lookX * 0.2;
    parts.armL.rotation.z = -cur.armL;
    parts.armR.rotation.z = cur.armR;
    parts.head.rotation.z = cur.headTilt;
    parts.head.rotation.x = cur.headNod + lookY * 0.12;
    parts.head.rotation.y = lookX * 0.22;
    const blink = blinkScale(t);
    for (const side of ["L", "R"] as const) {
      const eye = parts[`eye${side}`];
      eye.scale.y = blink;
      eye.position.x = eyeHome[side].x + lookX * 0.035;
      eye.position.y = eyeHome[side].y - lookY * 0.03;
    }

    probe.set(cur.x, cur.y - 4, -5);
    shadow.position.copy(probe);
    shadow.scale.set(modelHeight * cur.scale * 0.82, modelHeight * cur.scale * 0.13, 1);
    (shadow.material as SpriteMaterial).opacity = Math.max(0.35, 1 - hop * 2.2);

    renderer.render(scene, camera);
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
      window.removeEventListener("pointerdown", onDown);
      renderer.dispose();
      pmrem.dispose();
    },
  };
}
