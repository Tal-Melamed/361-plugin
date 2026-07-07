// Maps state → presentation, identical effects to the bugbox widget:
// html classes drive the feature CSS (see ui/styles.ts) and a font-scale var
// drives the root font-size. Fully reversible (reset removes them).
import { FONT_SIZES, type A11yState } from "../core/state";

export function applyToDOM(s: Readonly<A11yState>): void {
  const root = document.documentElement;
  root.style.setProperty("--a11y-font-scale", FONT_SIZES[s.fontSize] ?? FONT_SIZES[0]);
  root.classList.toggle("a11y-high-contrast", s.highContrast);
  root.classList.toggle("a11y-grayscale", s.grayscale);
  root.classList.toggle("a11y-highlight-links", s.highlightLinks);
  root.classList.toggle("a11y-big-cursor", s.bigCursor);
}
