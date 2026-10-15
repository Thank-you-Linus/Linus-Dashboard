import { SceneColor } from "../types/homeassistant/data/linus_dashboard";

/**
 * Below this temperature a white scene reads as warm, above it as cool.
 */
const WARM_KELVIN_LIMIT = 4000;

/**
 * Convert a detected scene color to a Mushroom chip color.
 *
 * The only converter of scene colors: RGB becomes "#rrggbb", a white
 * temperature becomes a Mushroom palette name ("amber" warm, "light-blue" cool).
 *
 * @param color - A color detected by the backend
 * @returns The chip color, or undefined if the color is unusable
 */
export function toChipColor(color?: SceneColor): string | undefined {
  if (!color) {
    return undefined;
  }

  if (Array.isArray(color.rgb) && color.rgb.length === 3) {
    return `#${color.rgb
      .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0"))
      .join("")}`;
  }

  if (typeof color.kelvin === "number") {
    return color.kelvin < WARM_KELVIN_LIMIT ? "amber" : "light-blue";
  }

  return undefined;
}

/**
 * Resolve the color of a scene chip: a manually chosen color wins over the
 * dominant detected color; nothing known gives undefined (neutral chip).
 *
 * @param manual - Color chosen in the integration options ("#rrggbb")
 * @param detected - Colors detected by the backend, dominant first
 */
export function resolveSceneChipColor(manual?: string, detected?: SceneColor[]): string | undefined {
  return manual ?? toChipColor(detected?.[0]);
}
