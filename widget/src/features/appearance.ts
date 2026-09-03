// Applies button appearance (accent color + corner) to the widget root.
// Re-appliable: data-* gives instant defaults, live config can override.
import type { Appearance } from "../core/config";

export function applyAppearance(root: HTMLElement, a: Appearance): void {
  root.style.setProperty("--a11y-accent", a.accent || "#000000");
  root.classList.toggle("a11y-pos-right", a.position === "bottom-right");
}
