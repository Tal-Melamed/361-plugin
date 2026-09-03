// Site-owner protection behaviors, applied once at boot from the snippet config.
// Class-driven (CSS in ui/styles.ts) + a couple of listeners for media. All
// scoped to skip the widget's own UI (#a11y-widget-root).
import type { WidgetConfig } from "../core/config";

export function applyProtection(cfg: WidgetConfig): void {
  const html = document.documentElement;
  html.classList.toggle("a11y-protect-media", cfg.protectMedia);
  html.classList.toggle("a11y-no-select", cfg.disableTextSelection);
  html.classList.toggle("a11y-no-tap-highlight", cfg.removeTapHighlight);
  html.classList.toggle("a11y-no-link-preview", cfg.disableLinkLongPress);

  if (cfg.protectMedia) {
    // Block drag + context menu on media (CSS can't stop the context menu).
    const isMedia = (t: EventTarget | null) =>
      t instanceof Element && /^(IMG|VIDEO|PICTURE|SOURCE)$/.test(t.tagName) && !t.closest("#a11y-widget-root");
    document.addEventListener("dragstart", (e) => {
      if (isMedia(e.target)) e.preventDefault();
    });
    document.addEventListener(
      "contextmenu",
      (e) => {
        if (isMedia(e.target)) e.preventDefault();
      },
      { capture: true },
    );
  }
}
