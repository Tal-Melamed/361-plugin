// Site-owner protection behaviors. Can be (re)applied at runtime — the snippet's
// data-* config is applied instantly, then live config from the server overrides
// it. Class-driven CSS + media listeners bound once that read the live config.
import type { WidgetConfig } from "../core/config";

let live: WidgetConfig | null = null;
let bound = false;

export function applyProtection(cfg: WidgetConfig): void {
  live = cfg;
  const html = document.documentElement;
  html.classList.toggle("a11y-protect-media", cfg.protectMedia);
  html.classList.toggle("a11y-no-select", cfg.disableTextSelection);
  html.classList.toggle("a11y-no-tap-highlight", cfg.removeTapHighlight);
  html.classList.toggle("a11y-no-link-preview", cfg.disableLinkLongPress);
  html.classList.toggle("a11y-no-print", cfg.preventPrint);

  if (!bound) {
    bound = true;
    // Bound once; they consult the live config so a later update takes effect.
    const isMedia = (t: EventTarget | null) =>
      t instanceof Element && /^(IMG|VIDEO|PICTURE|SOURCE)$/.test(t.tagName) && !t.closest("#a11y-widget-root");
    document.addEventListener("dragstart", (e) => {
      if (live?.protectMedia && isMedia(e.target)) e.preventDefault();
    });
    document.addEventListener(
      "contextmenu",
      (e) => {
        if (live?.protectMedia && isMedia(e.target)) e.preventDefault();
      },
      { capture: true },
    );
    // Block copy unless the user is in a form field or the widget's own UI.
    document.addEventListener("copy", (e) => {
      if (!live?.preventCopy) return;
      const a = document.activeElement as HTMLElement | null;
      const allowed =
        a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.isContentEditable || a.closest("#a11y-widget-root"));
      if (!allowed) e.preventDefault();
    });
  }
}
