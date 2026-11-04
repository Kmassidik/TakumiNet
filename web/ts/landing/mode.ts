/* Where the live scene runs, and where the still poster stays. */
export interface Environment {
  phone: boolean; // a phone-sized screen
  calm: boolean; // the visitor asked for less motion
  webgl: boolean; // the browser can draw 3D
}

export type Mode = "live" | "poster";

export function chooseMode(env: Environment): Mode {
  return env.phone || env.calm || !env.webgl ? "poster" : "live";
}
