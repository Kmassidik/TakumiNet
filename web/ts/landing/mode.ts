/* Where the live 3D Takumi runs, and where the flat pictures of him stay. */
export interface Environment {
  phone: boolean; // a phone-sized screen
  calm: boolean; // the visitor asked for less motion
  webgl: boolean; // the browser can draw 3D
}

export type Mode = "live" | "flat";

export function chooseMode(env: Environment): Mode {
  return env.phone || env.calm || !env.webgl ? "flat" : "live";
}
